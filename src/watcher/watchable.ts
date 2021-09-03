import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscribeable, SubscriptionManager } from './subscriptionManager';

export abstract class MicroDBWatchable<Value, CallbackArguments> implements Subscribeable<Value, CallbackArguments> {
	// @internal
	_subscriptionManager: SubscriptionManager<Value, CallbackArguments>;

	constructor() {
		this._subscriptionManager = new SubscriptionManager(this);
	}

	abstract _currentValue(): Value;
	abstract _getCallbackArguments(): CallbackArguments;

	protected handlers: (() => void)[] = [];

	// @internal
	_onValueChange = (handler: () => void) => {
		this.handlers.push(handler);
	};

	protected valueChanged = () => {
		for (const handler of this.handlers) {
			handler();
		}
	};

	$watch = (
		callback: SubscriptionCallback<Value, CallbackArguments>,
		options: Partial<SubscriptionOptions<Value>> = {}
	) => {
		return this._subscriptionManager.registerWatcher(callback, options);
	};

	$watchNext = (
		callback: SubscriptionCallback<Value, CallbackArguments>,
		options: Partial<SubscriptionOptions<Value>> = {}
	) => {
		// init as not called
		let called = false;

		const subscription = this._subscriptionManager.registerWatcher(callback, {
			...options,
			predicate: (newValue, lastValue) => {
				const allowed = options.predicate ? options.predicate(newValue, lastValue) : true;

				if (allowed) {
					if (called) {
						// destroy subscription when its called
						subscription.destroy();
						return false;
					}
					// only set called when its actually allowed
					called = true;
				}
				return allowed;
			},
		});

		return subscription;
	};
}
