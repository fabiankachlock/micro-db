import fs from 'fs';
import path from 'path';
import { MicroDBBase } from '../db';
import { MicroDBJanitor } from '../janitor';
import { JSONSerializer } from '../serializer/JSONSerializer';
import { readFile, setupTestDir, sleep, saveRemoveFolder } from './helper.test';

describe('micro-db/DBBase tests', () => {
	let db: MicroDBBase;
	const serializer = new JSONSerializer();
	const janitor = new MicroDBJanitor();
	let dbPath = '';
	let id = 0;

	beforeAll(() => {
		setupTestDir('_janitor-tests');
	});

	beforeEach(() => {
		dbPath = path.join('_janitor-tests', `test-${id}.db`);
		db = new MicroDBBase({
			fileName: dbPath,
		});
	});

	afterEach(() => {
		db.close();
		fs.rmSync(path.join('_janitor-tests'), { recursive: true });
		id += 1;

		janitor.databases.forEach(registeredDB => {
			janitor.deleteDatabase(registeredDB);
		});
	});

	afterAll(() => {
		janitor.kill();
		saveRemoveFolder('_janitor-tests');
	});

	it('should clean data correctly', async () => {
		const key = 'abc';
		const data0 = {
			test: 'someString',
		};

		const data1 = {
			test: 'anotherString',
			someNumber: 1,
		};

		db.write(key, data0);

		await sleep(150);

		expect(readFile(dbPath)).toEqual(serializer.serializeObject(key, data0));

		db.write(key, data1);

		await sleep(150);

		expect(readFile(dbPath)).toEqual(serializer.serializeObject(key, data0) + serializer.serializeObject(key, data1));

		MicroDBJanitor.cleanUp(db);

		await sleep(150);

		expect(readFile(dbPath)).toEqual(serializer.serializeObject(key, data1));
	});

	it('should add/delete databases correctly', () => {
		expect(janitor.databases.length).toEqual(0);

		janitor.registerDatabase(db);

		expect(janitor.databases.length).toEqual(1);

		const anotherDB = new MicroDBBase({
			fileName: path.join('_janitor-tests', 'test-x.db'),
		});

		janitor.registerDatabase(anotherDB);

		expect(janitor.databases.length).toEqual(2);

		janitor.deleteDatabase(db);

		expect(janitor.databases.length).toEqual(1);

		janitor.deleteDatabase(anotherDB);

		expect(janitor.databases.length).toEqual(0);
	});

	it('should setup cronjob correctly', async () => {
		const key = 'abc';
		const data0 = {
			test: 'someString',
		};

		const data1 = {
			test: 'anotherString',
			someNumber: 1,
		};

		db.write(key, data0);

		await sleep(150);

		expect(readFile(dbPath)).toEqual(serializer.serializeObject(key, data0));

		db.write(key, data1);

		await sleep(150);

		expect(readFile(dbPath)).toEqual(serializer.serializeObject(key, data0) + serializer.serializeObject(key, data1));

		const cronjobJanitor = new MicroDBJanitor('* * * * * *');
		cronjobJanitor.registerDatabase(db);

		await sleep(1250);

		expect(readFile(dbPath)).toEqual(serializer.serializeObject(key, data1));
		cronjobJanitor.kill();
	});
});
