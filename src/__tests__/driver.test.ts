import mock from 'mock-fs';
import { MicroDBDriver } from '../driver';
import { createAwaiter, createDriverEnv } from './helper.test';

describe('micro-db/DBDriver tests', () => {
	beforeEach(() => {
		mock();
	});

	afterEach(() => {
		mock.restore();
	});

	const exampleData = [
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

	it('should init with zero config', async () => {
		const { awaiter, done } = createAwaiter();
		expect(async () => {
			const db = new MicroDBDriver({
				lazy: true, // needed for tests
			});
			await db.initialize();
			await db.close();
			done();
		}).not.toThrow();
		await awaiter;
	});

	// it('should setup cronjob correct', async () => {
	// 	const file = nextPath();
	// 	const janitorDriver = new MicroDBDriver({
	// 		fileName: file,
	// 		janitorCronjob: '* * * * * *',
	// 		lazy: true,
	// 	});
	// 	await janitorDriver.initialize();

	// 	const callback = jest.fn(() => {});

	// 	janitorDriver.janitor?.$watchNext(callback);

	// 	await sleep(1250);

	// 	expect(callback).toBeCalled();

	// 	await janitorDriver.close();
	// });

	describe('create', () => {
		it('should create object', async () => {
			const { driver } = await createDriverEnv();
			const data = {
				name: 'john',
				age: 23,
			};

			const id = await driver.create(data);
			expect(await driver.selectAll()).toEqual([
				{
					_microdbId: id,
					...data,
				},
			]);
			await driver.close();
		});

		it('should create duplicate objects (same data)', async () => {
			const { driver } = await createDriverEnv();
			const data = {
				name: 'john',
				age: 23,
			};

			const id = await driver.create(data);

			expect(await driver.selectAll()).toEqual([
				{
					_microdbId: id,
					...data,
				},
			]);

			const { awaiter, done } = createAwaiter();
			expect(async () => {
				const data1 = {
					name: 'john',
					age: 23,
				};

				const _ = await driver.create(data1);

				expect((await driver.selectAll()).length).toEqual(2);
				done();
			}).not.toThrow();
			await awaiter;
			await driver.close();
		});
	});

	describe('select', () => {
		it('should select correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			for (const [id, value] of Object.entries(initialData)) {
				expect(await driver.select(id)).toEqual(value);
			}
			await driver.close();
		});

		it('should select correct with predicate', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			for (const [_, value] of Object.entries(initialData)) {
				expect(await driver.selectWhere(obj => obj.name === value.name)).toEqual(value);
			}
			await driver.close();
		});

		it('should select all correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			const selected = await driver.selectAllWhere(person => person.age < 30);

			expect(selected).toEqual(Object.values(initialData).filter(person => person.age < 30));
			await driver.close();
		});

		it('should return all data', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			expect(await driver.selectAll()).toEqual(Object.values(initialData));
			await driver.close();
		});

		it('should return empty data correct', async () => {
			const { driver } = await createDriverEnv();

			expect(await driver.selectAll()).toEqual([]);
			await driver.close();
		});

		it('should return undefined correct', async () => {
			const { driver } = await createDriverEnv(exampleData);
			const { awaiter, done } = createAwaiter();

			expect(async () => {
				expect(await driver.select('some-id')).toBeUndefined();
				done();
			}).not.toThrow();
			await awaiter;
			await driver.close();
		});

		it('should return undefined correct in where predicate', async () => {
			const { driver } = await createDriverEnv(exampleData);
			const { awaiter, done } = createAwaiter();

			expect(async () => {
				expect(await driver.selectWhere(entry => entry._microdbId === 'some-id')).toBeUndefined();
				done();
			}).not.toThrow();
			await awaiter;
			await driver.close();
		});
	});

	describe('update', () => {
		it('should update correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);
			const id = Object.entries(initialData)[0][0];
			const newName = 'newName';

			await driver.update(id, {
				name: newName,
			});

			expect(await driver.select(id)).toEqual({
				...initialData[id],
				name: newName,
			});
			await driver.close();
		});

		it('should change nothing when id unknown', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();

			const res = await driver.update('some-id', {
				name: 'not-going-to-be-changed',
			});

			const after = await driver.selectAll();
			expect(before).toEqual(after);
			expect(res).toBe(false);
			await driver.close();
		});

		it('should update where correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);
			const id = Object.entries(initialData)[0][0];
			const newName = 'newName';
			const oldName = initialData[id].name;

			await driver.updateWhere(user => user.name === oldName, {
				name: newName,
			});

			expect(await driver.select(id)).toEqual({
				...initialData[id],
				name: newName,
			});
			await driver.close();
		});

		it('should update nothing where correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			const res = await driver.updateWhere(user => user._microdbId === 'some-id', {
				name: 'my-name',
			});

			const after = await driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
			await driver.close();
		});

		it('should update all correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			await driver.updateAllWhere(entry => entry.age > 30, { age: 50 });
			const data = await driver.selectAll();
			expect(data.length).toBeGreaterThan(0);

			for (const obj of data) {
				expect(obj).toEqual({
					...initialData[obj._microdbId],
					age: initialData[obj._microdbId].age > 30 ? 50 : initialData[obj._microdbId].age,
				});
			}
			await driver.close();
		});

		it('should update nothing all where correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			const count = await driver.updateAllWhere(user => user._microdbId === 'some-id', {
				name: 'my-name',
			});

			const after = await driver.selectAll();
			expect(before).toEqual(after);
			expect(count).toBe(0);
			await driver.close();
		});
	});

	describe('mutate', () => {
		it('should mutate correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);
			const id = Object.entries(initialData)[0][0];

			expect(await driver.select(id)).toEqual(initialData[id]);
			const res = await driver.mutate(id, obj => {
				obj.age = 123;
				return obj;
			});

			expect(res).toBe(true);
			expect(await driver.select(id)).toEqual({
				...initialData[id],
				age: 123,
			});
			await driver.close();
		});

		it('should change nothing when id unknown', async () => {
			const { driver } = await createDriverEnv(exampleData);
			const before = await driver.selectAll();

			const res = await driver.mutate('some-id', obj => {
				obj.name = 'not-going-to-be-changed';
			});

			const after = await driver.selectAll();
			expect(before).toEqual(after);
			expect(res).toBe(false);
			await driver.close();
		});

		it('should mutate correct without return', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);
			const id = Object.entries(initialData)[0][0];

			expect(await driver.select(id)).toEqual(initialData[id]);
			const res = await driver.mutate(id, obj => {
				obj.age = 123;
			});

			expect(res).toBe(true);
			expect(await driver.select(id)).toEqual({
				...initialData[id],
				age: 123,
			});
			await driver.close();
		});

		it('should mutate where correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);
			const id = Object.entries(initialData)[0][0];

			expect(await driver.select(id)).toEqual(initialData[id]);
			const res = await driver.mutateWhere(
				entry => entry._microdbId === id,
				obj => {
					obj.age = 123;
					return obj;
				}
			);

			expect(res).toBe(true);
			expect(await driver.select(id)).toEqual({
				...initialData[id],
				age: 123,
			});
			await driver.close();
		});

		it('should mutate nothing where correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			const res = await driver.mutateWhere(
				user => user._microdbId === 'some-id',
				obj => {
					obj.name = 'my-name';
				}
			);

			const after = await driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
			await driver.close();
		});

		it('should mutate all where correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			await driver.mutateAllWhere(
				entry => entry.age > 30,
				obj => {
					obj.age = 50;
					return obj;
				}
			);
			const data = await driver.selectAll();
			expect(data.length).toBeGreaterThan(0);

			for (const obj of data) {
				expect(obj).toEqual({
					...initialData[obj._microdbId],
					age: initialData[obj._microdbId].age > 30 ? 50 : initialData[obj._microdbId].age,
				});
			}
			await driver.close();
		});

		it('should mutate nothing all where correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			const count = await driver.mutateAllWhere(
				user => user._microdbId === 'some-id',
				obj => {
					obj.name = 'my-name';
				}
			);

			const after = await driver.selectAll();
			expect(before).toEqual(after);
			expect(count).toBe(0);
			await driver.close();
		});

		it('should mutate all where without return correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			await driver.mutateAllWhere(
				entry => true,
				obj => {
					obj.age += 10;
				}
			);
			const data = await driver.selectAll();
			expect(data.length).toBeGreaterThan(0);

			for (const obj of data) {
				expect(obj).toEqual({
					...initialData[obj._microdbId],
					age: initialData[obj._microdbId].age + 10,
				});
			}
			await driver.close();
		});

		it('should mutate all correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			await driver.mutateAll(obj => {
				obj.age += 10;
				return obj;
			});
			const data = await driver.selectAll();
			expect(data.length).toBeGreaterThan(0);

			for (const obj of data) {
				expect(obj).toEqual({
					...initialData[obj._microdbId],
					age: initialData[obj._microdbId].age + 10,
				});
			}
			await driver.close();
		});

		it('should mutate all without return correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);

			await driver.mutateAll(obj => {
				obj.age += 10;
			});
			const data = await driver.selectAll();
			expect(data.length).toBeGreaterThan(0);

			for (const obj of data) {
				expect(obj).toEqual({
					...initialData[obj._microdbId],
					age: initialData[obj._microdbId].age + 10,
				});
			}
			await driver.close();
		});
	});

	describe('delete', () => {
		it('should delete correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);
			const id = Object.entries(initialData)[0][0];

			await driver.delete(id);

			const data = await driver.selectAll();
			expect(data).not.toContain(initialData[id]);
			expect(data.length).toEqual(exampleData.length - 1);
			await driver.close();
		});

		it('should delete nothing correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			const res = await driver.delete('some-id');
			const after = await driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
			await driver.close();
		});

		it('should delete where correct', async () => {
			const { driver, initialData } = await createDriverEnv(exampleData);
			const id = Object.entries(initialData)[0][0];

			await driver.deleteWhere(entry => entry._microdbId === id);

			const data = await driver.selectAll();
			expect(data).not.toContain(initialData[id]);
			expect(data.length).toEqual(exampleData.length - 1);
			await driver.close();
		});

		it('should delete nothing where correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			const res = await driver.deleteWhere(entry => entry._microdbId === 'some-id');
			const after = await driver.selectAll();

			expect(res).toBe(false);
			expect(before).toEqual(after);
			await driver.close();
		});

		it('should delete all where correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			await driver.deleteAllWhere(entry => entry.age > 30);

			const after = await driver.selectAll();
			expect(after).toEqual(before.filter(obj => obj.age <= 30));
			await driver.close();
		});

		it('should delete nothing all where correct', async () => {
			const { driver } = await createDriverEnv(exampleData);

			const before = await driver.selectAll();
			const count = await driver.deleteAllWhere(entry => entry._microdbId === 'some-id');
			const after = await driver.selectAll();

			expect(before).toEqual(after);
			expect(count).toBe(0);
			await driver.close();
		});

		it('should flush all data', async () => {
			const { driver } = await createDriverEnv();
			await driver.create({
				name: '',
				age: 0,
			});

			expect((await driver.selectAll()).length).toBe(1);

			await driver.flush();

			expect(await driver.selectAll()).toEqual([]);
			await driver.close();
		});
	});
});
