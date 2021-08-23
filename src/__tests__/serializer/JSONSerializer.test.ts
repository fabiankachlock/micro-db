import { JSONSerializer } from '../../serializer/JSONSerializer';
import { MicroDB } from '../../index';
import { MicroDBBase } from '../../db';

describe('micro-db/JSONSerializer tests', () => {
	const serializer = new JSONSerializer();

	it('should serialize object correct', () => {
		const data = {
			str: 'abc',
			num: 4,
			bool: true,
		};

		expect(serializer.serializeObject('123', data)).toBe(`123:${JSON.stringify(data)}\n`);
	});

	it('should serialize undefined object correct', () => {
		const data = undefined;

		expect(serializer.serializeObject('123', data)).toBe(`123:undefined\n`);
	});

	it('should serialize multiple object correct', () => {
		const data = {
			id1: {
				str: 'abc',
				num: 4,
				bool: true,
			},
			id2: undefined,
		};

		expect(serializer.serializeAll(data)).toBe(`id1:${JSON.stringify(data.id1)}\nid2:${JSON.stringify(data.id2)}\n`);
	});

	it('should deserialize data correct', () => {
		const data = {
			id1: {
				str: 'abc',
				num: 4,
				bool: true,
			},
			id2: undefined, // removed
			id3: null, // not removed
		};
		const str = serializer.serializeAll(data);

		const deserialized = serializer.deserialize(str);

		expect(deserialized).toBeTruthy();

		expect('id1' in deserialized).toBe(true);
		expect('id2' in deserialized).toBe(false);
		expect('id3' in deserialized).toBe(true);

		expect(deserialized['id1']).toEqual(data.id1);
		expect(deserialized['id3']).toEqual(null);
	});

	it('should override data correctly', () => {
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
		const str = serializer.serializeAll(data);

		const data1 = {
			id1: undefined, // now deleted
			id2: {
				visible: true,
			},
			id5: {
				now: 'new',
			},
		};

		const str1 = serializer.serializeAll(data1);

		const deserialized = serializer.deserialize(str + str1);

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

	it('should skip lines with wrong format', () => {
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
			const desirialized = serializer.deserialize(testCases[i]);

			expect(desirialized).toEqual(results[i]);
		}
	});
});
