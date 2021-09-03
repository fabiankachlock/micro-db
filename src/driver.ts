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

	static forDatabase = <T>(db: MicroDBBase): MicroDBDriver<T> => {
		const driver = new MicroDBDriver<T>({});

		driver.close();
		driver.db = db;
		driver._data = db.read();

		return driver;
	};

	// close db
	close = () => {
		this.db.close();
		this.janitor?.kill();
	};

	// create a new record
	create = (object: T): string => {
		const id = uuid();
		this.db.write(id, object);
		this._data = this.db.read();
		this.valueChanged();
		return id;
	};

	// select a record by db id
	select = (id: string): MicroDBEntry<T> | undefined => {
		const data = this._data[id];

		if (data) {
			return withId(data, id);
		}
		return undefined;
	};

	// select first record that fulfill predicate
	selectWhere = (pred: WherePredicate<T>): MicroDBEntry<T> | undefined => {
		for (const [key, value] of Object.entries(this._data)) {
			const valueWithId = withId(value, key);
			if (pred(valueWithId)) {
				return valueWithId;
			}
		}
		return undefined;
	};

	// select all records that fulfill predicate
	selectAllWhere = (pred: WherePredicate<T>): MicroDBEntry<T>[] => {
		const objects: MicroDBEntry<T>[] = [];
		for (const [key, value] of Object.entries(this._data)) {
			const valueWithId = withId(value, key);
			if (pred(valueWithId)) {
				objects.push(valueWithId);
			}
		}
		return objects;
	};

	// select all records
	selectAll = () => this.selectAllWhere(() => true);

	// update a record
	update = (id: string, object: Partial<T>): boolean => {
		if (id in this._data) {
			this.db.write(id, {
				...this._data[id],
				...object,
			});
			this._data = this.db.read();
			this.valueChanged();
			return true;
		}
		return false;
	};

	// update first record that fulfill predicate
	updateWhere = (pred: WherePredicate<T>, object: Partial<T>): boolean => {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				return this.update(key, object);
			}
		}
		return false;
	};

	// update all records that fulfill predicate
	updateAllWhere = (pred: WherePredicate<T>, object: Partial<T>): number => {
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
		this.db.writeBatch(updates);
		this._data = this.db.read();
		if (updateCount > 0) this.valueChanged();
		return updateCount;
	};

	// mutate a record
	mutate = (id: string, mutation: Mutation<T, T>): boolean => {
		if (id in this._data) {
			const object = this._data[id];
			const mutated = mutation(object, id);
			this.db.write(id, mutated ? mutated : object); // use reference of object if mutation returned void
			this._data = this.db.read();
			this.valueChanged();
			return true;
		}
		return false;
	};

	// mutate first record that fulfill predicate
	mutateWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>): boolean => {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				return this.mutate(key, mutation);
			}
		}
		return false;
	};

	// mutate all records that fulfill predicate
	mutateAllWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>): number => {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				updateCount += 1;
				const object = this._data[key];
				const mutated = mutation(object, key);
				updates[key] = mutated ? mutated : object; // use reference of object if mutation returned void
			}
		}
		this.db.writeBatch(updates);
		this._data = this.db.read();
		if (updateCount > 0) this.valueChanged();
		return updateCount;
	};

	mutateAll = <B>(mutation: Mutation<T, B>) => {
		const updates: MicroDBData = {};
		for (const [key, value] of Object.entries(this._data)) {
			const object = value;
			const mutated = mutation(object, key);
			updates[key] = mutated ? mutated : object; // use reference of object if mutation returned void
		}
		this.db.writeBatch(updates);
		this._data = this.db.read();
		this.valueChanged();
		// force clean db, because file size could double
		MicroDBJanitor.cleanUpSync(this.dbRef);
	};

	// delete a record
	delete = (id: string): boolean => {
		const exists = id in this._data;

		if (exists) {
			this.db.write(id, undefined);
			this._data = this.db.read();
			this.valueChanged();
			return true;
		}

		return false;
	};

	// delete first record that fulfill predicate
	deleteWhere = (pred: WherePredicate<T>): boolean => {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				this.delete(key);
				return true;
			}
		}
		return false;
	};

	// delete all records that fulfill predicate
	deleteAllWhere = (pred: WherePredicate<T>): number => {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(withId(value, key))) {
				updateCount += 1;
				updates[key] = undefined;
			}
		}
		this.db.writeBatch(updates);
		if (updateCount > 0) this.valueChanged();
		return updateCount;
	};

	// clear whole table
	flush = () => this.deleteAllWhere(() => true);
}
