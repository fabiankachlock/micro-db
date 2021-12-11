import { MicroDBJanitor } from '../janitor';
import { JSONSerializer } from '../serializer/JSONSerializer';
import { readFile, sleep, createBaseEnv, createJanitorEnv, createAwaiter } from './helper.test';
import mock from 'mock-fs';

describe('micro-db/DBBase tests', () => {
	const serializer = new JSONSerializer();

	beforeEach(() => {
		mock();
	});

	afterEach(() => {
		mock.restore();
	});

	it('should clean data correctly', async () => {
		const { db, dbFile } = createBaseEnv();
		await db.initialize();

		const key = 'abc';
		const data0 = {
			test: 'someString',
		};
		const data1 = {
			test: 'anotherString',
			someNumber: 1,
		};

		await db.write(key, data0);
		expect(readFile(dbFile)).toEqual(await serializer.serializeObject(key, data0));

		await db.write(key, data1);
		expect(readFile(dbFile)).toEqual(
			(await serializer.serializeObject(key, data0)) + (await serializer.serializeObject(key, data1))
		);

		await MicroDBJanitor.cleanUp(db);

		expect(readFile(dbFile)).toEqual(await serializer.serializeObject(key, data1));
		await db.close();
	});

	it('should add/delete databases correctly', async () => {
		const { db } = createBaseEnv();
		const { janitor } = createJanitorEnv('* * * * *');
		expect(janitor.databases.length).toEqual(0);

		janitor.registerDatabase(db);
		expect(janitor.databases.length).toEqual(1);

		const anotherDB = createBaseEnv().db;

		janitor.registerDatabase(anotherDB);
		expect(janitor.databases.length).toEqual(2);

		janitor.deleteDatabase(db);
		expect(janitor.databases.length).toEqual(1);

		janitor.deleteDatabase(anotherDB);
		expect(janitor.databases.length).toEqual(0);

		await db.close();
		await anotherDB.close();
		await janitor.kill();
	});

	// TODO: test for db closing when not init

	it('should setup cronjob correctly', async () => {
		const key = 'abc';
		const data0 = {
			test: 'someString',
		};
		const data1 = {
			test: 'anotherString',
			someNumber: 1,
		};

		const { db, dbFile } = createBaseEnv();
		await db.write(key, data0);
		expect(readFile(dbFile)).toEqual(await serializer.serializeObject(key, data0));

		await db.write(key, data1);
		expect(readFile(dbFile)).toEqual(
			(await serializer.serializeObject(key, data0)) + (await serializer.serializeObject(key, data1))
		);

		const cronjobJanitor = new MicroDBJanitor('* * * * * *');
		cronjobJanitor.registerDatabase(db);

		const { awaiter, done } = createAwaiter();
		cronjobJanitor.$watchNext(() => done());
		await awaiter;

		expect(await serializer.serializeObject(key, data1)).toEqual(readFile(dbFile));
		await db.close();
		await cronjobJanitor.kill();
	});

	it('should restart cronjob', async () => {
		const cb = jest.fn(() => {});

		const target = new MicroDBJanitor('* * * * * *');
		const sub = target.$watch(cb);

		await target.kill();
		await target.restart();

		await sleep(1250);

		expect(cb).toBeCalled();

		sub.destroy();
		await target.kill();
	});

	it('should not restart when running', async () => {
		const target = new MicroDBJanitor('* * * * * *');
		const nextDate = target['job']?.nextInvocation();
		await target.restart();
		const afterRestartDate = target['job']?.nextInvocation();
		await target.kill();
		expect(nextDate).toEqual(afterRestartDate);
	});

	//TODO: Test waiting for running operation
});
