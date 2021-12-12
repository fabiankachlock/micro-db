import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { MicroDBWatchable } from './watchable';

export abstract class MicroDBPropertyWatchable<Value, CallbackArguments> extends MicroDBWatchable<
	Value,
	CallbackArguments
> {
	private mergeOptions<P extends keyof Value>(
		property: P,
		options: Partial<SubscriptionOptions<Value[P]>>
	): Partial<SubscriptionOptions<Value>> {
		return {
			...options,
			predicate: (newValue, lastValue) => {
				const changed = lastValue ? newValue[property] !== lastValue[property] : true;

				if (changed) {
					return options.predicate
						? options.predicate(newValue[property], lastValue ? lastValue[property] : undefined)
						: true;
				}

				return false;
			},
		};
	}

	$watchProperty<P extends keyof Value>(
		property: P,
		callback: SubscriptionCallback<Value[P], CallbackArguments>,
		options: Partial<SubscriptionOptions<Value[P]>> = {}
	) {
		return this.$watch(
			(value, args, sub) => callback(value[property], args, sub),
			this.mergeOptions(property, options)
		);
	}

	$watchPropertyNext<P extends keyof Value>(
		property: P,
		callback: SubscriptionCallback<Value[P], CallbackArguments>,
		times: number = 1,
		options: Partial<SubscriptionOptions<Value[P]>> = {}
	) {
		return this.$watchNext(
			(value, args, sub) => callback(value[property], args, sub),
			times,
			this.mergeOptions(property, options)
		);
	}
}
