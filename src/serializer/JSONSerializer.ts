import type { DBData, Serializer } from '../micro-db';

/**
 * JSONSerializer Format:
 * key1: {"json":1}
 * key2: {"json":2}
 */

export class JSONSerializer implements Serializer {
	serializeObject = (key: string, value: any) => `${key}:${JSON.stringify(value)}\n`;

	serializeAll = (data: DBData) =>
		Object.entries(data)
			.map(e => this.serializeObject(e[0], e[1])) // serialize every single key-value-pair
			.join(''); // and combinde them into a single string

	deserialize = (raw: string) => {
		const rows = raw.split('\n');
		const pairs = rows.map(entry => {
			const index = entry.indexOf(':');
			const [key, value] = [entry.substring(0, index), entry.substring(index + 1, entry.length)];

			if (key)
				return {
					key,
					value: value ? JSON.parse(value) : undefined,
				};
			else return undefined;
		});

		return pairs
			.filter(e => e !== undefined)
			.reduce((prev, curr) => {
				if (curr && curr.value) {
					prev[curr?.key || 'no-index'] = curr?.value;
				} else {
					// undefined data means record got deleted
					delete prev[curr?.key || 'no-index'];
				}
				return prev;
			}, {} as DBData);
	};
}
