import { Subscription } from './subscription';

export type SubscriptionCallback<Value, ExtraArguments> = (
	value: Value,
	extraArguments: ExtraArguments,
	subscription: Subscription
) => void;

export type SubscriptionOptions<T> = {
	predicate: (value: T) => boolean;
	callImmediate: boolean;
};
