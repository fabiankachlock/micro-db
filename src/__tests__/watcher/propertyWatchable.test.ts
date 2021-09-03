import { MicroDBPropertyWatchable } from '../../watcher/propertyWatchable';

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
	it('should prove gotcha in action', () => {
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

		setImmediate(() => {
			newIterationWatchable.$watchPropertyNext('id1', cb1);
			expect(cb1).toBeCalledTimes(0); // no initial call

			newIterationWatchable.trigger('id2');
			expect(cb1).toBeCalledTimes(0); // should be trigger, because it's in the next event loop iteration

			newIterationWatchable.trigger('id1');
			expect(cb1).toBeCalledTimes(1); // should work as intended
		});
	});
});
