import { MicroDBPropertyWatchable } from '../../watcher/propertyWatchable';
import { createAwaiter } from '../helper.test';

export class MockWatchable extends MicroDBPropertyWatchable<{ id1: number; id2: number }, {}> {
	private state = { id1: 0, id2: 0 };
	_currentValue = () => this.state;
	_getCallbackArguments = () => ({});
	trigger = (key: 'id1' | 'id2' | undefined) => {
		if (key) {
			this.state[key] += 1;
		}
		this.valueChanged();
	};
}

describe('micro-db/MicroDBPropertyWatchable tests', () => {
	let watchable: MockWatchable;

	beforeEach(() => {
		watchable = new MockWatchable();
	});

	it('should trigger only when subscribed value changed', () => {
		const cb = jest.fn(() => {});

		watchable.$watchProperty('id1', cb);

		expect(cb).toBeCalledTimes(0);

		watchable.trigger('id1');
		expect(cb).toBeCalledTimes(1); // should be triggered (value change)

		watchable.trigger('id2');
		expect(cb).toBeCalledTimes(1); // should not be changed (value didn't change)
	});

	it('should only count property changes', () => {
		const cb = jest.fn(() => {});

		watchable.trigger('id2'); // setup a value

		watchable.$watchPropertyNext('id1', cb);

		expect(cb).toBeCalledTimes(0);

		watchable.trigger('id2');
		expect(cb).toBeCalledTimes(0);

		watchable.trigger('id1');
		expect(cb).toBeCalledTimes(1); // should be triggered (value change)

		watchable.trigger('id1');
		expect(cb).toBeCalledTimes(1); // sub should be destroyed already
	});

	// see README.md -> Gotchas -> $watchPropertyNext()
	it('should prove gotcha in action', async () => {
		const cb = jest.fn(() => {});

		//! setup NO initial value
		// watchable.trigger('id2');

		const gotchaWatchable = new MockWatchable();

		// subscription created in same event loop iteration
		gotchaWatchable.$watchPropertyNext('id1', cb);

		expect(cb).toBeCalledTimes(0); // no initial call

		gotchaWatchable.trigger('id2');
		expect(cb).toBeCalledTimes(1); //! should trigger even tough it is watching 'id1'

		gotchaWatchable.trigger('id1');
		expect(cb).toBeCalledTimes(1); // should not trigger again, because it got called once already

		//! Workaround
		const cb1 = jest.fn(() => {});
		const newIterationWatchable = new MockWatchable();
		const { awaiter, done } = createAwaiter();

		setImmediate(() => {
			newIterationWatchable.$watchPropertyNext('id1', cb1);
			expect(cb1).toBeCalledTimes(0); // no initial call

			newIterationWatchable.trigger('id2');
			expect(cb1).toBeCalledTimes(0); // should be trigger, because it's in the next event loop iteration

			newIterationWatchable.trigger('id1');
			expect(cb1).toBeCalledTimes(1); // should work as intended
			done();
		});

		await awaiter;
	});

	it('should work with extra predicate', async () => {
		const cb = jest.fn(() => {});
		let callCount = 0;
		const pred = () => callCount++ > 2;

		const watchable = new MockWatchable();
		const { awaiter, done } = createAwaiter();

		setImmediate(() => {
			watchable.$watchProperty('id1', cb, {
				predicate: pred,
			});

			watchable.trigger('id1'); // custom pred refuses
			watchable.trigger('id1'); // custom pred refuses
			watchable.trigger('id1'); // custom pred refuses
			watchable.trigger('id1');

			expect(cb).toBeCalledTimes(1);
			done();
		});

		await awaiter;
	});

	it('should work with times and extra predicate', async () => {
		const cb = jest.fn(() => {});
		let callCount = 0;
		const pred = () => callCount++ > 2;

		const watchable = new MockWatchable();
		const { awaiter, done } = createAwaiter();

		setImmediate(() => {
			watchable.$watchPropertyNext('id1', cb, 2, {
				predicate: pred,
			});

			watchable.trigger('id1'); // custom pred refuses
			watchable.trigger('id1'); // custom pred refuses
			watchable.trigger('id1'); // custom pred refuses
			watchable.trigger('id1');
			watchable.trigger('id1');
			watchable.trigger('id1'); // 2 updates exceed

			expect(cb).toBeCalledTimes(2);
			done();
		});

		await awaiter;
	});

	it('should not throw error when last value is undefined', () => {
		const cb = jest.fn(() => {});
		const watchable = new MockWatchable();

		watchable.$watchPropertyNext('id1', cb, 1, {
			predicate: () => true,
		});

		expect(cb).toBeCalledTimes(0); // no initial call

		watchable.trigger('id2');
		expect(cb).toBeCalledTimes(1); //! should trigger even tough it is watching 'id1'

		watchable.trigger('id1');
		expect(cb).toBeCalledTimes(1); // should not trigger again, because it got called once already
	});
});
