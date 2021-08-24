import fs from 'fs';
import path from 'path';
import { MicroDBBase } from '../db';
import { JSONSerializer } from '../serializer/JSONSerializer';

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
		expect(fs.readFileSync(dbPath).toString()).toEqual('');

		const data = {
			amIHere: 0,
		};
		db.write('abc', data);

		await new Promise(resolve => {
			setTimeout(() => {
				expect(fs.readFileSync(dbPath).toString()).toEqual(serializer.serializeObject('abc', data));
				resolve({});
			}, 100);
		});
	});

	it('should batch write data correct', async () => {
		expect(fs.readFileSync(dbPath).toString()).toEqual('');

		const data = {
			id1: {
				amIHere: 0,
			},
			id2: {
				test: true,
			},
		};
		db.writeBatch(data);

		await new Promise(resolve => {
			setTimeout(() => {
				expect(fs.readFileSync(dbPath).toString()).toEqual(serializer.serializeAll(data));
				resolve({});
			}, 100);
		});
	});

	// it('should overwrite correct', () => {
	// 	expect(false).toBeTruthy();
	// });

	// it('should close without errors', () => {
	// 	expect(false).toBeTruthy();
	// });

	// it('should setup janitor correct', () => {
	// 	expect(false).toBeTruthy();
	// });

	// it('should setup initial data correct', () => {
	// 	expect(false).toBeTruthy();
	// });
});
