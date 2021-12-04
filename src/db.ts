import * as fs from 'fs';
import path from 'path';
import { MicroDBJanitor } from './janitor';
import type { MicroDBData, MicroDBOptions } from './micro-db';
import { JSONSerializer } from './serializer/JSONSerializer';
import { MicroDBPropertyWatchable } from './watcher/propertyWatchable';

export const MicroDBDefaultOptions: MicroDBOptions = {
	fileName: 'micro.db',
	serializer: new JSONSerializer(),
	janitorCronjob: undefined,
	defaultData: undefined,
	lazy: false,
};

type ExtraArgument = {
	base: MicroDBBase;
};
export class MicroDBBase extends MicroDBPropertyWatchable<MicroDBData, ExtraArgument> {
	private writeStream: fs.WriteStream | undefined;

	private currentData: MicroDBData = {};

	private options: MicroDBOptions;

	private _janitor: MicroDBJanitor | undefined = undefined;
	public get janitor(): MicroDBJanitor | undefined {
		return this._janitor;
	}

	// @internal
	_getCallbackArguments = (): ExtraArgument => ({
		base: this,
	});

	// @internal
	_currentValue = (): MicroDBData => this.currentData;

	constructor(options: Partial<MicroDBOptions> = {}) {
		super();

		const resolvedOptions = {
			...MicroDBDefaultOptions,
			...options,
		};

		this.options = resolvedOptions;

		if (!resolvedOptions.lazy) this.initialize(resolvedOptions);
	}

	private initialize = (options: MicroDBOptions) => {
		const newFileCreated = this.ensureDatabaseFile();
		if (!newFileCreated) this.readRawData();

		this.writeStream = fs.createWriteStream(this.options.fileName, { flags: 'a' });

		// write default data when a new file is created
		if (newFileCreated && options.defaultData) {
			this.writeBatch(options.defaultData);
		}

		// setup personal janitor if needed
		if (options.janitorCronjob) {
			this._janitor = new MicroDBJanitor(options.janitorCronjob, this);
		}
	};

	private ensureDatabaseFile = (): boolean => {
		// create database file if needed
		if (!fs.existsSync(this.options.fileName)) {
			this.ensureDirectoryExistence(this.options.fileName);

			fs.openSync(this.options.fileName, 'w');
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
		const initialRawData = fs.readFileSync(this.options.fileName);
		const initialData = this.options.serializer.deserialize(initialRawData.toString());
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
		if (!this.writeStream) this.initialize(this.options);
		this.writeStream!.write(this.options.serializer.serializeObject(id, data));
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
			dataToWrite += this.options.serializer.serializeObject(key, value);
		}
		if (!this.writeStream) this.initialize(this.options);
		this.writeStream!.write(dataToWrite);
		this.valueChanged();
	};

	// free up memory space
	deallocate = () => {
		this.currentData = {};
		this.writeStream?.end();
		this.writeStream = undefined;
	};

	// close write stream & kill janitor
	close = () => {
		this.writeStream?.end();
		this.janitor?.kill();
	};
}
