import fs from 'fs';
import path from 'path';
import mock from 'mock-fs';
import { MicroDBBase } from '../db';
import { createAwaiter, nextPath } from './helper.test';

const initDB = async (dbFile: string) => {
	const { awaiter, done } = createAwaiter();
	expect(async () => {
		const db = new MicroDBBase({
			fileName: dbFile,
			lazy: true,
		});
		await db.initialize();
		await db.close();
		done();
	}).not.toThrow();
	await awaiter;
};

describe('micro-db/filesystem tests', () => {
	beforeEach(() => {
		mock();
	});

	afterEach(() => {
		mock.restore();
	});

	it('should create database file if it does not exists', async () => {
		const dbFile = nextPath();
		expect(fs.existsSync(dbFile)).toBe(false);

		await initDB(dbFile);

		expect(fs.existsSync(dbFile)).toBe(true);
	});

	it('should create database file + folders is it does not exists', async () => {
		const dbFile = path.join('some', 'deep', 'nested', 'test-create-file-and-folders.db');
		expect(fs.existsSync(dbFile)).toBe(false);

		await initDB(dbFile);

		expect(fs.existsSync(dbFile)).toBe(true);
	});

	it('should not override existing content', async () => {
		const dbFile = path.join('do-not-override-content.db');
		const data = 'some-existing-data: {}';
		fs.writeFileSync(dbFile, data);

		expect(fs.readFileSync(dbFile).toString()).toEqual(data);

		await initDB(dbFile);

		expect(fs.readFileSync(dbFile).toString()).toEqual(data);
	});
});
