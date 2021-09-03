import { SubscriptionManager } from '../../watcher/subscriptionManager';
import { MicroDBWatchable } from '../../watcher/watchable';

class MockWatchable extends MicroDBWatchable<{}, {}> {
	_currentValue = () => ({});
	_getCallbackArguments = () => ({});
	trigger = this.valueChanged;
}

describe('micro-db/SubscriptionManager tests', () => {
	let manager: SubscriptionManager<{}, {}>;
	let host: MockWatchable;

	beforeEach(() => {
		host = new MockWatchable();
		manager = new SubscriptionManager(host);
	});

	it('should register subscriptions', () => {
		const callback = jest.fn(() => {});

		manager.registerWatcher(callback);

		expect(callback).not.toBeCalled();
		expect(Object.keys(manager['watchers']).length).toBe(1);
	});

	it('should call callbacks', () => {
		const callback = jest.fn((val, args, sub) => {
			expect(val).toBeTruthy();
			expect(args).toBeTruthy();
			expect(sub).toBeTruthy();
		});

		manager.registerWatcher(callback);

		expect(callback).not.toBeCalled();

		host.trigger();

		expect(callback).toBeCalled();
	});

	it('should delete subscriptions', () => {
		const callback = jest.fn((val, args, sub) => {
			expect(val).toBeTruthy();
			expect(args).toBeTruthy();
			expect(sub).toBeTruthy();
		});

		const sub = manager.registerWatcher(callback);

		expect(callback).not.toBeCalled();
		expect(Object.keys(manager['watchers']).length).toBe(1);

		host.trigger();
		expect(callback).toBeCalled();

		manager.deleteWatcher(sub.id);
		expect(Object.keys(manager['watchers']).length).toBe(0);

		host.trigger();
		expect(callback).toBeCalledTimes(1);
	});

	it('should call immediate', () => {
		const callback = jest.fn(() => {});

		host.trigger(); // last value must be provided

		manager.registerWatcher(callback, { callImmediate: true });

		expect(callback).toBeCalled();
	});

	it('should cancel subscriptions', () => {
		const callback = jest.fn((val, args, sub) => {
			expect(val).toBeTruthy();
			expect(args).toBeTruthy();
			expect(sub).toBeTruthy();
		});

		const sub = manager.registerWatcher(callback);

		expect(callback).not.toBeCalled();

		sub.destroy();
		host.trigger();

		expect(callback).not.toBeCalled();
	});

	it('should handle unknown subs', () => {
		expect(() => {
			manager.deleteWatcher('some-id');
		}).not.toThrow();
	});

	it('should not call when predicate rejects', () => {
		const callback = jest.fn(() => {});

		manager.registerWatcher(callback, { predicate: () => false });

		host.trigger();

		expect(callback).not.toBeCalled();
	});
});
