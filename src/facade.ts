import type { MicroDBData, MicroDBOptions, WherePredicate, MicroDBEntry, Mutation } from './micro-db';
import { MicroDBBase } from './db';
import { MicroDBDriver } from './driver';

/**
 * The MicroDBFacade can be used as a facade to hide actual database operations.
 *
 * @example
 * export class UserDB extends MicroDBFacade<UserDBEntry> {
 * 	// initialize driver with options
 *	private static db = new UserDB({ name: 'users', fileName: 'db/users.db' });
 *
 * 	static logout = (id: string) => {
 * 		// use USerDB.db property to perform
 * 		UserDB.db.update(id, { ... })
 * 	}
 * }
 */
export class MicroDBFacade<T extends MicroDBData> {
	protected db: MicroDBDriver<T>;

	protected get data(): MicroDBData {
		return this.db._currentValue;
	}

	constructor(options: Partial<MicroDBOptions> = {}) {
		const db = new MicroDBBase({
			...options,
			janitorCronjob: undefined,
		});

		this.db = MicroDBDriver.forDatabase(db);
	}

	// close db
	protected close = () => this.db.close;

	// create a new record
	protected create = (object: T): Promise<string> => this.db.create(object);

	// select a record by db id
	protected select = (id: string): Promise<T | undefined> => this.db.select(id);

	// select first record that fulfill predicate
	protected selectWhere = (pred: WherePredicate<T>): Promise<MicroDBEntry<T> | undefined> => this.db.selectWhere(pred);

	// select all records that fulfill predicate
	protected selectAllWhere = (pred: WherePredicate<T>): Promise<MicroDBEntry<T>[]> => this.db.selectAllWhere(pred);

	// select all records
	protected selectAll = () => this.db.selectAll();

	// update a record
	protected update = (id: string, object: Partial<T>): Promise<boolean> => this.db.update(id, object);

	// update first record that fulfill predicate
	protected updateWhere = (pred: WherePredicate<T>, object: Partial<T>): Promise<boolean> =>
		this.db.updateWhere(pred, object);

	// update all records that fulfill predicate
	protected updateAllWhere = (pred: WherePredicate<T>, object: Partial<T>) => this.db.updateAllWhere(pred, object);

	// mutate a record
	protected mutate = (id: string, mutation: Mutation<T, T>): Promise<boolean> => this.db.mutate(id, mutation);

	// mutate first record that fulfill predicate
	protected mutateWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>): Promise<boolean> =>
		this.db.mutateWhere(pred, mutation);

	// mutate all records that fulfill predicate
	protected mutateAllWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>) =>
		this.db.mutateAllWhere(pred, mutation);

	protected mutateAll = <B>(mutation: Mutation<T, B>) => this.db.mutateAll(mutation);

	// alias for mutateAll
	protected migrate = this.mutateAll;

	// delete a record
	protected delete = (id: string) => this.db.delete(id);

	// delete first record that fulfill predicate
	protected deleteWhere = (pred: WherePredicate<T>): Promise<boolean> => this.db.deleteWhere(pred);

	// delete all records that fulfill predicate
	protected deleteAllWhere = (pred: WherePredicate<T>) => this.db.deleteAllWhere(pred);

	// clear whole table
	protected flush = () => this.db.flush();
}
