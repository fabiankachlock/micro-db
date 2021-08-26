import { MicroDBSubscriptionCallback, MicroDBSubscriptionInitializer } from './interface';
import { MicroDBSubscribeable, MicroDBSubscriptionManager } from './subscriptionManager';

export abstract class MicroDBWatchable<ValueType, CallbackArguments>
	implements MicroDBSubscribeable<ValueType, CallbackArguments>
{
	subscriptionManager: MicroDBSubscriptionManager<ValueType, CallbackArguments>;

	constructor() {
		this.subscriptionManager = new MicroDBSubscriptionManager(this);
	}

	abstract getSubscriptionValue(): ValueType;
	abstract getCallbackArguments(): CallbackArguments;

	protected handlers: ((value: ValueType) => void)[] = [];

	onSubscriptionValueChange = (handler: (value: ValueType) => void) => {
		this.handlers.push(handler);
	};

	protected valueChanged = (value: ValueType) => {
		for (const handler of this.handlers) {
			handler(value);
		}
	};

	watch = (
		callback: MicroDBSubscriptionCallback<ValueType, CallbackArguments>,
		options: Partial<MicroDBSubscriptionInitializer<ValueType>> = {}
	) => {
		return this.subscriptionManager.registerWatcher(callback, options);
	};

	watchNext = (
		callback: MicroDBSubscriptionCallback<ValueType, CallbackArguments>,
		options: Partial<MicroDBSubscriptionInitializer<ValueType>> = {}
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
