import fs from 'fs';
import path from 'path';
import mock from 'mock-fs';
import { MicroDBBase } from '../db';
import { JSONSerializer } from '../serializer/JSONSerializer';
import { createBaseEnv, nextPath, readFile, setupTestDir } from './helper.test';

describe('micro-db/DBBase tests', () => {
	const serializer = new JSONSerializer();

	beforeEach(() => {
		mock({});
	});

	afterAll(() => {
		mock.restore();
	});

	it('should write data correct', async () => {
		const { db, dbFile } = createBaseEnv();
		await db.initialize();
		expect(readFile(dbFile)).toEqual('');

		const data = {
			amIHere: 0,
		};
		await db.write('abc', data);

		expect(readFile(dbFile)).toEqual(await serializer.serializeObject('abc', data));
		await db.close();
	});

	it('should batch write data correct', async () => {
		const { db, dbFile } = createBaseEnv();
		await db.initialize();

		expect(readFile(dbFile)).toEqual('');

		const data = {
			id1: {
				amIHere: 0,
			},
			id2: {
				test: true,
			},
		};
		await db.writeBatch(data);

		expect(readFile(dbFile)).toEqual(await serializer.serializeAll(data));
		await db.close();
	});

	it('should overwrite correct', async () => {
		const { db } = createBaseEnv();
		await db.initialize();

		const data0 = {
			someString: 'abc',
		};

		// write initial data
		await db.write('id', data0);
		expect(await db.read()).toEqual({ id: data0 });

		const data1 = {
			someString: 'def',
		};

		// overwrite initial data
		await db.write('id', data1);
		expect(await db.read()).toEqual({ id: data1 });
		await db.close();
	});

	it('should delete correct', async () => {
		const { db } = createBaseEnv();
		await db.initialize();

		const data = {
			someString: 'abc',
		};

		// write initial data
		await db.write('id', data);
		expect(await db.read()).toEqual({ id: data });

		// delete initial data
		await db.write('id', undefined);
		expect(await db.read()).toEqual({});
		await db.close();
	});

	it('should differentiate undefined from null correct', async () => {
		const { db } = createBaseEnv();
		await db.initialize();

		const data = {
			someString: 'abc',
		};

		// write initial data
		await db.write('id', data);
		expect(await db.read()).toEqual({ id: data });

		// delete initial data
		await db.write('id', undefined);
		expect(await db.read()).toEqual({});

		// write again
		await db.write('id', data);
		expect(await db.read()).toEqual({ id: data });

		// set to null
		await db.write('id', null);
		// should not get deleted
		expect(await db.read()).toEqual({ id: null });
		await db.close();
	});

	it('should batch delete correct', async () => {
		const { db } = createBaseEnv();
		await db.initialize();

		const data = {
			id: {
				someString: 'abc',
			},
		};

		// write initial data
		await db.writeBatch(data);
		expect(await db.read()).toEqual(data);

		// delete initial data
		await db.writeBatch({
			id: undefined,
		});
		expect(await db.read()).toEqual({});
		await db.close();
	});

	it('should close without errors', async () => {
		const { db, dbFile } = createBaseEnv();
		//try {
		await db.initialize();
		// } catch (e) {
		// 	console.log(e);
		// 	console.log(vol.toJSON());
		// }

		return new Promise(res => {
			expect(async () => {
				await db.close();
				res({});
			}).not.toThrow();
		});
	});

	it('should setup initial data correct', async () => {
		const dbFile = nextPath();
		const initialData = {
			id1: {
				test: true,
			},
		};

		const dataDB = new MicroDBBase({
			defaultData: initialData,
			fileName: dbFile,
			lazy: true,
		});
		await dataDB.initialize();

		expect(await dataDB.read()).toEqual(initialData);

		expect(await serializer.serializeAll(initialData)).toEqual(readFile(dbFile));
		await dataDB.close();
	});

	it('should read data correct', async () => {
		const dbFile = nextPath();
		setupTestDir(path.dirname(dbFile));
		const initialData = {
			id1: {
				test: true,
			},
		};

		const serialized = await serializer.serializeAll(initialData);

		fs.writeFileSync(dbFile, serialized);

		const dataDB = new MicroDBBase({
			fileName: dbFile,
		});

		expect(await dataDB.read()).toEqual(initialData);
		await dataDB.close();
	});

	it('should create janitor correct', async () => {
		const janitorDb = new MicroDBBase({
			fileName: path.join('_db-tests', 'janitor-test.db'),
			janitorCronjob: '* * * * * *',
			lazy: true,
		});

		await janitorDb.initialize();

		expect(janitorDb.janitor).toBeTruthy();
		await janitorDb.close();
	});

	it('should init with zero config', async () => {
		await new Promise(res => {
			expect(async () => {
				const db = new MicroDBBase({
					lazy: true, // needed for tests to run
				});
				await db.initialize();
				await db.close();
				res({});
			}).not.toThrow();
		});
	});
});
