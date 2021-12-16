import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscribables, SubscriptionManager } from './subscriptionManager';

export abstract class MicroDBWatchable<Value, CallbackArguments> implements Subscribables<Value, CallbackArguments> {
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

	$watch(callback: SubscriptionCallback<Value, CallbackArguments>, options: Partial<SubscriptionOptions<Value>> = {}) {
		return this._subscriptionManager.registerWatcher(callback, options);
	}

	$watchNext(
		callback: SubscriptionCallback<Value, CallbackArguments>,
		times: number = 1,
		options: Partial<SubscriptionOptions<Value>> = {}
	) {
		// init as not called
		let numberOfCalls = 0;
		const newPredicate = (newValue: Value, lastValue: Value) => {
			const allowed = options.predicate ? options.predicate(newValue, lastValue) : true;

			// increment number of calls
			numberOfCalls += allowed ? 1 : 0;
			if (numberOfCalls > times) {
				// destroy subscription when its called the last time
				subscription.destroy();
				return false;
			}

			return allowed;
		};

		const subscription = this._subscriptionManager.registerWatcher(callback, {
			...options,
			predicate: newPredicate,
		});

		return subscription;
	}
}
