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
			_id: string;
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
				_id: id,
			};
		}
	};

	beforeEach(() => {
		expect(driver.selectAll()).toEqual([]);
	});

	afterEach(() => {
		driver.flush();
	});

	it('should create object', () => {
		const data = {
			name: 'john',
			age: 23,
		};
		const id = driver.create(data);

		expect(driver.selectAll()).toEqual([
			{
				_id: id,
				...data,
			},
		]);
	});

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
