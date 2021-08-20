export type MicroDBData = Record<string, any>;

export interface MicroDBSerializer {
	serializeObject(key: string, value: any): string;
	serializeAll(data: MicroDBData): string;
	deserialize(raw: string): MicroDBData;
}

export type MicroDBOptions = {
	fileName: string;
	defaultData: MicroDBData | undefined;
	serializer: MicroDBSerializer;
	janitorCronjob: string | undefined;
};

export type WherePredicate<T> = (object: T) => boolean;

export type Mutation<A, B> = (object: A) => B;

export type MicroDBEntry<T> = {
	id: string;
	value: T;
};
