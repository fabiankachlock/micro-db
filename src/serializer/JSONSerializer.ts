import type { MicroDBData, MicroDBSerializer } from '../micro-db';

/**
 * JSONSerializer Format:
 * key1: {"json":1}
 * key2: {"json":2}
 */

export class JSONSerializer implements MicroDBSerializer {
	serializeObject = async (key: string, value: any) => `${key}:${JSON.stringify(value)}\n`;

	serializeAll = async (data: MicroDBData) => {
		let finalString = '';
		for (const entry of Object.entries(data)) {
			finalString += await this.serializeObject(entry[0], entry[1]); // serialize every single key-value-pair
		}
		return finalString;
	};

	deserialize = async (raw: string) => {
		const rows = raw.split('\n');
		const pairs = rows.map(entry => {
			// invalid line
			if (entry.length === 0) return undefined;

			// split key from data
			const index = entry.indexOf(':');

			// define parts
			const [key, value] = [entry.substring(0, index), entry.substring(index + 1, entry.length)];
			// invalid format: no separator or invalid key or value
			if (index === -1 || key.length === 0 || value.length === 0) return undefined;

			let json;
			if (value !== 'undefined') {
				try {
					// try parsing json ('null' parses as null)
					json = JSON.parse(value);
				} catch {
					json = undefined;
				}
			}

			return {
				key,
				value: json,
			};
		});

		// filter invalid records
		const validPairs = pairs.filter(e => e !== undefined) as { key: string; value: any }[];

		return validPairs.reduce((prev, curr) => {
			if (curr && curr.value !== undefined) {
				// set new data for key
				prev[curr.key] = curr.value;
			} else {
				// undefined data means record got deleted
				delete prev[curr.key];
			}
			return prev;
		}, {} as MicroDBData);
	};
}
