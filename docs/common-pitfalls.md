# Common Pitfalls

## `undefined` vs `null` values

In micro-db world a data value of `undefined` deletes the record. If you want to store optional records anyhow, you can use `null` for that.

## `$watchPropertyNext()`

Making watching a property working correct, requires the currentValue and a `lastValue` (value before the change) to be passed into the predicate. Because of how Javascript works, while the SubscriptionManager gets constructed the derived class (the one you want to watch) isn't fully constructed yet, so the `lastValue` gets initialized as `undefined`. To take care of that, the `lastValue` gets its value within an `setImmediate()`.

This results in the fact, that all `$watchProperty()` and `$watchPropertyNext()` subscriptions made within the iteration of the event loop while the constructor of the derived class (the one you are want to watch) is run, will be triggered whenever the first value change in the class appears.

See example [in tests](https://github.com/fabiankachlock/micro-db/blob/main/src/\_\_tests\_\_/watcher/propertyWatchable.test.ts#L62-L73)

## How to deal with space constraints

The [`MicroDBJanitor`](https://micro-db.fabiankachlock.dev/v2/janitor) is responsible for cleaning up the database file for redundant records. The [`MicroDBJanitor`](https://micro-db.fabiankachlock.dev/v2/janitor) is configured with a cronjob, which determines when and how often the janitor has to run. The more traffic or changes your database has, the more often the janitor should run to prevent huge overhead in file size.
