import * as fs from 'fs';
import path from 'path';
import { createCallbackAwaiter, createWriteStreamAwaiter } from './helper';
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

	get isInitialized(): boolean {
		return this.writeStream !== undefined;
	}

	private currentData: MicroDBData = {};

	readonly config: MicroDBOptions;

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

		this.config = resolvedOptions;

		// initialization cant be awaited in constructor...
		if (!resolvedOptions.lazy) this.initialize();
	}

	async initialize() {
		if (this.isInitialized) return; // already initialized

		const newFileCreated = await this.ensureDatabaseFile();
		if (!newFileCreated) this.currentData = await this.readRawData();

		this.writeStream = fs.createWriteStream(this.config.fileName, { flags: 'a' });

		// write default data when a new file is created
		if (newFileCreated && this.config.defaultData) {
			await this.writeBatch(this.config.defaultData); // TODO: check if array ?? or in driver ???
		}

		// setup personal janitor if needed
		if (this.config.janitorCronjob) {
			this._janitor = new MicroDBJanitor(this.config.janitorCronjob, this);
		}
	}

	private async ensureDatabaseFile(): Promise<boolean> {
		return fs.promises
			.access(this.config.fileName, fs.constants.F_OK)
			.then(() => false) // no new file created
			.catch(async () => {
				await this.ensureDirectoryExistence(this.config.fileName);
				await fs.promises.open(this.config.fileName, 'w');
				return true;
			});
	}

	private async ensureDirectoryExistence(filePath: string) {
		const dirname = path.dirname(filePath);
		return fs.promises.access(dirname, fs.constants.F_OK).catch(async () => {
			await fs.promises.mkdir(dirname, { recursive: true });
		});
	}

	private async readRawData(): Promise<MicroDBData> {
		const initialRawData = await fs.promises.readFile(this.config.fileName);
		const initialData = await this.config.serializer.deserialize(initialRawData.toString());
		return initialData;
	}

	// return current data
	async read(): Promise<MicroDBData> {
		if (!this.isInitialized) await this.initialize();
		return this.currentData;
	}

	// store a new data snapshot
	async write(id: string, data: any): Promise<void> {
		const { waiter, callback } = createWriteStreamAwaiter();

		if (data === undefined) {
			delete this.currentData[id];
		} else {
			this.currentData[id] = data;
		}

		if (!this.isInitialized) await this.initialize();
		this.writeStream!.write(await this.config.serializer.serializeObject(id, data), callback);
		await waiter;
		this.valueChanged();
	}

	// store multiple new snapshots
	async writeBatch(data: MicroDBData): Promise<void> {
		const { waiter, callback } = createWriteStreamAwaiter();
		let dataToWrite = '';

		for (const [key, value] of Object.entries(data)) {
			if (value === undefined) {
				delete this.currentData[key];
			} else {
				this.currentData[key] = value;
			}
			dataToWrite += await this.config.serializer.serializeObject(key, value);
		}

		if (!this.isInitialized) await this.initialize();
		this.writeStream!.write(dataToWrite, callback);
		await waiter;
		this.valueChanged();
	}

	// free up memory space
	async deallocate() {
		const { callback, waiter } = createCallbackAwaiter();
		this.currentData = {};
		this.writeStream?.end(callback);
		await waiter;
		this.writeStream = undefined;
	}

	// close write stream & kill janitor
	async close() {
		const { callback, waiter } = createCallbackAwaiter();
		this.writeStream?.end('', callback);
		await waiter;
		await this.janitor?.kill();
	}
}
