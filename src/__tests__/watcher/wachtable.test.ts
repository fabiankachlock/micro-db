import { MicroDBWatchable } from '../../watcher/watchable';
import path from 'path';
import { MicroDBBase } from '../../db';
import { saveRemoveFolder, setupTestDir, createBaseEnv, createDriverEnv, createJanitorEnv } from '../helper.test';
import { MicroDBDriver } from '../../driver';
import { MicroDBJanitor } from '../../janitor';
import mock from 'mock-fs';

// TODO: make this prettier
describe('micro-db/MicroDBWatchable tests', () => {
	beforeEach(() => {
		mock();
	});

	afterEach(() => {
		mock.restore();
	});

	const createObjects = async () => ({
		db: createBaseEnv().db,
		driver: (await createDriverEnv()).driver,
		janitor: createJanitorEnv('* * * * * *').janitor,
	});

	it('should trigger watcher', async () => {
		const implementations = await createObjects();
		for (const target of Object.values(implementations) as MicroDBWatchable<unknown, unknown>[]) {
			const callback = jest.fn((val, args, sub) => {
				expect(val).toBeTruthy();
				expect(args).toBeTruthy();
				expect(sub).toBeTruthy();
			});

			target.$watch(callback);

			target['valueChanged']();
			expect(callback).toBeCalledTimes(1);

			target['valueChanged']();
			expect(callback).toBeCalledTimes(2);
		}
		await implementations.db.close();
		await implementations.driver.close();
		await implementations.janitor.kill();
	});

	it('should remove watcher', async () => {
		const implementations = await createObjects();
		for (const target of Object.values(implementations) as MicroDBWatchable<unknown, unknown>[]) {
			const callback = jest.fn((val, args, sub) => {
				expect(val).toBeTruthy();
				expect(args).toBeTruthy();
				expect(sub).toBeTruthy();
			});

			const sub = target.$watch(callback);

			target['valueChanged']();
			expect(callback).toBeCalledTimes(1);

			sub.destroy();
			target['valueChanged']();
			expect(callback).toBeCalledTimes(1);
		}
		await implementations.db.close();
		await implementations.driver.close();
		await implementations.janitor.kill();
	});

	it('should watch only next', async () => {
		const implementations = await createObjects();
		for (const target of Object.values(implementations) as MicroDBWatchable<unknown, unknown>[]) {
			const callback = jest.fn((val, args, sub) => {
				expect(val).toBeTruthy();
				expect(args).toBeTruthy();
				expect(sub).toBeTruthy();
			});

			target.$watchNext(callback);

			target['valueChanged']();
			expect(callback).toBeCalledTimes(1);

			target['valueChanged']();
			expect(callback).toBeCalledTimes(1);
		}
		await implementations.db.close();
		await implementations.driver.close();
		await implementations.janitor.kill();
	});

	it('should watch only next with extra predicate', async () => {
		const implementations = await createObjects();
		for (const target of Object.values(implementations) as MicroDBWatchable<unknown, unknown>[]) {
			const callback = jest.fn((val, args, sub) => {
				expect(val).toBeTruthy();
				expect(args).toBeTruthy();
				expect(sub).toBeTruthy();
			});

			let called = false;

			target.$watchNext(callback, 1, {
				predicate: () => {
					if (called) {
						return true;
					}
					called = true;
					return false;
				},
			});

			target['valueChanged'](); // shouldn't be called because of predicate
			expect(callback).toBeCalledTimes(0);

			target['valueChanged'](); // should be called
			expect(callback).toBeCalledTimes(1);

			target['valueChanged'](); // shouldn't be called because it got called once
			expect(callback).toBeCalledTimes(1);
		}
		await implementations.db.close();
		await implementations.driver.close();
		await implementations.janitor.kill();
	});

	it('should watch with extra predicate', async () => {
		const implementations = await createObjects();
		for (const target of Object.values(implementations) as MicroDBWatchable<unknown, unknown>[]) {
			const callback = jest.fn((val, args, sub) => {
				expect(val).toBeTruthy();
				expect(args).toBeTruthy();
				expect(sub).toBeTruthy();
			});

			let called = false;

			target.$watch(callback, {
				predicate: () => {
					if (called) {
						return true;
					}
					called = true;
					return false;
				},
			});

			target['valueChanged'](); // shouldn't be called because of predicate
			expect(callback).toBeCalledTimes(0);

			target['valueChanged'](); // should be called
			expect(callback).toBeCalledTimes(1);

			target['valueChanged'](); // should be called again
			expect(callback).toBeCalledTimes(2);
		}
		await implementations.db.close();
		await implementations.driver.close();
		await implementations.janitor.kill();
	});
});
