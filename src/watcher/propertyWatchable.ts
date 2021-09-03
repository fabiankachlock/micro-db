import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { MicroDBWatchable } from './watchable';

export abstract class MicroDBPropertyWatchable<Value, CallbackArguments> extends MicroDBWatchable<
	Value,
	CallbackArguments
> {
	$watchProperty = <P extends keyof Value>(
		property: P,
		callback: SubscriptionCallback<Value[P], CallbackArguments>,
		options: Partial<SubscriptionOptions<Value[P]>> = {}
	) => {
		return this._subscriptionManager.registerWatcher((value, args, sub) => callback(value[property], args, sub), {
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
		});
	};

	$watchPropertyNext = <P extends keyof Value>(
		property: P,
		callback: SubscriptionCallback<Value[P], CallbackArguments>,
		options: Partial<SubscriptionOptions<Value[P]>> = {}
	) => {
		// init as not called
		let called = false;

		const subscription = this._subscriptionManager.registerWatcher(
			(value, args, sub) => callback(value[property], args, sub),
			{
				...options,
				predicate: (newValue, lastValue) => {
					const changed = lastValue ? newValue[property] !== lastValue[property] : true;

					if (changed) {
						const allowed = options.predicate
							? options.predicate(newValue[property], lastValue ? lastValue[property] : undefined)
							: true;

						if (allowed) {
							if (called) {
								// destroy subscription when its called
								subscription.destroy();
								return false;
							}
							// only set called when its actually allowed
							called = true;
						}
						return true;
					}

					return false;
				},
			}
		);

		return subscription;
	};
}
