export type MicroDBData = Record<string, any>;

export interface MicroDBSerializer {
	serializeObject(key: string, value: any): Promise<string>;
	serializeAll(data: MicroDBData): Promise<string>;
	deserialize(raw: string): Promise<MicroDBData>;
}

export interface MicroDBOptions {
	fileName: string;
	defaultData: MicroDBData | undefined;
	serializer: MicroDBSerializer;
	janitorCronjob: string | undefined;
	lazy: boolean;
}

export type WherePredicate<T> = (object: MicroDBEntry<T>) => boolean;

export type Mutation<A, B> = (object: A, id: string) => B | void | Promise<B | void>;

export type MicroDBEntry<T extends {}> = T & { _microdbId: string };
