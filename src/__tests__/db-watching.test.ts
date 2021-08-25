import fs from 'fs';
import path from 'path';
import { MicroDBBase } from '../db';

describe('micro-db/DBBase/watching tests', () => {
	const dbPath = path.join('_db-watching-tests', 'test.db');

	afterAll(() => {
		fs.rmSync(dbPath);
	});

	it('should notify subscriptions', () => {
		const db = new MicroDBBase({
			fileName: dbPath,
		});

		const data = {
			id: {
				some: 'Data',
			},
		};

		const sub = db.watch((value, extra, subscription) => {
			expect(value).toEqual(data);
			expect(extra).toEqual({
				base: db,
			});
			expect(subscription).toEqual(sub);
		});

		db.writeBatch(data);

		db.close();
		sub.destroy();
	});
});
