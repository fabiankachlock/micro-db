import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscribeable, SubscriptionManager } from './subscriptionManager';

export abstract class MicroDBWatchable<ValueType, CallbackArguments>
	implements Subscribeable<ValueType, CallbackArguments>
{
	subscriptionManager: SubscriptionManager<ValueType, CallbackArguments>;

	constructor() {
		this.subscriptionManager = new SubscriptionManager(this);
	}

	abstract currentValue(): ValueType;
	abstract getCallbackArguments(): CallbackArguments;

	protected handlers: ((value: ValueType) => void)[] = [];

	onValueChange = (handler: (value: ValueType) => void) => {
		this.handlers.push(handler);
	};

	protected valueChanged = (value: ValueType) => {
		for (const handler of this.handlers) {
			handler(value);
		}
	};

	watch = (
		callback: SubscriptionCallback<ValueType, CallbackArguments>,
		options: Partial<SubscriptionOptions<ValueType>> = {}
	) => {
		return this.subscriptionManager.registerWatcher(callback, options);
	};

	watchNext = (
		callback: SubscriptionCallback<ValueType, CallbackArguments>,
		options: Partial<SubscriptionOptions<ValueType>> = {}
	) => {
		let callCount = 0;
		return this.subscriptionManager.registerWatcher(callback, {
			...options,
			predicate: value => {
				callCount += 1;
				return callCount < 2 && options.predicate ? options.predicate(value) : true;
			},
		});
	};
}
