import { MicroDBBase } from './db';
import schedule, { Job } from 'node-schedule';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { MicroDBWatchable } from './watcher/watchable';

type ExtraArgument = {
	janitor: MicroDBJanitor;
};

// The MicroDBJanitor cleans up data overhead and reduces database file size.
// It can be used either as global instance for batching cleanups with registerDatabase & deleteDatabase or as db-personal instance
export class MicroDBJanitor extends MicroDBWatchable<{}, ExtraArgument> {
	private job: Job | null; // job gets null when canceled

	private dbs: MicroDBBase[];

	get databases(): MicroDBBase[] {
		return this.dbs;
	}

	// @internal
	_getCallbackArguments = (): ExtraArgument => ({
		janitor: this,
	});

	// @internal
	_currentValue = (): {} => ({});

	constructor(readonly cronString: string = '00 00 00 * * *' /* every day at midnight */, ...dbs: MicroDBBase[]) {
		super();

		this.job = null;
		this.dbs = dbs;
		this.setupJob();
	}

	private setupJob = () => {
		this.job = schedule.scheduleJob(`micro-db janitor ${uuid()}`, this.cronString, this.cleanUpCallBack);
	};

	private cleanUpCallBack = async () => {
		this.valueChanged();
		for (const db of this.dbs) {
			MicroDBJanitor.cleanUp(db);
		}
	};

	public static cleanUp = async (db: MicroDBBase) => {
		const content = await fs.readFile(db.config.fileName);
		const data = db.config.serializer.deserialize(content.toString('utf-8'));
		await fs.writeFile(db.config.fileName, db.config.serializer.serializeAll(data));
	};

	public static cleanUpSync = (db: MicroDBBase) => {
		const content = fsSync.readFileSync(db.config.fileName);
		const data = db.config.serializer.deserialize(content.toString('utf-8'));
		fsSync.writeFileSync(db.config.fileName, db.config.serializer.serializeAll(data));
	};

	public cleanAll = this.cleanUpCallBack;

	public registerDatabase = (db: MicroDBBase) => {
		this.dbs.push(db);
	};

	public deleteDatabase = (db: MicroDBBase) => {
		this.dbs = this.dbs.filter(d => d.config.fileName !== db.config.fileName);
	};

	public kill = () => {
		if (this.job) {
			this.job.cancel(false);
			this.job = null;
		}
	};

	public restart = () => {
		if (!this.job) {
			this.setupJob();
		}
	};
}
