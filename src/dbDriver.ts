import type { MicroDBOptions, DBEntry, DBMutation, WherePredicate, DBData } from './micro-db';
import { v4 as uuid } from 'uuid';
import { MicroDB } from './db';
import { MicroDBJanitor } from './janitor';

/**
 * The MicroDBDriver can be used as a facade to hide actual database operations.
 *
 * @example
 * export class UserDB extends MicroDBDriver<UserDBEntry> {
 * 	// initialize driver with options
 *	private static db = new UserDB({ name: 'users', fileName: 'db/users.db' });
 *
 * 	static logout = (id: string) => {
 * 		// use USerDB.db property to perform
 * 		UserDB.db.update(id, { ... })
 * 	}
 * }
 */
export class MicroDBDriver<T extends DBData> {
	private db: MicroDB;

	protected data: DBData;

	private janitor: MicroDBJanitor | undefined = undefined;

	constructor(options: Partial<MicroDBOptions>) {
		this.db = new MicroDB({
			...options,
			janitorCronjob: undefined,
		});
		this.data = this.db.read();

		if (options.janitorCronjob) {
			this.janitor = new MicroDBJanitor(options.janitorCronjob!, this.db);
		}
	}

	// close db
	public shutdown = () => {
		this.db.close();
	};

	// create a new record
	protected create = (object: T): string => {
		const id = uuid();
		this.db.write(id, object);
		this.data = this.db.read();
		return id;
	};

	// select a record by db id
	protected select = (id: string): T | undefined => {
		return this.data[id];
	};

	// select first record that fulfill predicate
	protected selectWhere = (pred: WherePredicate<T>): DBEntry<T> | undefined => {
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
	protected selectAllWhere = (pred: WherePredicate<T>): DBEntry<T>[] => {
		const objects: DBEntry<T>[] = [];
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
	protected selectAll = () => this.selectAllWhere(() => true);

	// update a record
	protected update = (id: string, object: Partial<T>): boolean => {
		if (id in this.data) {
			this.db.write(id, {
				...this.data[id],
				...object,
			});
			this.data = this.db.read();
			return true;
		}
		return false;
	};

	// update first record that fulfill predicate
	protected updateWhere = (pred: WherePredicate<T>, object: Partial<T>): boolean => {
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				this.update(key, {
					...this.data[key],
					...object,
				});
				this.data = this.db.read();
				return true;
			}
		}
		return false;
	};

	// update all records that fulfill predicate
	protected updateAllWhere = (pred: WherePredicate<T>, object: Partial<T>) => {
		const updates: DBData = {};
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				updates[key] = {
					...this.data[key],
					...object,
				};
			}
		}
		this.db.writeBatch(updates);
		this.data = this.db.read();
	};

	// mutate a record
	protected mutate = (id: string, mutation: DBMutation<T, T>): boolean => {
		if (id in this.data) {
			const object = this.data[id];
			this.db.write(id, mutation(object));
			this.data = this.db.read();
			return true;
		}
		return false;
	};

	// mutate first record that fulfill predicate
	protected mutateWhere = (pred: WherePredicate<T>, mutation: DBMutation<T, T>): boolean => {
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				const object = this.data[key];
				this.update(key, mutation(object));
				this.data = this.db.read();
				return true;
			}
		}
		return false;
	};

	// mutate all records that fulfill predicate
	protected mutateAllWhere = (pred: WherePredicate<T>, mutation: DBMutation<T, T>) => {
		const updates: DBData = {};
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				const object = this.data[key];
				updates[key] = mutation(object);
			}
		}
		this.db.writeBatch(updates);
		this.data = this.db.read();
	};

	protected mutateAll = <B>(mutation: DBMutation<T, B>) => {
		const updates: DBData = {};
		for (const [key, value] of Object.entries(this.data)) {
			updates[key] = mutation(value);
		}
		this.db.writeBatch(updates);
		this.data = this.db.read();
		// force clean db, because file size could double
		this.janitor?.cleanAll();
	};

	// alias for mutateAll
	protected migrate = this.mutateAll;

	// delete a record
	protected delete = (id: string) => {
		this.db.write(id, undefined);
		this.data = this.db.read();
	};

	// delete first record that fulfill predicate
	protected deleteWhere = (pred: WherePredicate<T>): boolean => {
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				this.delete(key);
				return true;
			}
		}
		return false;
	};

	// delete all records that fulfill predicate
	protected deleteAllWhere = (pred: WherePredicate<T>) => {
		const updates: DBData = {};
		for (const [key, value] of Object.entries(this.data)) {
			if (pred(value)) {
				updates[key] = undefined;
			}
		}
		this.db.writeBatch(updates);
	};
}
