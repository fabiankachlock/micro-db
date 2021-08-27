import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscribeable, SubscriptionManager } from './subscriptionManager';

export abstract class MicroDBWatchable<Value, CallbackArguments> implements Subscribeable<Value, CallbackArguments> {
	_subscriptionManager: SubscriptionManager<Value, CallbackArguments>;

	constructor() {
		this._subscriptionManager = new SubscriptionManager(this);
	}

	abstract _currentValue(): Value;
	abstract _getCallbackArguments(): CallbackArguments;

	protected handlers: (() => void)[] = [];

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
			predicate: value => {
				const allowed = options.predicate ? options.predicate(value) : true;

				if (allowed) {
					if (called) {
						// destroy subscription when its called
						subscription.destroy();
						return false;
					}
					// only set called when its acually allowed
					called = true;
				}
				return allowed;
			},
		});

		return subscription;
	};
}
