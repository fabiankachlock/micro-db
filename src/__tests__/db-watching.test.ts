import fs from 'fs';
import path from 'path';
import { MicroDBBase } from '../db';
import { MicroDBData } from '../micro-db';
import { SubscriptionCallback } from '../watcher/interface';
import { setupTestDir, saveRemoveFolder } from './helper.test';

describe('micro-db/DBBase/watching tests', () => {
	const dbPath = path.join('_db-watching-tests', 'test.db');

	beforeAll(() => {
		setupTestDir('_db-watching-tests');
	});

	afterAll(() => {
		saveRemoveFolder('_db-watching-tests');
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

		const callback: SubscriptionCallback<MicroDBData, { base: MicroDBBase }> = (value, extra, subscription) => {
			expect(value).toEqual(data);
			expect(extra).toEqual({
				base: db,
			});
			expect(subscription).toEqual(sub);
		};

		const spy = jest.fn(callback);

		const sub = db.$watch(spy);

		db.writeBatch(data);

		expect(spy).toBeCalled();

		db.close();
		sub.destroy();
	});
});
