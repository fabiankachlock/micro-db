import { MicroDBBase } from './db';
import { MicroDBDriver } from './driver';
import { MicroDBJanitor } from './janitor';
import { MicroDBOptions } from './micro-db';

export const MicroDB = {
	new: (options: Partial<MicroDBOptions>) => new MicroDBDriver(options),

	table: (options: Partial<MicroDBOptions>) => new MicroDBDriver(options),

	database: (options: Partial<MicroDBOptions>) => new MicroDBBase(options),

	janitor: (cron: string, ...dbs: MicroDBBase[]) => new MicroDBJanitor(cron, ...dbs),
};

export { MicroDBMS } from './dbms';
export { MicroDBFacade } from './facade';
export { MicroDBDriver } from './driver';
export { MicroDBJanitor } from './janitor';
