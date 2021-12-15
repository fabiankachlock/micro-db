import mock from 'mock-fs';
import { MicroDBBase } from '../db';
import { createAwaiter, nextPath, sleep } from './helper.test';

describe('micro-db/DBBase/lazy tests', () => {
	beforeEach(() => {
		mock();
	});

	afterEach(() => {
		mock.restore();
	});

	it('should no init when lazy options passed', async () => {
		const db = new MicroDBBase({
			fileName: nextPath(),
			lazy: true,
		});

		expect(db['writeStream']).toBeUndefined();
		expect(db['currentData']).toEqual({});
		expect(db.isInitialized).toBeFalsy();
		await db.close();
	});

	it('should init after init call', async () => {
		const db = new MicroDBBase({
			fileName: nextPath(),
			lazy: true,
		});

		expect(db['writeStream']).toBeUndefined();
		expect(db['currentData']).toEqual({});
		expect(db.isInitialized).toBeFalsy();

		await db.initialize();

		expect(db['writeStream']).toBeDefined();
		expect(db.isInitialized).toBeTruthy();

		await db.close();
	});

	it('should deallocate data', async () => {
		const db = new MicroDBBase({
			fileName: nextPath(),
			lazy: true,
			defaultData: {
				a: 123,
				b: 1234,
				c: 'asdasdasda',
			},
		});
		await db.initialize();

		// prevent circular json
		// @ts-ignore
		delete db['_subscriptionManager'];

		const before = JSON.stringify(db).length;
		await db.deallocate();
		const after = JSON.stringify(db).length;

		expect(before).toBeGreaterThan(after);

		await db.close();
	});

	const createDataBase = (data: Record<string, unknown> = { a: 123, t: 'assa' }) => ({
		db: new MicroDBBase({
			fileName: nextPath(),
			lazy: true,
			defaultData: data,
		}),
		data,
	});

	it('should init automatically on read', async () => {
		const { data, db } = createDataBase();

		expect(db['writeStream']).toBeUndefined();
		expect(db['currentData']).toEqual({});

		const { awaiter, done } = createAwaiter();
		expect(async () => {
			const readData = await db.read();

			expect(db['writeStream']).toBeDefined();
			expect(readData).toEqual(data);
			done();
		}).not.toThrow();
		await awaiter;
		await db.close();
	});

	it('should init automatically on write', async () => {
		const { data, db } = createDataBase();

		expect(db['writeStream']).toBeUndefined();
		expect(db['currentData']).toEqual({});

		const { awaiter, done } = createAwaiter();
		expect(async () => {
			await db.write('xxx', '123');
			const readData = await db.read();

			expect(db['writeStream']).toBeDefined();
			expect(readData).toEqual({ ...data, xxx: '123' });
			done();
		}).not.toThrow();
		await awaiter;
		await db.close();
	});

	it('should init automatically on writeBatch', async () => {
		const { data, db } = createDataBase();

		expect(db['writeStream']).toBeUndefined();
		expect(db['currentData']).toEqual({});

		const { awaiter, done } = createAwaiter();
		expect(async () => {
			await db.writeBatch({});
			const readData = await db.read();

			expect(db['writeStream']).toBeDefined();
			expect(readData).toEqual(data);
			done();
		}).not.toThrow();
		await awaiter;
		await db.close();
	});

	it('should not crash when calling init when already initialized', async () => {
		const db = new MicroDBBase({
			fileName: nextPath(),
			lazy: true,
		});

		expect(db['writeStream']).toBeUndefined();
		expect(db['currentData']).toEqual({});

		await db.initialize();

		expect(db['writeStream']).toBeDefined();

		const { awaiter, done } = createAwaiter();
		expect(async () => {
			//await sleep(200);
			await db.initialize();
			done();
		}).not.toThrow();

		await awaiter;
		await db.close();
	});

	it('should not crash when deallocation when not initialized', async () => {
		const db = new MicroDBBase({
			fileName: nextPath(),
			lazy: true,
		});

		const { awaiter, done } = createAwaiter();
		expect(async () => {
			expect(db.isInitialized).toBeFalsy();
			await db.deallocate();
			await db.close();
			done();
		}).not.toThrow();
		await awaiter;
	});
});
