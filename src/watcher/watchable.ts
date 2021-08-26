import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscribeable, SubscriptionManager } from './subscriptionManager';

export abstract class MicroDBWatchable<ValueType, CallbackArguments>
	implements Subscribeable<ValueType, CallbackArguments>
{
	_subscriptionManager: SubscriptionManager<ValueType, CallbackArguments>;

	constructor() {
		this._subscriptionManager = new SubscriptionManager(this);
	}

	abstract _currentValue(): ValueType;
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
		callback: SubscriptionCallback<ValueType, CallbackArguments>,
		options: Partial<SubscriptionOptions<ValueType>> = {}
	) => {
		return this._subscriptionManager.registerWatcher(callback, options);
	};

	$watchNext = (
		callback: SubscriptionCallback<ValueType, CallbackArguments>,
		options: Partial<SubscriptionOptions<ValueType>> = {}
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
