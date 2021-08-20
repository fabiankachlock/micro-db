export type DBData = Record<string, any>;

export interface Serializer {
	serializeObject(key: string, value: any): string;
	serializeAll(data: DBData): string;
	deserialize(raw: string): DBData;
}

export type MicroDBOptions = {
	fileName: string;
	defaultData: DBData | undefined;
	serializer: Serializer;
	janitorCronjob: string | undefined;
};

export type WherePredicate<T> = (object: T) => boolean;

export type DBMutation<A, B> = (object: A) => B;

export type DBEntry<T> = {
	id: string;
	value: T;
};
