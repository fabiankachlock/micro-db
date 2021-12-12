import fs from 'fs';
import path from 'path';
import { readFile, setupTestDir, sleep, saveRemoveFolder, nextPath, createAwaiter } from './helper.test';
import { MicroDBMS } from '../dbms';
import mock from 'mock-fs';

describe('micro-db/MicroDBMS tests', () => {
	const DIR = 'dbms';

	beforeEach(() => {
		mock();
		MicroDBMS.setFolderPath(DIR);
	});

	afterEach(async () => {
		await MicroDBMS.globalJanitor?.kill();
		for (const table in Object.keys(MicroDBMS.allTables)) {
			await MicroDBMS.deleteTable(table);
		}
		mock.restore();
	});

	it('should set folderPath correct', () => {
		MicroDBMS.setFolderPath('some-dir');
		expect(MicroDBMS['folderPath']).toEqual('some-dir');
	});

	it('should create table', async () => {
		const tablePath = path.join(DIR, 'table-1.db');

		await MicroDBMS.table('table-1');

		expect(fs.existsSync(tablePath)).toBe(true);
		expect(Object.keys(MicroDBMS.allTables)).toContain('table-1');
	});

	it('should not create table twice', async () => {
		const tablePath = path.join(DIR, 'table-2.db');

		await MicroDBMS.table('table-2');
		expect(fs.existsSync(tablePath)).toBe(true);

		const { awaiter, done } = createAwaiter();
		expect(async () => {
			try {
				await MicroDBMS.table('table-2');
			} catch (e) {
				done();
				throw e;
			}
		}).rejects.toThrow();
		await awaiter;
	});

	it('should remove table', async () => {
		const tablePath = path.join(DIR, 'table-3.db');

		await MicroDBMS.table('table-3');
		expect(fs.existsSync(tablePath)).toBe(true);

		await MicroDBMS.deleteTable('table-3');
		expect(Object.keys(MicroDBMS.allTables)).not.toContain('table-3');
	});

	it('should remove table from janitor', async () => {
		const driver = await MicroDBMS.table('table-4');

		MicroDBMS.setJanitorCronjob('* * * * * 0');
		MicroDBMS.globalJanitor?.registerDatabase(driver.dbRef);

		expect(MicroDBMS.globalJanitor?.databases).toContain(driver.dbRef);

		await MicroDBMS.deleteTable('table-4');
		expect(MicroDBMS.globalJanitor?.databases).not.toContain(driver.dbRef);

		await MicroDBMS.globalJanitor?.kill();
		await driver.close();
	});

	it('should move all janitor dbs', async () => {
		const driver = await MicroDBMS.table('table-5');

		MicroDBMS.setJanitorCronjob('* * * * * 0');
		MicroDBMS.globalJanitor?.registerDatabase(driver.dbRef);

		expect(MicroDBMS.globalJanitor?.databases).toContain(driver.dbRef);

		MicroDBMS.setJanitorCronjob('* * * * 0 *');
		expect(MicroDBMS.globalJanitor?.databases).toContain(driver.dbRef);

		await MicroDBMS.globalJanitor?.kill();
		await driver.close();
	});

	it('should should cancel janitor', async () => {
		MicroDBMS.setJanitorCronjob('* * * * * 0');
		expect(MicroDBMS.globalJanitor).toBeDefined();

		MicroDBMS.setJanitorCronjob(undefined);
		expect(MicroDBMS.globalJanitor?.databases).toBeUndefined();
		await MicroDBMS.globalJanitor?.kill();
	});

	it('should work with extra options', async () => {
		const { awaiter, done } = createAwaiter();
		expect(async () => {
			await MicroDBMS.table('some-table', {
				defaultData: {},
			});
			done();
		}).not.toThrow();
		await awaiter;
	});
});
