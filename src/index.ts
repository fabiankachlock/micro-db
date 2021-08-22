import { MicroDBBase } from './db';
import { MicroDBDriver } from './driver';
import { MicroDBJanitor } from './janitor';
import { MicroDBOptions } from './micro-db';

export class MicroDB<T> extends MicroDBDriver<T> {
	static table = <T>(options: Partial<MicroDBOptions>) => new MicroDBDriver<T>(options);

	static database = (options: Partial<MicroDBOptions>) => new MicroDBBase(options);

	static janitor = (cron: string, ...dbs: MicroDBBase[]) => new MicroDBJanitor(cron, ...dbs);
}

export { MicroDBMS } from './dbms';
export { MicroDBFacade } from './facade';
export { MicroDBDriver } from './driver';
export { MicroDBJanitor } from './janitor';
