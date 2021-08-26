import { MicroDBSubscriptionCallback, MicroDBSubscriptionInitializer } from './interface';
import { MicroDBSubscription } from './subscription';
import { v4 as uuid } from 'uuid';

type Watcher<ValueType, CallbackArguments> = {
	callback: MicroDBSubscriptionCallback<ValueType, CallbackArguments>; // watcher callback
	predicate: (value: ValueType) => boolean; // call callback only when true
	subscription: MicroDBSubscription; // reference to subscription Instance
};

const defaultMicroDBSubscriptionInitializer: MicroDBSubscriptionInitializer<unknown> = {
	predicate: () => true,
	callImmidiate: false,
};

export interface MicroDBSubscribeable<ValueType, CallbackArguments> {
	subscriptionManager: MicroDBSubscriptionManager<ValueType, CallbackArguments>;
	getSubscriptionValue(): ValueType;
	getCallbackArguments(): CallbackArguments;
	onSubscriptionValueChange(handler: (value: ValueType) => void): void;
}

export class MicroDBSubscriptionManager<ValueType, CallbackArguments extends {}> {
	// all active watchers
	private watchers: Record<string, Watcher<ValueType, CallbackArguments>> = {};

	constructor(private host: MicroDBSubscribeable<ValueType, CallbackArguments>) {
		host.onSubscriptionValueChange(this.onValueChange);
	}

	private onValueChange = (value: ValueType) => {
		for (const watcherId of Object.keys(this.watchers)) {
			this.callWatcher(watcherId, value);
		}
	};

	registerWatcher = (
		callback: MicroDBSubscriptionCallback<ValueType, CallbackArguments>,
		options: Partial<MicroDBSubscriptionInitializer<ValueType>> = {}
	): MicroDBSubscription => {
		const id = uuid();
		const subscription = new MicroDBSubscription(id, () => this.deleteWatcher(id));

		const resolvedOptions = {
			...options,
			...defaultMicroDBSubscriptionInitializer,
		};

		// store new watcher with options
		this.watchers[id] = {
			callback,
			predicate: resolvedOptions.predicate,
			subscription,
		};

		// call, if specified in options
		if (resolvedOptions.callImmidiate) {
			this.callWatcher(id, this.host.getSubscriptionValue());
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
	private callWatcher = (id: string, value: ValueType) => {
		if (id in this.watchers && this.watchers[id].predicate(value)) {
			this.watchers[id].callback(value, this.host.getCallbackArguments(), this.watchers[id].subscription);
		}
	};
}
