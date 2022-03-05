import { JSONSerializer } from '../../serializer/JSONSerializer';

describe('micro-db/JSONSerializer tests', () => {
	const serializer = new JSONSerializer();

	it('should serialize object correct', async () => {
		const data = {
			str: 'abc',
			num: 4,
			bool: true,
		};

		expect(await serializer.serializeObject('123', data)).toBe(`123:${JSON.stringify(data)}\n`);
	});

	it('should serialize undefined object correct', async () => {
		const data = undefined;

		expect(await serializer.serializeObject('123', data)).toBe(`123:undefined\n`);
	});

	it('should serialize multiple object correct', async () => {
		const data = {
			id1: {
				str: 'abc',
				num: 4,
				bool: true,
			},
			id2: undefined,
		};

		expect(await serializer.serializeAll(data)).toBe(
			`id1:${JSON.stringify(data.id1)}\nid2:${JSON.stringify(data.id2)}\n`
		);
	});

	it('should deserialize data correct', async () => {
		const data = {
			id1: {
				str: 'abc',
				num: 4,
				bool: true,
			},
			id2: undefined, // removed
			id3: null, // not removed
		};
		const str = await serializer.serializeAll(data);

		const deserialized = await serializer.deserialize(str);

		expect(deserialized).toBeTruthy();

		expect('id1' in deserialized).toBe(true);
		expect('id2' in deserialized).toBe(false);
		expect('id3' in deserialized).toBe(true);

		expect(deserialized['id1']).toEqual(data.id1);
		expect(deserialized['id3']).toEqual(null);
	});

	it('should override data correctly', async () => {
		const data = {
			id1: {
				str: 'abc',
				num: 4,
				bool: true,
			},
			id2: undefined, // removed
			id3: null, // not removed
			id4: {
				another: 'one',
			},
		};
		const str = await serializer.serializeAll(data);

		const data1 = {
			id1: undefined, // now deleted
			id2: {
				visible: true,
			},
			id5: {
				now: 'new',
			},
		};

		const str1 = await serializer.serializeAll(data1);

		const deserialized = await serializer.deserialize(str + str1);
		expect(deserialized).toBeTruthy();

		expect('id1' in deserialized).toBe(false);
		expect('id2' in deserialized).toBe(true);
		expect('id3' in deserialized).toBe(true);
		expect('id4' in deserialized).toBe(true);
		expect('id5' in deserialized).toBe(true);

		expect(deserialized['id2']).toEqual(data1.id2);
		expect(deserialized['id3']).toEqual(null);
		expect(deserialized['id4']).toEqual(data.id4);
		expect(deserialized['id5']).toEqual(data1.id5);
	});

	it('should skip lines with wrong format', async () => {
		const testCases = [
			`id0 ${JSON.stringify({ test: true })}\n`, // no ':'
			`:${JSON.stringify({ test: true })}\n`, // no key
			`id2:abc\n`, // invalid data
			`asufo ajksfawl auswvj}\n`, // nonsence
			'no lines', // no lines
			'\n\n', // empty lines
		];

		const results = [{}, {}, {}, {}, {}, {}];

		for (let i = 0; i < testCases.length; i++) {
			const deserialized = await serializer.deserialize(testCases[i]);

			expect(deserialized).toEqual(results[i]);
		}
	});
});
