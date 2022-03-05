import { Subscription } from './subscription';

export type SubscriptionCallback<Value, ExtraArguments> = (
	value: Value,
	extraArguments: ExtraArguments,
	subscription: Subscription
) => void;

export type SubscriptionOptions<T> = {
	predicate(newValue: T, lastValue: T | undefined): boolean;
	callImmediate: boolean;
};
