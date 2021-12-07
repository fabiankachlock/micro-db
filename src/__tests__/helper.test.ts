import fs from 'fs';

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

test('', () => {});
