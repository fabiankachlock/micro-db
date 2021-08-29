import path from 'path';
import { MicroDBDriver } from '../driver';
import { setupTestDir, saveRemoveFolder } from './helper.test';

describe('micro-db/DBDriver tests', () => {
	const dbPath = path.join('_dbdriver-tests', 'test.db');

	beforeAll(() => {
		setupTestDir('_dbdriver-tests');
	});

	afterAll(() => {
		saveRemoveFolder('_dbdriver-tests');
	});

	const driver = new MicroDBDriver<{
		name: string;
		age: number;
	}>({
		fileName: dbPath,
	});

	let driverData: Record<
		string,
		{
			_microdbId: string;
			name: string;
			age: number;
		}
	> = {};

	const _driverData = [
		{
			name: 'john',
			age: 23,
		},
		{
			name: 'max',
			age: 32,
		},
		{
			name: 'johna',
			age: 45,
		},
		{
			name: 'maxime',
			age: 23,
		},
	];

	let ids: string[] = [];

	const initData = () => {
		driverData = {};
		ids = [];
		for (const obj of _driverData) {
			const id = driver.create(obj);
			ids.push(id);
			driverData[id] = {
				...obj,
				_microdbId: id,
			};
		}
	};

	beforeEach(() => {
		expect(driver.selectAll()).toEqual([]);
	});

	afterEach(() => {
		driver.flush();
	});

	describe('create', () => {
		it('should create object', () => {
			const data = {
				name: 'john',
				age: 23,
			};
			const id = driver.create(data);

			expect(driver.selectAll()).toEqual([
				{
					_microdbId: id,
					...data,
				},
			]);
		});

		it('should create object duplicate data', () => {
			const data = {
				name: 'john',
				age: 23,
			};
			const id = driver.create(data);

			expect(driver.selectAll()).toEqual([
				{
					_microdbId: id,
					...data,
				},
			]);

			expect(() => {
				const data1 = {
					name: 'john',
					age: 23,
				};

				const _ = driver.create(data1);

				expect(driver.selectAll().length).toEqual(2);
			}).not.toThrow();
		});
	});

	describe('select', () => {
		it('should select correct', () => {
			initData();

			for (const [id, value] of Object.entries(driverData)) {
				expect(driver.select(id)).toEqual(value);
			}
		});

		it('should select correct with predicate', () => {
			initData();

			for (const [_, value] of Object.entries(driverData)) {
				expect(driver.selectWhere(obj => obj.name === value.name)).toEqual(value);
			}
		});

		it('should select all correct', () => {
			initData();

			const selected = driver.selectAllWhere(person => person.age < 30);

			expect(selected).toEqual(Object.values(driverData).filter(person => person.age < 30));
		});

		it('should return all data', () => {
			initData();

			expect(driver.selectAll()).toEqual(Object.values(driverData));
		});

		it('should return empty data correct', () => {
			expect(driver.selectAll()).toEqual([]);
		});

		it('should return undefined correct', () => {
			expect(() => {
				expect(driver.select('some-id')).toBeUndefined();
			}).not.toThrow();
		});

		it('should return undefined correct in where predicate', () => {
			expect(() => {
				expect(driver.selectWhere(entry => entry._microdbId === 'some-id')).toBeUndefined();
			}).not.toThrow();
		});
	});

	describe('update', () => {
		it('should update correct', () => {
			initData();
			const id = ids[0];
			const newName = 'newName';

			driver.update(id, {
				name: newName,
			});

			expect(driver.select(id)).toEqual({
				...driverData[id],
				name: newName,
			});
		});

		it('should change nothing when id unknown', () => {
			const before = driver.selectAll();

			driver.update('some-id', {
				name: 'not-goig-to-be-changed',
			});

			const after = driver.selectAll();
			expect(before).toEqual(after);
		});

		it('should update where correct', () => {
			initData();
			const id = ids[0];
			const newName = 'newName';
			const oldName = driverData[id].name;

			driver.updateWhere(user => user.name === oldName, {
				name: newName,
			});

			expect(driver.select(id)).toEqual({
				...driverData[id],
				name: newName,
			});
		});

		it('should update all correct', () => {
			initData();

			driver.updateAllWhere(entry => entry.age > 30, { age: 50 });
			const data = driver.selectAll();
			expect(data.length).toBeGreaterThan(0);

			for (const obj of data) {
				expect(obj).toEqual({
					...driverData[obj._microdbId],
					age: driverData[obj._microdbId].age > 30 ? 50 : driverData[obj._microdbId].age,
				});
			}
		});
	});

	describe('mutate', () => {
		it('should mutate correct', () => {
			initData();
			const id = ids[0];
			expect(driver.select(id)).toEqual(driverData[id]);
			driver.mutate(id, obj => {
				obj.age = 123;
				return obj;
			});
			expect(driver.select(id)).toEqual({
				...driverData[id],
				age: 123,
			});
		});
	});

	describe('delete', () => {
		it('should delete correct', () => {
			initData();

			const id = ids[0];

			driver.delete(id);

			expect(driver.selectAll()).not.toContain(driverData[id]);
			expect(driver.selectAll().length).toEqual(ids.length - 1);
		});

		it('should flush all data', () => {
			driver.create({
				name: '',
				age: 0,
			});

			expect(driver.selectAll().length).toBe(1);

			driver.flush();

			expect(driver.selectAll()).toEqual([]);
		});
	});
});
