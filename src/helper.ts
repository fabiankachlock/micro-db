import { MicroDBEntry } from './micro-db';

export const withId = <T extends {}>(value: T, id: string): MicroDBEntry<T> => ({
	_microdbId: id,
	...value,
});
