import fs from 'fs';
import path from 'path';
import { MicroDBBase } from '../db';
import { MicroDBDriver } from '../driver';

export const sleep = (timeout: number) => new Promise(resolve => setTimeout(() => resolve({}), timeout));

export const readFile = (path: string): string => (fs.existsSync(path) ? fs.readFileSync(path).toString() : '');

export const createWaiter = (): [Promise<{}>, () => void] => {
	let res = () => {};

	return [
		new Promise(resolve => {
			res = () => resolve({});
		}),
		res,
	];
};

export const saveRemoveFolder = (path: string) => {
	if (fs.existsSync(path)) {
		fs.rmSync(path, { recursive: true });
	}
};

export const setupTestDir = (path: string) => {
	saveRemoveFolder(path);
	fs.mkdirSync(path, { recursive: true });
};

let count = 0;

export const nextPath = (dbFile: string = 'test.db') => path.join((++count).toString(), dbFile);

export const createBaseEnv = (dbFile: string = 'test.db') => ({
	dbFile: path.join((++count).toString(), dbFile),
	driver: new MicroDBBase({
		fileName: path.join(count.toString(), dbFile),
		lazy: true,
	}),
});

export const createDriverEnv = async <T>(data: T[] = [], dbFile: string = 'test.db') => {
	const file = path.join((++count).toString(), dbFile);
	const driver = new MicroDBDriver<T>({
		fileName: path.join(count.toString(), dbFile),
		lazy: true,
	});
	await driver.initialize();

	const initialData: Record<string, T> = {};
	for (const value of data) {
		const id = await driver.create(value);
		initialData[id] = {
			_microdbId: id,
			...value,
		};
	}

	return {
		dbFile: file,
		driver,
		initialData,
	};
};

export const createAwaiter = () => {
	let resolve = () => {};
	let reject = () => {};
	const promise = new Promise((res, rej) => {
		resolve = () => res({});
		reject = () => rej();
	});

	return {
		promise,
		awaiter: promise,
		resolve,
		done: resolve,
		reject,
	};
};

test('', () => {});
