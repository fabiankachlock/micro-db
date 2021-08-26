import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscription } from './subscription';
import { v4 as uuid } from 'uuid';

type Watcher<ValueType, CallbackArguments> = {
	callback: SubscriptionCallback<ValueType, CallbackArguments>; // watcher callback
	predicate: (value: ValueType) => boolean; // call callback only when true
	subscription: Subscription; // reference to subscription Instance
};

const defaultSubscriptionOptions: SubscriptionOptions<unknown> = {
	predicate: () => true,
	callImmidiate: false,
};

export interface Subscribeable<Value, ExtraArguments> {
	subscriptionManager: SubscriptionManager<Value, ExtraArguments>;
	currentValue(): Value;
	getCallbackArguments(): ExtraArguments;
	onValueChange(handler: (value: Value) => void): void;
}

export class SubscriptionManager<Value, ExtraArguments extends {}> {
	// all active watchers
	private watchers: Record<string, Watcher<Value, ExtraArguments>> = {};

	constructor(private host: Subscribeable<Value, ExtraArguments>) {
		host.onValueChange(this.onValueChange);
	}

	private onValueChange = (value: Value) => {
		for (const watcherId of Object.keys(this.watchers)) {
			this.callWatcher(watcherId, value);
		}
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
			this.callWatcher(id, this.host.currentValue());
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
	private callWatcher = (id: string, value: Value) => {
		if (id in this.watchers && this.watchers[id].predicate(value)) {
			this.watchers[id].callback(value, this.host.getCallbackArguments(), this.watchers[id].subscription);
		}
	};
}
