import { MicroDBBase } from './db';
import { CronJob } from 'cron';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { MicroDBWatchable } from './watcher/watchable';

type ExtraArgument = {
	janitor: MicroDBJanitor;
};

// The MicroDBJanitor cleans up data overhead and reduces database file size.
// It can be used either as global instance for batching cleanups with registerDatabase & deleteDatabase or as db-personal instance
export class MicroDBJanitor extends MicroDBWatchable<{}, ExtraArgument> {
	private job: CronJob;

	private dbs: MicroDBBase[];

	get databases(): MicroDBBase[] {
		return this.dbs;
	}

	_getCallbackArguments = (): ExtraArgument => ({
		janitor: this,
	});

	_currentValue = (): {} => ({});

	constructor(cron: string = '00 00 00 * * *' /* every day at midnight */, ...dbs: MicroDBBase[]) {
		super();

		this.job = new CronJob(cron, this.cleanUpCallBack);
		this.job.start();
		this.dbs = dbs;
	}

	private cleanUpCallBack = async () => {
		this.valueChanged();
		for (const db of this.dbs) {
			MicroDBJanitor.cleanUp(db);
		}
	};

	public static cleanUp = async (db: MicroDBBase) => {
		const content = await fs.readFile(db.fileName);
		const data = db.dataSerializer.deserialize(content.toString('utf-8'));
		await fs.writeFile(db.fileName, db.dataSerializer.serializeAll(data));
	};

	public static cleanUpSync = (db: MicroDBBase) => {
		const content = fsSync.readFileSync(db.fileName);
		const data = db.dataSerializer.deserialize(content.toString('utf-8'));
		fsSync.writeFileSync(db.fileName, db.dataSerializer.serializeAll(data));
	};

	public cleanAll = this.cleanUpCallBack;

	public registerDatabase = (db: MicroDBBase) => {
		this.dbs.push(db);
	};

	public deleteDatabase = (db: MicroDBBase) => {
		this.dbs = this.dbs.filter(d => d.fileName !== db.fileName);
	};

	public kill = () => {
		this.job.stop();
	};
}
