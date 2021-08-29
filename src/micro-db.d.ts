export type MicroDBData = Record<string, any>;

export interface MicroDBSerializer {
	serializeObject(key: string, value: any): string;
	serializeAll(data: MicroDBData): string;
	deserialize(raw: string): MicroDBData;
}

export interface MicroDBOptions {
	fileName: string;
	defaultData: MicroDBData | undefined;
	serializer: MicroDBSerializer;
	janitorCronjob: string | undefined;
}

export type WherePredicate<T> = (object: MicroDBEntry<T>) => boolean;

export type Mutation<A, B> = (object: A, id: string) => B;

export type MicroDBEntry<T extends {}> = T & { _microdbId: string };
