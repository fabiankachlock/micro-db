import { MicroDBWatchable } from '../../watcher/watchable';
import path from 'path';
import { MicroDBBase } from '../../db';
import { saveRemoveFolder, setupTestDir } from '../helper.test';
import { MicroDBDriver } from '../../driver';
import { MicroDBJanitor } from '../../janitor';

describe('micro-db/MicroDBWatchable tests', () => {
	let implementations: MicroDBWatchable<unknown, unknown>[] = [];

	beforeEach(() => {
		implementations = [
			new MicroDBBase({ fileName: path.join('_watchable-tests', 'test0.db') }) as MicroDBWatchable<unknown, unknown>,
			new MicroDBDriver({ fileName: path.join('_watchable-tests', 'test1.db') }) as MicroDBWatchable<unknown, unknown>,
			new MicroDBJanitor() as MicroDBWatchable<unknown, unknown>,
		];
	});

	afterEach(() => {
		// @ts-ignore
		implementations[0]['close']();
		// @ts-ignore
		implementations[1]['close']();
		// @ts-ignore
		implementations[2]['kill']();
	});

	beforeAll(() => {
		setupTestDir('_watchable-tests');
	});

	afterAll(() => {
		saveRemoveFolder('_watchable-tests');
	});

	it('should trigger watcher', () => {
		for (const target of implementations) {
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
	});

	it('should remove watcher', () => {
		for (const target of implementations) {
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
	});

	it('should watch only next', () => {
		for (const target of implementations) {
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
	});

	it('should watch only next with extra predicate', () => {
		for (const target of implementations) {
			const callback = jest.fn((val, args, sub) => {
				expect(val).toBeTruthy();
				expect(args).toBeTruthy();
				expect(sub).toBeTruthy();
			});

			let called = false;

			target.$watchNext(callback, {
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
	});

	it('should watch with extra predicate', () => {
		for (const target of implementations) {
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
	});
});
