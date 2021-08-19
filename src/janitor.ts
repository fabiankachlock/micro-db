import { MicroDB } from './db';
import { CronJob } from 'cron';
import * as fs from 'fs/promises';

// The MicroDBJanitor cleans up data overhad and reduces database file size.
// It can be used either as global instace for batching cleanups with registerDatabase & deleteDatabase or as db-personal instace
export class MicroDBJanitor {
	private job: CronJob;

	private dbs: MicroDB[];

	constructor(cron: string = '* * 0 * * *' /* every day at midnight */) {
		this.job = new CronJob(cron, this.cleanUpCallBack);
		this.dbs = [];
	}

	private cleanUpCallBack = async () => {
		for (const db of this.dbs) {
			this.cleanUp(db);
		}
	};

	public cleanUp = async (db: MicroDB) => {
		const content = await fs.readFile(db.fileName);
		const data = db.dataSerializer.deserialize(content.toString('utf-8'));
		await fs.writeFile(db.fileName, db.dataSerializer.serializeAll(data));
	};

	public registerDatabase = (db: MicroDB) => {
		this.dbs.push(db);
	};

	public deleteDatabase = (db: MicroDB) => {
		this.dbs = this.dbs.filter(d => d.fileName !== db.fileName);
	};

	public kill = () => {
		this.job.stop();
	};
}
