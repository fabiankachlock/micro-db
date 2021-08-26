import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscription } from './subscription';
import { v4 as uuid } from 'uuid';

type Watcher<Value, CallbackArguments> = {
	callback: SubscriptionCallback<Value, CallbackArguments>; // watcher callback
	predicate: (newValue: Value, lastValue: Value) => boolean; // call callback only when true
	subscription: Subscription; // reference to subscription Instance
};

const defaultSubscriptionOptions: SubscriptionOptions<unknown> = {
	predicate: () => true,
	callImmidiate: false,
};

export interface Subscribeable<Value, ExtraArguments> {
	_subscriptionManager: SubscriptionManager<Value, ExtraArguments>;
	_currentValue(): Value;
	_getCallbackArguments(): ExtraArguments;
	_onValueChange(handler: () => void): void;
}

export class SubscriptionManager<Value, ExtraArguments extends {}> {
	// all active watchers
	private watchers: Record<string, Watcher<Value, ExtraArguments>> = {};

	private lastValue: Value;

	constructor(private host: Subscribeable<Value, ExtraArguments>) {
		host._onValueChange(this.onValueChange);
		this.lastValue = host._currentValue();
	}

	private onValueChange = () => {
		const newValue = this.host._currentValue();
		for (const watcherId of Object.keys(this.watchers)) {
			this.callWatcher(watcherId, newValue, this.lastValue);
		}
		this.lastValue = newValue;
	};

	registerWatcher = (
		callback: SubscriptionCallback<Value, ExtraArguments>,
		options: Partial<SubscriptionOptions<Value>> = {}
	): Subscription => {
		const id = uuid();
		const subscription = new Subscription(id, () => this.deleteWatcher(id));

		const resolvedOptions = {
			...options,
			...defaultSubscriptionOptions,
		};

		// store new watcher with options
		this.watchers[id] = {
			callback,
			predicate: resolvedOptions.predicate,
			subscription,
		};

		// call, if specified in options
		if (resolvedOptions.callImmidiate) {
			this.callWatcher(id, this.lastValue, this.lastValue);
		}

		return subscription;
	};

	deleteWatcher = (id: string) => {
		const record = this.watchers[id];

		if (record) {
			// delete watcher, if exists
			record.subscription.onClose();
			delete this.watchers[id];
		}
	};

	// call the callback function of a watcher if predicate yields true
	private callWatcher = (id: string, value: Value, lastValue: Value) => {
		if (id in this.watchers && this.watchers[id].predicate(value, lastValue)) {
			this.watchers[id].callback(value, this.host._getCallbackArguments(), this.watchers[id].subscription);
		}
	};
}
