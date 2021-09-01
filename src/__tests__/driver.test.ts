import path from 'path';
import { MicroDBDriver } from '../driver';
import { setupTestDir, saveRemoveFolder } from './helper.test';

describe('micro-db/DBDriver tests', () => {
	const dbPath = path.join('_dbdriver-tests', 'test.db');
	let driver: MicroDBDriver<{
		name: string;
		age: number;
	}>;

	beforeAll(() => {
		setupTestDir('_dbdriver-tests');
		driver = new MicroDBDriver({
			fileName: dbPath,
		});
	});

	afterAll(() => {
		saveRemoveFolder('_dbdriver-tests');
		driver.close();
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

			const res = driver.update('some-id', {
				name: 'not-going-to-be-changed',
			});

			const after = driver.selectAll();
			expect(before).toEqual(after);
			expect(res).toBe(false);
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

		it('should update nothing where correct', () => {
			initData();
			const before = driver.selectAll();
			const res = driver.updateWhere(user => user._microdbId === 'some-id', {
				name: 'my-name',
			});

			const after = driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
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

		it('should update nothing all where correct', () => {
			initData();
			const before = driver.selectAll();
			const count = driver.updateAllWhere(user => user._microdbId === 'some-id', {
				name: 'my-name',
			});

			const after = driver.selectAll();
			expect(before).toEqual(after);
			expect(count).toBe(0);
		});
	});

	describe('mutate', () => {
		it('should mutate correct', () => {
			initData();
			const id = ids[0];
			expect(driver.select(id)).toEqual(driverData[id]);
			const res = driver.mutate(id, obj => {
				obj.age = 123;
				return obj;
			});

			expect(res).toBe(true);
			expect(driver.select(id)).toEqual({
				...driverData[id],
				age: 123,
			});
		});

		it('should change nothing when id unknown', () => {
			const before = driver.selectAll();

			const res = driver.mutate('some-id', obj => {
				obj.name = 'not-going-to-be-changed';
			});

			const after = driver.selectAll();
			expect(before).toEqual(after);
			expect(res).toBe(false);
		});

		it('should mutate correct without return', () => {
			initData();
			const id = ids[0];
			expect(driver.select(id)).toEqual(driverData[id]);
			const res = driver.mutate(id, obj => {
				obj.age = 123;
			});

			expect(res).toBe(true);
			expect(driver.select(id)).toEqual({
				...driverData[id],
				age: 123,
			});
		});

		it('should mutate where correct', () => {
			initData();
			const id = ids[0];
			expect(driver.select(id)).toEqual(driverData[id]);
			const res = driver.mutateWhere(
				entry => entry._microdbId === id,
				obj => {
					obj.age = 123;
					return obj;
				}
			);

			expect(res).toBe(true);
			expect(driver.select(id)).toEqual({
				...driverData[id],
				age: 123,
			});
		});

		it('should mutate nothing where correct', () => {
			initData();
			const before = driver.selectAll();
			const res = driver.mutateWhere(
				user => user._microdbId === 'some-id',
				obj => {
					obj.name = 'my-name';
				}
			);

			const after = driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
		});

		it('should mutate all where correct', () => {
			initData();

			driver.mutateAllWhere(
				entry => entry.age > 30,
				obj => {
					obj.age = 50;
					return obj;
				}
			);
			const data = driver.selectAll();
			expect(data.length).toBeGreaterThan(0);

			for (const obj of data) {
				expect(obj).toEqual({
					...driverData[obj._microdbId],
					age: driverData[obj._microdbId].age > 30 ? 50 : driverData[obj._microdbId].age,
				});
			}
		});

		it('should mutate nothing all where correct', () => {
			initData();
			const before = driver.selectAll();
			const count = driver.mutateAllWhere(
				user => user._microdbId === 'some-id',
				obj => {
					obj.name = 'my-name';
				}
			);

			const after = driver.selectAll();
			expect(before).toEqual(after);
			expect(count).toBe(0);
		});

		it('should mutate all where without return correct', () => {
			initData();
			driver.mutateAllWhere(
				entry => true,
				obj => {
					obj.age += 10;
				}
			);
			const data = driver.selectAll();
			expect(data.length).toBeGreaterThan(0);
			for (const obj of data) {
				expect(obj).toEqual({
					...driverData[obj._microdbId],
					age: driverData[obj._microdbId].age + 10,
				});
			}
		});

		it('should mutate all correct', () => {
			initData();
			driver.mutateAll(obj => {
				obj.age += 10;
				return obj;
			});
			const data = driver.selectAll();
			expect(data.length).toBeGreaterThan(0);
			for (const obj of data) {
				expect(obj).toEqual({
					...driverData[obj._microdbId],
					age: driverData[obj._microdbId].age + 10,
				});
			}
		});

		it('should mutate all without return correct', () => {
			initData();
			driver.mutateAll(obj => {
				obj.age += 10;
			});
			const data = driver.selectAll();
			expect(data.length).toBeGreaterThan(0);
			for (const obj of data) {
				expect(obj).toEqual({
					...driverData[obj._microdbId],
					age: driverData[obj._microdbId].age + 10,
				});
			}
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

		it('should delete nothing correct', () => {
			initData();

			const before = driver.selectAll();

			const res = driver.delete('some-id');

			const after = driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
		});

		it('should delete where correct', () => {
			initData();

			const id = ids[0];

			driver.deleteWhere(entry => entry._microdbId === id);

			expect(driver.selectAll()).not.toContain(driverData[id]);
			expect(driver.selectAll().length).toEqual(ids.length - 1);
		});

		it('should delete nothing where correct', () => {
			initData();

			const before = driver.selectAll();

			const res = driver.deleteWhere(entry => entry._microdbId === 'some-id');

			const after = driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
		});

		it('should delete all where correct', () => {
			initData();
			const before = driver.selectAll();

			driver.deleteAllWhere(entry => entry.age > 30);

			const after = driver.selectAll();
			expect(after).toEqual(before.filter(obj => obj.age <= 30));
		});

		it('should delete nothing all where correct', () => {
			initData();

			const before = driver.selectAll();

			const count = driver.deleteAllWhere(entry => entry._microdbId === 'some-id');

			const after = driver.selectAll();

			expect(before).toEqual(after);
			expect(count).toBe(0);
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
