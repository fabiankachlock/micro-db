import * as fs from 'fs';
import path from 'path';
import { MicroDBJanitor } from './janitor';
import type { MicroDBData, MicroDBOptions, MicroDBSerializer } from './micro-db';
import { JSONSerializer } from './serializer/JSONSerializer';

const defaultOptions: MicroDBOptions = {
	fileName: 'micro.db',
	serializer: new JSONSerializer(),
	janitorCronjob: undefined,
	defaultData: undefined,
};

const ensureDirectoryExistence = (filePath: string) => {
	const dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	fs.mkdirSync(dirname, { recursive: true });
};

export class MicroDBBase {
	private writeStream: fs.WriteStream;

	private currentData: MicroDBData;

	readonly fileName: string;

	readonly dataSerializer: MicroDBSerializer;

	readonly janitor: MicroDBJanitor | undefined = undefined;

	constructor(options: Partial<MicroDBOptions> = {}) {
		const resolvedOptions = {
			...defaultOptions,
			...options,
		};

		this.fileName = resolvedOptions.fileName;
		this.dataSerializer = resolvedOptions.serializer;

		let newFileCreated = false;
		this.currentData = {};

		// create database file if needed
		if (!fs.existsSync(this.fileName)) {
			ensureDirectoryExistence(this.fileName);

			fs.openSync(this.fileName, 'w');
			newFileCreated = true;
		}

		// read initial data
		if (!newFileCreated) {
			const initialRawData = fs.readFileSync(this.fileName);
			const initialData = this.dataSerializer.deserialize(initialRawData.toString());
			this.currentData = initialData;
		}

		this.writeStream = fs.createWriteStream(this.fileName, { flags: 'a' });

		// write default data when a new file is created
		if (newFileCreated && resolvedOptions.defaultData) {
			this.writeBatch(resolvedOptions.defaultData);
		}

		// setup personal janitor if needed
		if (resolvedOptions.janitorCronjob) {
			this.janitor = new MicroDBJanitor(resolvedOptions.janitorCronjob, this);
		}
	}

	// return current data
	read = (): MicroDBData => {
		return this.currentData;
	};

	// store a new data snapshot
	write = (id: string, data: any) => {
		if (data === undefined) {
			delete this.currentData[id];
		} else {
			this.currentData[id] = data;
		}
		this.writeStream.write(this.dataSerializer.serializeObject(id, data));
	};

	// store multiple new snapshots
	writeBatch = (data: MicroDBData) => {
		let dataToWrite = '';
		for (const [key, value] of Object.entries(data)) {
			this.currentData[key] = value;
			dataToWrite += this.dataSerializer.serializeObject(key, value);
		}
		this.writeStream.write(dataToWrite);
	};

	// close write stream & kill janitor
	close = () => {
		this.writeStream.end();
		this.janitor?.kill();
	};
}
