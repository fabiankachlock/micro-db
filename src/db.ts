import * as fs from 'fs';
import path from 'path';
import { MicroDBJanitor } from './janitor';
import type { MicroDBData, MicroDBOptions, MicroDBSerializer } from './micro-db';
import { JSONSerializer } from './serializer/JSONSerializer';
import { MicroDBPropertyWatchable } from './watcher/propertyWatchable';

export const MicroDBDefaultOptions: MicroDBOptions = {
	fileName: 'micro.db',
	serializer: new JSONSerializer(),
	janitorCronjob: undefined,
	defaultData: undefined,
};

type ExtraArgument = {
	base: MicroDBBase;
};
export class MicroDBBase extends MicroDBPropertyWatchable<MicroDBData, ExtraArgument> {
	private writeStream: fs.WriteStream;

	private currentData: MicroDBData = {};

	readonly fileName: string;

	readonly dataSerializer: MicroDBSerializer;

	readonly janitor: MicroDBJanitor | undefined = undefined;

	_getCallbackArguments = (): ExtraArgument => ({
		base: this,
	});

	_currentValue = (): MicroDBData => this.currentData;

	constructor(options: Partial<MicroDBOptions> = {}) {
		super();

		const resolvedOptions = {
			...MicroDBDefaultOptions,
			...options,
		};

		this.fileName = resolvedOptions.fileName;
		this.dataSerializer = resolvedOptions.serializer;

		const newFileCreated = this.ensureDatabaseFile();
		if (!newFileCreated) this.readRawData();

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

	private ensureDatabaseFile = (): boolean => {
		// create database file if needed
		if (!fs.existsSync(this.fileName)) {
			this.ensureDirectoryExistence(this.fileName);

			fs.openSync(this.fileName, 'w');
			return true;
		}
		return false;
	};

	private ensureDirectoryExistence = (filePath: string) => {
		const dirname = path.dirname(filePath);
		if (fs.existsSync(dirname)) {
			return true;
		}
		fs.mkdirSync(dirname, { recursive: true });
	};

	private readRawData = () => {
		const initialRawData = fs.readFileSync(this.fileName);
		const initialData = this.dataSerializer.deserialize(initialRawData.toString());
		this.currentData = initialData;
	};

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
		this.valueChanged();
	};

	// store multiple new snapshots
	writeBatch = (data: MicroDBData) => {
		let dataToWrite = '';
		for (const [key, value] of Object.entries(data)) {
			if (value === undefined) {
				delete this.currentData[key];
			} else {
				this.currentData[key] = value;
			}
			dataToWrite += this.dataSerializer.serializeObject(key, value);
		}
		this.writeStream.write(dataToWrite);
		this.valueChanged();
	};

	// close write stream & kill janitor
	close = () => {
		this.writeStream.end();
		this.janitor?.kill();
	};
}
