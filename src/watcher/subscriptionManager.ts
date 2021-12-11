import { SubscriptionCallback, SubscriptionOptions } from './interface';
import { Subscription } from './subscription';
import { v4 as uuid } from 'uuid';

type Watcher<Value, CallbackArguments> = {
	callback: SubscriptionCallback<Value, CallbackArguments>; // watcher callback
	predicate: (newValue: Value, lastValue: Value | undefined) => boolean; // call callback only when true
	subscription: Subscription; // reference to subscription Instance
};

const defaultSubscriptionOptions: SubscriptionOptions<unknown> = {
	predicate: () => true,
	callImmediate: false,
};

export interface Subscribables<Value, ExtraArguments> {
	_subscriptionManager: SubscriptionManager<Value, ExtraArguments>;
	_currentValue(): Value;
	_getCallbackArguments(): ExtraArguments;
	_onValueChange(handler: () => void): void;
}

export class SubscriptionManager<Value, ExtraArguments extends {}> {
	// all active watchers
	private watchers: Record<string, Watcher<Value, ExtraArguments>> = {};

	private lastValue: Value | undefined;

	constructor(private host: Subscribables<Value, ExtraArguments>) {
		host._onValueChange(this.onValueChange);

		setImmediate(() => {
			this.lastValue = { ...host._currentValue() };
		});
	}

	private onValueChange = () => {
		const newValue = { ...this.host._currentValue() };
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
			...defaultSubscriptionOptions,
			...options,
		};

		// store new watcher with options
		this.watchers[id] = {
			callback,
			predicate: resolvedOptions.predicate,
			subscription,
		};

		// call, if specified in options
		if (resolvedOptions.callImmediate && this.lastValue) {
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
	private callWatcher = (id: string, value: Value, lastValue: Value | undefined) => {
		if (id in this.watchers && this.watchers[id].predicate(value, lastValue)) {
			this.watchers[id].callback(value, this.host._getCallbackArguments(), this.watchers[id].subscription);
		}
	};
}
