import type { MicroDBOptions, MicroDBEntry, Mutation, WherePredicate, MicroDBData } from './micro-db';
import { v4 as uuid } from 'uuid';
import { MicroDBBase } from './db';
import { MicroDBJanitor } from './janitor';
import { MicroDBPropertyWatchable } from './watcher/propertyWatchable';
import { withId } from './helper';

type ExtraArgument<T> = {
	driver: MicroDBDriver<T>;
};

export class MicroDBDriver<T> extends MicroDBPropertyWatchable<Record<string, T>, ExtraArgument<T>> {
	private _data: MicroDBData = {};

	private db: MicroDBBase;

	get dbRef(): MicroDBBase {
		return this.db;
	}

	get isInitialized(): boolean {
		return this.db.isInitialized;
	}

	readonly janitor: MicroDBJanitor | undefined = undefined;

	// @internal
	_getCallbackArguments = (): ExtraArgument<T> => ({
		driver: this,
	});

	// @internal
	_currentValue = (): MicroDBData => this._data;

	constructor(options: Partial<MicroDBOptions> = {}) {
		super();

		this.db = new MicroDBBase({
			...options,
			janitorCronjob: undefined,
		});

		if (options.janitorCronjob) {
			this.janitor = new MicroDBJanitor(options.janitorCronjob, this.db);
		}
	}

	static forDatabase<T>(db: MicroDBBase): MicroDBDriver<T> {
		const driver = new MicroDBDriver<T>({});

		driver.close();
		driver.db = db;
		driver._data = db.read();

		return driver;
	}

	async initialize() {
		await this.db.initialize();
	}

	// close db
	async close() {
		await this.db.close();
		await this.janitor?.kill();
	}

	// create a new record
	async create(object: T): Promise<string> {
		const id = uuid();
		await this.db.write(id, object);
		this._data = await this.db.read();
		this.valueChanged();
		return id;
	}

	// select a record by db id
	async select(id: string): Promise<MicroDBEntry<T> | undefined> {
		const data = this._data[id];

		if (data) {
			return withId(data, id);
		}
		return undefined;
	}

	// select first record that fulfill predicate
	async selectWhere(pred: WherePredicate<T>): Promise<MicroDBEntry<T> | undefined> {
		for (const [key, value] of Object.entries(this._data)) {
			const valueWithId = withId(value, key);
			if (pred(valueWithId)) {
				return valueWithId;
			}
		}
		return undefined;
	}

	// select all records that fulfill predicate
	async selectAllWhere(pred: WherePredicate<T>): Promise<MicroDBEntry<T>[]> {
		const objects: MicroDBEntry<T>[] = [];
		for (const [key, value] of Object.entries(this._data)) {
			const valueWithId = withId(value, key);
			if (pred(valueWithId)) {
				objects.push(valueWithId);
			}
		}
		return objects;
	}

	// select all records
	async selectAll() {
		return await this.selectAllWhere(() => true);
	}

	// update a record
	async update(id: string, object: Partial<T>): Promise<boolean> {
		if (id in this._data) {
			await this.db.write(id, {
				...this._data[id],
				...object,
			});
			this._data = await this.db.read();
			this.valueChanged();
			return true;
		}
		return false;
	}

	// update first record that fulfill predicate
	async updateWhere(pred: WherePredicate<T>, object: Partial<T>): Promise<boolean> {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				return await this.update(key, object);
			}
		}
		return false;
	}

	// update all records that fulfill predicate
	async updateAllWhere(pred: WherePredicate<T>, object: Partial<T>): Promise<number> {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				updateCount += 1;
				updates[key] = {
					...this._data[key],
					...object,
				};
			}
		}

		await this.db.writeBatch(updates);
		this._data = await this.db.read();
		if (updateCount > 0) this.valueChanged();
		return updateCount;
	}

	// mutate a record
	async mutate(id: string, mutation: Mutation<T, T>): Promise<boolean> {
		if (id in this._data) {
			const object = this._data[id];
			const mutated = await mutation(object, id);
			await this.db.write(id, mutated ? mutated : object); // use reference of object if mutation returned void
			this._data = await this.db.read();
			this.valueChanged();
			return true;
		}
		return false;
	}

	// mutate first record that fulfill predicate
	async mutateWhere(pred: WherePredicate<T>, mutation: Mutation<T, T>): Promise<boolean> {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				return await this.mutate(key, mutation);
			}
		}
		return false;
	}

	// mutate all records that fulfill predicate
	async mutateAllWhere(pred: WherePredicate<T>, mutation: Mutation<T, T>): Promise<number> {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				updateCount += 1;
				const object = this._data[key];
				const mutated = await mutation(object, key);
				updates[key] = mutated ? mutated : object; // use reference of object if mutation returned void
			}
		}
		await this.db.writeBatch(updates);
		this._data = await this.db.read();
		if (updateCount > 0) this.valueChanged();
		return updateCount;
	}

	async mutateAll<B>(mutation: Mutation<T, B>): Promise<number> {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			updateCount++;
			const object = value;
			const mutated = await mutation(object, key);
			updates[key] = mutated ? mutated : object; // use reference of object if mutation returned void
		}
		await this.db.writeBatch(updates);
		this._data = await this.db.read();
		this.valueChanged();

		// force clean db, because file size could double
		await MicroDBJanitor.cleanUp(this.dbRef);
		return updateCount;
	}

	// delete a record
	async delete(id: string): Promise<boolean> {
		const exists = id in this._data;

		if (exists) {
			await this.db.write(id, undefined);
			this._data = await this.db.read();
			this.valueChanged();
			return true;
		}

		return false;
	}

	// delete first record that fulfill predicate
	async deleteWhere(pred: WherePredicate<T>): Promise<boolean> {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				this.delete(key);
				return true;
			}
		}
		return false;
	}

	// delete all records that fulfill predicate
	async deleteAllWhere(pred: WherePredicate<T>): Promise<number> {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				updateCount += 1;
				updates[key] = undefined;
			}
		}

		await this.db.writeBatch(updates);
		if (updateCount > 0) this.valueChanged();
		return updateCount;
	}

	// clear whole table
	async flush() {
		await this.deleteAllWhere(() => true);
	}
}

// TODO: Docs
// - Website
// - Where predicates must be sync
// - Mutations can be async

// TODO: performance testing
// single loop (like now)
// vs
// filter > map > Promise.all
