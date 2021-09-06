import * as fs from 'fs';
import path from 'path';
import { readFile, setupTestDir, sleep, saveRemoveFolder } from './helper.test';
import { MicroDBMS } from '../dbms';

describe('micro-db/MicroDBMS tests', () => {
	const DIR = '_dbms-tests';

	const dbPath = (fileName: string) => path.join(DIR, fileName + '.db');

	beforeAll(() => {
		setupTestDir(DIR);
		MicroDBMS.setFolderPath(DIR);
	});

	afterAll(() => {
		saveRemoveFolder(DIR);
	});

	afterEach(() => {
		MicroDBMS.setFolderPath(DIR);
		MicroDBMS.globalJanitor?.kill();
		for (const table in Object.keys(MicroDBMS.allTables)) {
			MicroDBMS.deleteTable(table);
		}
	});

	it('should set folderPath correct', () => {
		MicroDBMS.setFolderPath('some-dir');
		expect(MicroDBMS['folderPath']).toEqual('some-dir');
	});

	it('should create table', () => {
		const tablePath = dbPath('table-1');

		MicroDBMS.table('table-1');

		expect(fs.existsSync(tablePath)).toBe(true);
		expect(Object.keys(MicroDBMS.allTables)).toContain('table-1');
	});

	it('should not create table twice', () => {
		const tablePath = dbPath('table-2');

		MicroDBMS.table('table-2');
		expect(fs.existsSync(tablePath)).toBe(true);

		expect(() => {
			MicroDBMS.table('table-2');
		}).toThrow();
	});

	it('should remove table', () => {
		const tablePath = dbPath('table-3');

		MicroDBMS.table('table-3');

		expect(fs.existsSync(tablePath)).toBe(true);

		MicroDBMS.deleteTable('table-3');

		expect(Object.keys(MicroDBMS.allTables)).not.toContain('table-3');
	});

	it('should remove table from janitor', () => {
		const driver = MicroDBMS.table('table-4');

		MicroDBMS.setJanitorCronjob('* * * * * 0');

		MicroDBMS.globalJanitor?.registerDatabase(driver.dbRef);

		expect(MicroDBMS.globalJanitor?.databases).toContain(driver.dbRef);

		MicroDBMS.deleteTable('table-4');

		expect(MicroDBMS.globalJanitor?.databases).not.toContain(driver.dbRef);
	});

	it('should move all janitor dbs', () => {
		const driver = MicroDBMS.table('table-5');

		MicroDBMS.setJanitorCronjob('* * * * * 0');

		MicroDBMS.globalJanitor?.registerDatabase(driver.dbRef);

		expect(MicroDBMS.globalJanitor?.databases).toContain(driver.dbRef);

		MicroDBMS.setJanitorCronjob('* * * * 0 *');

		expect(MicroDBMS.globalJanitor?.databases).toContain(driver.dbRef);
	});

	it('should should cancel janitor', () => {
		MicroDBMS.setJanitorCronjob('* * * * * 0');
		expect(MicroDBMS.globalJanitor).toBeDefined();

		MicroDBMS.setJanitorCronjob(undefined);
		expect(MicroDBMS.globalJanitor?.databases).toBeUndefined();
	});

	it('should work with extra options', () => {
		expect(() => {
			MicroDBMS.table('some-table', {
				defaultData: {},
			});
		}).not.toThrow();
	});
});
