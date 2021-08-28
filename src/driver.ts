import type { MicroDBOptions, MicroDBEntry, Mutation, WherePredicate, MicroDBData } from './micro-db';
import { v4 as uuid } from 'uuid';
import { MicroDBBase } from './db';
import { MicroDBJanitor } from './janitor';
import { MicroDBWatchable } from './watcher/watchable';

type ExtraArgument<T> = {
	driver: MicroDBDriver<T>;
};

// const defaultOptions: MicroDBDriverOptions = {
// 	...MicroDBDefaultOptions,
// 	injectId: false,
// 	idKeyName: '_id',
// };

export class MicroDBDriver<T> extends MicroDBWatchable<Record<string, T>, ExtraArgument<T>> {
	private _data: MicroDBData = {};

	private db: MicroDBBase;

	get _dbRef(): MicroDBBase {
		return this.db;
	}

	readonly janitor: MicroDBJanitor | undefined = undefined;

	_getCallbackArguments = (): ExtraArgument<T> => ({
		driver: this,
	});

	_currentValue = (): MicroDBData => this._data;

	constructor(options: Partial<MicroDBOptions> = {}) {
		super();

		this.db = new MicroDBBase({
			...options,
			janitorCronjob: undefined,
		});

		// const resolvedOptions: MicroDBDriverOptions = {
		// 	...defaultOptions,
		// 	...options,
		// };

		if (options.janitorCronjob) {
			this.janitor = new MicroDBJanitor(options.janitorCronjob, this.db);
		}
	}

	static forDatabase = <T>(db: MicroDBBase): MicroDBDriver<T> => {
		const driver = new MicroDBDriver<T>({});

		driver.close();
		driver.janitor?.kill();
		driver.db = db;
		driver._data = db.read();

		return driver;
	};

	// close db
	close = () => {
		this.db.close();
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
		return {
			...this._data[id],
			_id: id,
		};
	};

	// select first record that fulfill predicate
	selectWhere = (pred: WherePredicate<T>): MicroDBEntry<T> | undefined => {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(value)) {
				return {
					...value,
					_id: key,
				};
			}
		}
		return undefined;
	};

	// select all records that fulfill predicate
	selectAllWhere = (pred: WherePredicate<T>): MicroDBEntry<T>[] => {
		const objects: MicroDBEntry<T>[] = [];
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(value)) {
				objects.push({
					...value,
					_id: key,
				});
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
			if (pred(value)) {
				return this.update(key, object);
			}
		}
		return false;
	};

	// update all records that fulfill predicate
	updateAllWhere = (pred: WherePredicate<T>, object: Partial<T>) => {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(value)) {
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
	};

	// mutate a record
	mutate = (id: string, mutation: Mutation<T, T>): boolean => {
		if (id in this._data) {
			const object = this._data[id];
			this.db.write(id, mutation(object));
			this._data = this.db.read();
			this.valueChanged();
			return true;
		}
		return false;
	};

	// mutate first record that fulfill predicate
	mutateWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>): boolean => {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(value)) {
				return this.mutate(key, mutation);
			}
		}
		return false;
	};

	// mutate all records that fulfill predicate
	mutateAllWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>) => {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(value)) {
				updateCount += 1;
				const object = this._data[key];
				updates[key] = mutation(object);
			}
		}
		this.db.writeBatch(updates);
		this._data = this.db.read();
		if (updateCount > 0) this.valueChanged();
	};

	mutateAll = <B>(mutation: Mutation<T, B>) => {
		const updates: MicroDBData = {};
		for (const [key, value] of Object.entries(this._data)) {
			updates[key] = mutation(value);
		}
		this.db.writeBatch(updates);
		this._data = this.db.read();
		this.valueChanged();
		// force clean db, because file size could double
		MicroDBJanitor.cleanUp(this._dbRef);
	};

	// alias for mutateAll
	migrate = this.mutateAll;

	// delete a record
	delete = (id: string) => {
		const exists = id in this._data;

		if (exists) {
			this.db.write(id, undefined);
			this._data = this.db.read();
			this.valueChanged();
		}
	};

	// delete first record that fulfill predicate
	deleteWhere = (pred: WherePredicate<T>): boolean => {
		for (const [key, value] of Object.entries(this._data)) {
			if (pred(value)) {
				this.delete(key);
				return true;
			}
		}
		return false;
	};

	// delete all records that fulfill predicate
	deleteAllWhere = (pred: WherePredicate<T>) => {
		const updates: MicroDBData = {};
		let updateCount = 0;

		for (const [key, value] of Object.entries(this._data)) {
			if (pred(value)) {
				updateCount += 1;
				updates[key] = undefined;
			}
		}
		this.db.writeBatch(updates);
		if (updateCount > 0) this.valueChanged();
	};

	// clear whole table
	flush = () => this.deleteAllWhere(() => true);
}
