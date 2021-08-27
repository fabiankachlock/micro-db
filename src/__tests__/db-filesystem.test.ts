import fs from 'fs';
import path from 'path';
import { MicroDBBase } from '../db';
import { saveRemoveFolder, setupTestDir } from './helper.test';

const dir = '_fs-tests';

describe('micro-db/filesystem tests', () => {
	beforeAll(() => {
		setupTestDir(dir);
	});

	afterAll(() => {
		saveRemoveFolder(dir);
	});

	it('should create databse file if it doesnt exists', () => {
		const fileName = path.join(dir, 'test-create-file.db');

		expect(fs.existsSync(fileName)).toBe(false);

		expect(() => {
			const db = new MicroDBBase({
				fileName: fileName,
			});

			db.close();
		}).not.toThrow();

		expect(fs.existsSync(fileName)).toBe(true);
	});

	it('should create database file + folders is it doesnt exists', () => {
		const fileName = path.join(dir, 'some', 'deep', 'nested', 'test-create-file-and-folders.db');

		expect(fs.existsSync(fileName)).toBe(false);

		expect(() => {
			const db = new MicroDBBase({
				fileName: fileName,
			});

			db.close();
		}).not.toThrow();

		expect(fs.existsSync(fileName)).toBe(true);
	});

	it('should not override existing content', () => {
		const fileName = path.join(dir, 'do-not-override-content.db');
		const data = 'some-existing-data: {}';
		fs.writeFileSync(fileName, data);

		expect(fs.readFileSync(fileName).toString()).toEqual(data);

		expect(() => {
			const db = new MicroDBBase({
				fileName: fileName,
			});

			db.close();
		}).not.toThrow();

		expect(fs.readFileSync(fileName).toString()).toEqual(data);
	});
});
