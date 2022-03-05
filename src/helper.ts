import { MicroDBEntry } from './micro-db';

// @internal
export const withId = <T extends {}>(value: T, id: string): MicroDBEntry<T> => ({
	_microdbId: id,
	...value,
});

// @internal
export type AwaiterCallback<SuccessType = void, ErrorType = void> = <T extends (...args: any) => void>(
	promise: { resolve: (success: SuccessType) => void; reject: (error: ErrorType) => void },
	...args: Parameters<T>
) => void;

// @internal
export const createCallbackAwaiter = <SuccessType = void, ErrorType = void>(
	_callback?: AwaiterCallback<SuccessType, ErrorType>
) => {
	let resolve: (success: SuccessType) => void = () => {};
	let reject: (error: ErrorType) => void = () => {};

	const promise = new Promise<SuccessType>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return {
		waiter: promise,
		callback: async (...args: unknown[]) => {
			if (_callback) {
				await _callback(
					{
						resolve,
						reject,
					},
					...args
				);
			}
			resolve(void 0 as unknown as SuccessType);
		},
	};
};

export const createWriteStreamAwaiter = () =>
	createCallbackAwaiter<void, Error | null | undefined>(({ resolve, reject }, error: Error | null | undefined) => {
		if (error) {
			return reject(error);
		}
		resolve();
	});
