import type { MicroDBOptions, MicroDBEntry, Mutation, WherePredicate, MicroDBData } from './micro-db';
import { v4 as uuid } from 'uuid';
import { MicroDBBase } from './db';
import { MicroDBJanitor } from './janitor';

export class MicroDBDriver<T> {
	private _data: MicroDBData = {};

	private db: MicroDBBase;

	get _dbRef(): MicroDBBase {
		return this.db;
	}

	readonly janitor: MicroDBJanitor | undefined = undefined;

	constructor(options: Partial<MicroDBOptions> = {}) {
		this.db = new MicroDBBase({
			...options,
			janitorCronjob: undefined,
		});

		if (options.janitorCronjob) {
			this.janitor = new MicroDBJanitor(options.janitorCronjob, this.db);
		}
	}

	get data(): Record<string, T> {
		return this._data;
	}

	// close db
	shutdown = () => {
		this.db.close();
	};

	// create a new record
	create = (object: T): string => {
		const id = uuid();
		this.db.write(id, object);
		this._data = this.db.read();
		return id;
	};

	// select a record by db id
	select = (id: string): T | undefined => {
		return this.data[id];
	};

	// select first record that fulfill predicate
	selectWhere = (pred: WherePredicate<T>): MicroDBEntry<T> | undefined => {
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				return {
					id: key,
					value,
				};
			}
		}
		return undefined;
	};

	// select all records that fulfill predicate
	selectAllWhere = (pred: WherePredicate<T>): MicroDBEntry<T>[] => {
		const objects: MicroDBEntry<T>[] = [];
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				objects.push({
					id: key,
					value,
				});
			}
		}
		return objects;
	};

	// select all records
	selectAll = () => this.selectAllWhere(() => true);

	// update a record
	update = (id: string, object: Partial<T>): boolean => {
		if (id in this.data) {
			this.db.write(id, {
				...this.data[id],
				...object,
			});
			this._data = this.db.read();
			return true;
		}
		return false;
	};

	// update first record that fulfill predicate
	updateWhere = (pred: WherePredicate<T>, object: Partial<T>): boolean => {
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				this.update(key, {
					...this.data[key],
					...object,
				});
				this._data = this.db.read();
				return true;
			}
		}
		return false;
	};

	// update all records that fulfill predicate
	updateAllWhere = (pred: WherePredicate<T>, object: Partial<T>) => {
		const updates: MicroDBData = {};
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				updates[key] = {
					...this.data[key],
					...object,
				};
			}
		}
		this.db.writeBatch(updates);
		this._data = this.db.read();
	};

	// mutate a record
	mutate = (id: string, mutation: Mutation<T, T>): boolean => {
		if (id in this.data) {
			const object = this.data[id];
			this.db.write(id, mutation(object));
			this._data = this.db.read();
			return true;
		}
		return false;
	};

	// mutate first record that fulfill predicate
	mutateWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>): boolean => {
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				const object = this.data[key];
				this.update(key, mutation(object));
				this._data = this.db.read();
				return true;
			}
		}
		return false;
	};

	// mutate all records that fulfill predicate
	mutateAllWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>) => {
		const updates: MicroDBData = {};
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				const object = this.data[key];
				updates[key] = mutation(object);
			}
		}
		this.db.writeBatch(updates);
		this._data = this.db.read();
	};

	mutateAll = <B>(mutation: Mutation<T, B>) => {
		const updates: MicroDBData = {};
		for (const [key, value] of Object.entries(this.data)) {
			updates[key] = mutation(value);
		}
		this.db.writeBatch(updates);
		this._data = this.db.read();
		// force clean db, because file size could double
		this.janitor?.cleanAll();
	};

	// alias for mutateAll
	migrate = this.mutateAll;

	// delete a record
	delete = (id: string) => {
		this.db.write(id, undefined);
		this._data = this.db.read();
	};

	// delete first record that fulfill predicate
	deleteWhere = (pred: WherePredicate<T>): boolean => {
		for (const [key, value] of Object.entries(this.data)) {
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
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				updates[key] = undefined;
			}
		}
		this.db.writeBatch(updates);
	};

	// clear whole table
	flush = () => this.deleteAllWhere(() => true);

	// clean database file
	cleanUp = () => this.janitor?.cleanUp(this.db);
}
