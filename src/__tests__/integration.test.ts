import { MicroDBDriver } from '../driver';
import { readFile, saveRemoveFolder, setupTestDir } from './helper.test';
import path from 'path';

describe('micro-db/integration test', () => {
	let driver: MicroDBDriver<{ msg: string }>;
	const dbPath = path.join('_integration-tests', 'driver.db');

	beforeAll(() => {
		setupTestDir('_integration-tests');

		driver = new MicroDBDriver({
			fileName: dbPath,
		});
	});

	afterAll(() => {
		saveRemoveFolder('_integration-tests');
	});

	it('shloud clean up file after mutate all', () => {
		driver.create({ msg: Math.random().toString() });
		driver.create({ msg: Math.random().toString() });
		driver.create({ msg: Math.random().toString() });

		const before = readFile(dbPath);

		driver.mutateAll(entry => {
			entry.msg += 'xxx';
			return entry;
		});

		const after = readFile(dbPath);

		for (const obj of driver.selectAll()) {
			expect(obj.msg).toMatch(/xxx$/);
		}
		expect(before.split('\n').length).toBe(after.split('\n').length);
	});
});
