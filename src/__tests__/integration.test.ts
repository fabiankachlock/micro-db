import { MicroDB } from '../index';
import * as index from '../index';
import { MicroDBDriver } from '../driver';
import { readFile, saveRemoveFolder, setupTestDir } from './helper.test';
import path from 'path';

describe('micro-db/integration test', () => {
	let driver: MicroDBDriver<{ msg: string }>;
	const dbPath = path.join('_integration-tests', 'driver.db');

	beforeAll(() => {
		setupTestDir('_integration-tests');

		driver = new MicroDB({
			fileName: dbPath,
		});
	});

	afterAll(() => {
		saveRemoveFolder('_integration-tests');
	});

	it('should provide all classes from index', () => {
		expect(index['MicroDBMS']).toBeDefined();
		expect(index['MicroDBFacade']).toBeDefined();
		expect(index['MicroDBDriver']).toBeDefined();
		expect(index['MicroDBJanitor']).toBeDefined();
	});

	it('should clean up file after mutate all', () => {
		driver.create({ msg: Math.random().toString() });
		driver.create({ msg: Math.random().toString() });
		driver.create({ msg: Math.random().toString() });

		const before = readFile(dbPath);

		driver.mutateAll(entry => {
			entry.msg += 'xxx';
			return entry;
		});

		const after = readFile(dbPath);

		for (const obj of driver.selectAll()) {
			expect(obj.msg).toMatch(/xxx$/);
		}
		expect(before.split('\n').length).toBe(after.split('\n').length);
	});

	it('should create driver for db', () => {
		const db = MicroDB.database({
			fileName: dbPath,
		});

		expect(() => {
			const driver = MicroDBDriver.forDatabase(db);
			expect(driver).toBeTruthy();

			driver.close();
		}).not.toThrow();
	});

	it('should work with index instance', () => {
		expect(() => {
			const j1 = MicroDB.janitor('* * * * *');
			expect(j1).toBeTruthy();
			j1.kill();

			const db = MicroDB.database({
				fileName: dbPath,
			});
			const j2 = MicroDB.janitor('* * * * *', db);
			expect(j2).toBeTruthy();
			j2.kill();
			db.close();

			const driver = MicroDB.table<{}>({
				fileName: dbPath,
			});
			expect(driver).toBeTruthy();
			driver.close();

			const db2 = MicroDB.database({
				janitorCronjob: '* * * * *',
			});
			const driver2 = MicroDB.forDatabase(db2);
			expect(driver2).toBeTruthy();
			expect(db2).toBeTruthy();
			db2.close();
		}).not.toThrow();
	});
});
