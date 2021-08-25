import fs from 'fs';
import path from 'path';
import { MicroDBBase } from '../db';
import { JSONSerializer } from '../serializer/JSONSerializer';
import { readFile, sleep } from './helper.test';

describe('micro-db/DBBase tests', () => {
	let db: MicroDBBase;
	const serializer = new JSONSerializer();
	const dbPath = path.join('_db-tests', 'test.db');

	beforeEach(() => {
		db = new MicroDBBase({
			fileName: dbPath,
		});
	});

	afterEach(() => {
		db.close();
		fs.rmSync(path.join('_db-tests'), { recursive: true });
	});

	it('should write data correct', async () => {
		expect(readFile(dbPath)).toEqual('');

		const data = {
			amIHere: 0,
		};
		db.write('abc', data);

		await sleep(150);

		expect(readFile(dbPath)).toEqual(serializer.serializeObject('abc', data));
	});

	it('should batch write data correct', async () => {
		expect(readFile(dbPath)).toEqual('');

		const data = {
			id1: {
				amIHere: 0,
			},
			id2: {
				test: true,
			},
		};
		db.writeBatch(data);

		await sleep(150);

		expect(readFile(dbPath)).toEqual(serializer.serializeAll(data));
	});

	it('should overwrite correct', () => {
		const data0 = {
			someString: 'abc',
		};

		// write initial data
		db.write('id', data0);
		expect(db.read()).toEqual({ id: data0 });

		const data1 = {
			someString: 'def',
		};

		// overwrite initial data
		db.write('id', data1);
		expect(db.read()).toEqual({ id: data1 });
	});

	it('should delete correct', () => {
		const data = {
			someString: 'abc',
		};

		// write initial data
		db.write('id', data);
		expect(db.read()).toEqual({ id: data });

		// delete initial data
		db.write('id', undefined);
		expect(db.read()).toEqual({});
	});

	it('should batch delete correct', () => {
		const data = {
			id: {
				someString: 'abc',
			},
		};

		// write initial data
		db.writeBatch(data);
		expect(db.read()).toEqual(data);

		// delete initial data
		db.writeBatch({
			id: undefined,
		});
		expect(db.read()).toEqual({});
	});

	it('should close without errors', () => {
		expect(() => {
			db.close();
		}).not.toThrow();
	});

	it('should setup initial data correct', async () => {
		const initialData = {
			id1: {
				test: true,
			},
		};

		const dataDB = new MicroDBBase({
			defaultData: initialData,
			fileName: path.join('_db-tests', 'test-default-data.db'),
		});

		expect(dataDB.read()).toEqual(initialData);

		await sleep(150);

		const stored = readFile(path.join('_db-tests', 'test-default-data.db'));
		expect(stored).toEqual(serializer.serializeAll(initialData));
	});

	it('should read data correct', () => {
		const initialData = {
			id1: {
				test: true,
			},
		};

		const serialized = serializer.serializeAll(initialData);

		fs.writeFileSync(path.join('_db-tests', 'test-read.db'), serialized);

		const dataDB = new MicroDBBase({
			fileName: path.join('_db-tests', 'test-read.db'),
		});

		expect(dataDB.read()).toEqual(initialData);
	});
});
