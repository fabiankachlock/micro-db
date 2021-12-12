import mock from 'mock-fs';
import * as index from '../index';
import { MicroDB } from '../index';
import { MicroDBDriver } from '../driver';
import { createAwaiter, createDriverEnv, nextPath, readFile } from './helper.test';

describe('micro-db/integration test', () => {
	beforeEach(() => {
		mock();
	});

	afterEach(() => {
		mock.restore();
	});

	it('should provide all classes from index', () => {
		expect(index['MicroDBMS']).toBeDefined();
		expect(index['MicroDBFacade']).toBeDefined();
		expect(index['MicroDBDriver']).toBeDefined();
		expect(index['MicroDBJanitor']).toBeDefined();
	});

	it('should clean up file after mutate all', async () => {
		const { driver, dbFile } = await createDriverEnv<{ msg: string }>();

		await driver.create({ msg: Math.random().toString() });
		await driver.create({ msg: Math.random().toString() });
		await driver.create({ msg: Math.random().toString() });

		const before = readFile(dbFile);

		await driver.mutateAll(entry => {
			entry.msg += 'xxx';
			return entry;
		});

		const after = readFile(dbFile);

		const data = await driver.selectAll();
		for (const obj of data) {
			expect(obj.msg).toMatch(/xxx$/);
		}

		expect(before.split('\n').length).toBe(after.split('\n').length);
	});

	it('should create driver for db', async () => {
		const dbFile = nextPath();
		const db = MicroDB.database({
			fileName: dbFile,
		});

		const { awaiter, done } = createAwaiter();
		expect(async () => {
			const driver = await MicroDBDriver.forDatabase(db);
			expect(driver).toBeTruthy();
			await driver.close();
			done();
		}).not.toThrow();
		await awaiter;
	});

	it('should work with index instance', async () => {
		const { awaiter, done } = createAwaiter();
		expect(async () => {
			const j1 = MicroDB.janitor('* * * * *');
			expect(j1).toBeTruthy();
			await j1.kill();

			const db = MicroDB.database({
				fileName: nextPath(),
				lazy: true,
			});
			const j2 = MicroDB.janitor('* * * * *', db);
			expect(j2).toBeTruthy();
			await j2.kill();
			await db.close();

			const driver = MicroDB.table<{}>({
				fileName: nextPath(),
				lazy: true,
			});
			expect(driver).toBeTruthy();
			await driver.close();

			const db2 = MicroDB.database({
				janitorCronjob: '* * * * *',
				lazy: true,
			});

			const driver2 = await MicroDB.forDatabase(db2);
			expect(driver2).toBeTruthy();
			expect(db2).toBeTruthy();
			await driver2.close();
			await db2.close();

			done();
		}).not.toThrow();
		await awaiter;
	});
});
