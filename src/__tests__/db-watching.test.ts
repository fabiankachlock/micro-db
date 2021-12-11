import path from 'path';
import { MicroDBBase } from '../db';
import { MicroDBData } from '../micro-db';
import { SubscriptionCallback } from '../watcher/interface';
import { setupTestDir, saveRemoveFolder, createBaseEnv } from './helper.test';
import mock from 'mock-fs';

describe('micro-db/DBBase/watching tests', () => {
	beforeEach(() => {
		mock();
	});

	afterEach(() => {
		mock.restore();
	});

	it('should notify subscriptions', async () => {
		const { db } = createBaseEnv();
		await db.initialize();

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

		await db.writeBatch(data);

		expect(spy).toBeCalled();

		await db.close();
		sub.destroy();
	});
});
