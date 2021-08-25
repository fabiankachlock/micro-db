import path from 'path';
import { MicroDBDriver } from '../driver';

describe('micro-db/DBDriver tests', () => {
	const dbPath = path.join('_dbdriver-tests', 'test.db');

	const driver = new MicroDBDriver<{
		name: string;
		age: number;
	}>({
		fileName: dbPath,
	});

	let driverData: Record<
		string,
		{
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

	const initData = () => {
		driverData = {};
		for (const obj of _driverData) {
			const id = driver.create(obj);
			driverData[id] = obj;
		}
	};

	beforeEach(() => {
		expect(driver.data).toEqual({});
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

		expect(driver.data).toEqual({ [id]: data });
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
			expect(driver.selectWhere(obj => obj.name === value.name)?.value).toEqual(value);
		}
	});

	it('should select all correct', () => {
		initData();

		const selected = driver.selectAllWhere(person => person.age < 30);

		expect(selected.map(obj => obj.value)).toEqual(Object.values(driverData).filter(person => person.age < 30));
	});

	it('should flush all data', () => {
		driver.create({
			name: '',
			age: 0,
		});

		expect(Object.keys(driver.data).length).toBe(1);

		driver.flush();

		expect(driver.data).toEqual({});
	});
});
