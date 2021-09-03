import { MicroDBEntry } from './micro-db';

// @internal
export const withId = <T extends {}>(value: T, id: string): MicroDBEntry<T> => ({
	_microdbId: id,
	...value,
});
