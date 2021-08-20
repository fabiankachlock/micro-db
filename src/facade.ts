import type { MicroDBData, MicroDBOptions, WherePredicate, MicroDBEntry, Mutation } from './micro-db';
import { MicroDB } from './db';
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
	private ref: MicroDBDriver<T>;

	protected data: MicroDBData;

	constructor(options: Partial<MicroDBOptions>) {
		const db = new MicroDB({
			...options,
			janitorCronjob: undefined,
		});

		this.data = db.read();
		this.ref = new MicroDBDriver(db);
	}

	// close db
	public shutdown = () => this.ref.shutdown;

	// create a new record
	protected create = (object: T): string => this.ref.create(object);

	// select a record by db id
	protected select = (id: string): T | undefined => this.ref.select(id);

	// select first record that fulfill predicate
	protected selectWhere = (pred: WherePredicate<T>): MicroDBEntry<T> | undefined => this.ref.selectWhere(pred);

	// select all records that fulfill predicate
	protected selectAllWhere = (pred: WherePredicate<T>): MicroDBEntry<T>[] => this.ref.selectAllWhere(pred);

	// select all records
	protected selectAll = () => this.ref.selectAll();

	// update a record
	protected update = (id: string, object: Partial<T>): boolean => this.ref.update(id, object);

	// update first record that fulfill predicate
	protected updateWhere = (pred: WherePredicate<T>, object: Partial<T>): boolean => this.ref.updateWhere(pred, object);

	// update all records that fulfill predicate
	protected updateAllWhere = (pred: WherePredicate<T>, object: Partial<T>) => this.ref.updateAllWhere(pred, object);

	// mutate a record
	protected mutate = (id: string, mutation: Mutation<T, T>): boolean => this.ref.mutate(id, mutation);

	// mutate first record that fulfill predicate
	protected mutateWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>): boolean =>
		this.ref.mutateWhere(pred, mutation);

	// mutate all records that fulfill predicate
	protected mutateAllWhere = (pred: WherePredicate<T>, mutation: Mutation<T, T>) =>
		this.ref.mutateAllWhere(pred, mutation);

	protected mutateAll = <B>(mutation: Mutation<T, B>) => this.ref.mutateAll(mutation);

	// alias for mutateAll
	protected migrate = this.mutateAll;

	// delete a record
	protected delete = (id: string) => this.ref.delete(id);

	// delete first record that fulfill predicate
	protected deleteWhere = (pred: WherePredicate<T>): boolean => this.ref.deleteWhere(pred);

	// delete all records that fulfill predicate
	protected deleteAllWhere = (pred: WherePredicate<T>) => this.ref.deleteAllWhere(pred);

	// clear whole table
	protected flush = () => this.ref.flush();
}
