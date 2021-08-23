import { MicroDBSubscription } from './subscription';

export type MicroDBSubscriptionCallback<ValueType, ExtraArguments> = (
	value: ValueType,
	extraArguments: ExtraArguments,
	subscription: MicroDBSubscription
) => void;

export type MicroDBSubscriptionInitializer<T> = {
	predicate: (value: T) => boolean;
	callImmidiate: boolean;
};
