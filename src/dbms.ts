import { MicroDBDriver } from './driver';
import { MicroDBOptions } from './micro-db';
import { MicroDBJanitor } from './janitor';
import path from 'path';

export class MicroDBMS {
	private static folderPath = 'db';

	private static tables: Record<string, MicroDBDriver<unknown>> = {};

	static get allTables(): Record<string, MicroDBDriver<unknown>> {
		return { ...MicroDBMS.tables };
	}

	static globalJanitor: MicroDBJanitor | undefined = undefined;

	static setFolderPath = (folderPath: string) => {
		MicroDBMS.folderPath = folderPath;
	};

	static setJanitorCronjob = (cron: string | undefined) => {
		MicroDBMS.globalJanitor?.kill();
		const dbs = MicroDBMS.globalJanitor?.databases || [];
		if (cron) {
			MicroDBMS.globalJanitor = new MicroDBJanitor(cron);
			for (const db of dbs) {
				MicroDBMS.globalJanitor.registerDatabase(db);
			}
		} else {
			MicroDBMS.globalJanitor = undefined;
		}
	};

	static table = <T>(name: string, extraOptions: Partial<MicroDBOptions> = {}): MicroDBDriver<T> => {
		if (name in MicroDBMS.tables) {
			throw new Error(`Table ${name} already exists!`);
		}

		const driver = new MicroDBDriver<T>({
			fileName: path.join(MicroDBMS.folderPath, `${name}.db`),
			...extraOptions,
		});

		MicroDBMS.tables[name] = driver as MicroDBDriver<unknown>;

		return driver;
	};

	static deleteTable = (name: string) => {
		const driver = MicroDBMS.tables[name];

		if (driver) {
			driver.close();
			MicroDBMS.globalJanitor?.deleteDatabase(driver.dbRef);
			delete MicroDBMS.tables[name];
		}
	};
}
