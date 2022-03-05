import { tsMethodSignature } from '@babel/types';
import fs from 'fs/promises';
import schedule, { Job } from 'node-schedule';
import { v4 as uuid } from 'uuid';
import { MicroDBBase } from './db';
import { createCallbackAwaiter } from './helper';
import { MicroDBWatchable } from './watcher/watchable';

type ExtraArgument = {
	janitor: MicroDBJanitor;
};

// The MicroDBJanitor cleans up data overhead and reduces database file size.
// It can be used either as global instance for batching cleanups with registerDatabase & deleteDatabase or as db-personal instance
export class MicroDBJanitor extends MicroDBWatchable<{}, ExtraArgument> {
	private job: Job | null; // job gets null when canceled

	private dbs: MicroDBBase[];

	private runningPromise: Promise<{}> | undefined = undefined;

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

	private setupJob() {
		this.job = schedule.scheduleJob(`micro-db janitor ${uuid()}`, this.cronString, this.cleanUpCallBack);
	}

	// FIXME: this does not work when written in function syntax
	private cleanUpCallBack = async () => {
		const { waiter, callback } = createCallbackAwaiter(() => {
			this.runningPromise = undefined; // dispose waiting promise
		});

		this.runningPromise = waiter as unknown as Promise<{}>;
		for (const db of this.dbs) {
			await MicroDBJanitor.cleanUp(db);
		}

		// notify that its done
		callback();
		this.valueChanged();
	};

	public static async cleanUp(db: MicroDBBase) {
		const content = await fs.readFile(db.config.fileName);
		const data = await db.config.serializer.deserialize(content.toString('utf-8'));
		await fs.writeFile(db.config.fileName, await db.config.serializer.serializeAll(data));
	}

	public cleanAll = this.cleanUpCallBack;

	public registerDatabase(db: MicroDBBase) {
		this.dbs.push(db);
	}

	public deleteDatabase(db: MicroDBBase) {
		this.dbs = this.dbs.filter(d => d.config.fileName !== db.config.fileName);
	}

	public async kill() {
		if (this.job) {
			if (this.runningPromise) {
				await this.runningPromise;
			}
			this.job.cancel(false);
			this.job = null;
		}
	}

	public async restart() {
		if (!this.job) {
			this.setupJob();
		}
	}
}
