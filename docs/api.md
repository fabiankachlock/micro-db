# micro-db API

_Version: 1.0.7_

# Contents

- [Classes](#microdb)
  - [`MicroDB`](#microdb)
  - [`MicroDBBase`](#microdbbase)
  - [`MicroDBDriver`](#microdbdriver)
  - [`MicroDBFacade`](#microdbfacade)
  - [`MicroDBJanitor`](#microdbjanitor)
  - [`Subscription`](#subscription)
- [Interfaces](#microdbwatchable)
  - [`MicroDBWatchable`](#microdbwatchable)
  - [`MicroDBPropertyWatchable`](#microdbpropertywatchable)
- [Constants](#default-options)
- [Types](#types)

## MicroDB

The MicroDB class only serves the purpose of providing syntax sugar for the [`MicroDbDriver`](#microdbdriver).

### `MicroDB.constructor()`

| argument | type                                             |
| -------- | ------------------------------------------------ |
| options  | `Partial<`[`MicroDBOptions`](#microdboptions)`>` |

### `static MicroDB.table<T>()`

| argument | type                                             |
| -------- | ------------------------------------------------ |
| options  | `Partial<`[`MicroDBOptions`](#microdboptions)`>` |

Returns: instance of the [`MicroDBDriver`](#microdbdriver).

### `static MicroDB.database()`

| argument | type                                             |
| -------- | ------------------------------------------------ |
| options  | `Partial<`[`MicroDBOptions`](#microdboptions)`>` |

Returns: instance of the [`MicroDBBase`](#microdbbase).

### `static MicroDB.janitor()`

| argument | type                              |
| -------- | --------------------------------- |
| cron     | `string`                          |
| ...dbs   | [`MicroDBBase`](#microdbbase)`[]` |

Returns: instance of the [`MicroDBBase`](#microdbbase).

---

## MicroDBBase

The MicroDBBase class is the heart of the micro-db package. It manages reading and writing to files.

### `MicroDBBase.constructor()`

| argument | type                                             |
| -------- | ------------------------------------------------ |
| options  | `Partial<`[`MicroDBOptions`](#microdboptions)`>` |

### `MicroDBBase.fileName`

Type: `readonly string`

### `MicroDBBase.dataSerializer`

Returns a reference to the active serializer.

Type: `readonly `[`MicroDBSerializer`](#microdbserializer)

### `MicroDBBase.janitor`

Returns a reference to the active janitor instance (if a janitorCronjob got defined in the options).

Type: `readonly `[`MicroDBJanitor`](#microdbjanitor)` | undefined`

### `MicroDBBase.read()`

Get the current dataset of the database.

Returns: [`MicroDBData`](#microdbdata)

### `MicroDBBase.write()`

Write a single record into the db file.

| argument | type     |
| -------- | -------- |
| id       | `string` |
| data     | `any`    |

### `MicroDBBase.writeBatch()`

Write multiple records into the file at once.

| argument | type                          |
| -------- | ----------------------------- |
| data     | [`MicroDBData`](#microdbdata) |

### `MicroDBBase.close()`

Ends the writeStream and kills the janitor (if existing).

---

## MicroDBDriver

### `static MicroDBDriver.forDatabase()`

Generic type `<T>`: type of the record that is going to be stored.

Create a MicroDBDriver instance for a (running) [`MicroDBBase`](#microdbbase) instance.

| argument | type                          |
| -------- | ----------------------------- |
| data     | [`MicroDBData`](#microdbdata) |

Returns: [`MicroDBDriver`](#microdbdriver)

### `MicroDBDriver.constructor()`

| argument | type                                             |
| -------- | ------------------------------------------------ |
| options  | `Partial<`[`MicroDBOptions`](#microdboptions)`>` |

### `MicroDBDriver.dbRef`

Returns a reference to the underlying [`MicroDBBase`](#microdbbase).

Type: `readonly `[`MicroDBBase`](#microdbbase)

### `MicroDBDriver.janitor`

Returns a reference to the active janitor instance (if a janitorCronjob got defined in the options).

Type: `readonly `[`MicroDBJanitor`](#microdbjanitor)` | undefined`

### `MicroDBDriver.close()`

Closes the underlining [`MicroDBBase`](#microdbbase) instance.

### `MicroDBDriver.create()`

Create a new database record.

| argument | type |
| -------- | ---- |
| object   | `T`  |

Returns: `string` (internal id of the new record)

### `MicroDBDriver.select()`

Select a record by internal id (returned by [`create`](#microdbdrivercreate) method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

Returns: [`MicroDBEntry<T>`](microdbentryt)` | undefined`

### `MicroDBDriver.selectWhere()`

Select the first record satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |

Returns: [`MicroDBEntry<T>`](microdbentryt)` | undefined`

### `MicroDBDriver.selectAllWhere()`

Select all records satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |

Returns: [`MicroDBEntry<T>`](microdbentryt)`[]`

### `MicroDBDriver.selectAll()`

Select all records.

Returns: [`MicroDBEntry<T>`](microdbentryt)`[]`

### `MicroDBDriver.update()`

Update a record by internal id (returned by [`create`](#microdbdrivercreate) method).

| argument | type         |
| -------- | ------------ |
| id       | `string`     |
| object   | `Partial<T>` |

Returns: `boolean` (if record could be updated)

### `MicroDBDriver.updateWhere()`

Update the first record satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |
| object   | `Partial<T>`                            |

Returns: `boolean` (if record could be updated)

### `MicroDBDriver.updateAllWhere()`

Update all records satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |
| object   | `Partial<T>`                            |

Returns: `number` (count of updated records)

### `MicroDBDriver.mutate()`

Mutate a record by internal id (returned by [`create`](#microdbdrivercreate)] method).

| argument | type                          |
| -------- | ----------------------------- |
| id       | `string`                      |
| mutation | [`Mutation<T>`](#mutationa-b) |

Returns: `boolean` (if record could be mutated)

### `MicroDBDriver.mutateWhere()`

Mutates the first record satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |
| mutation | [`Mutation<T>`](#mutationa-b)           |

Returns: `boolean` (if record could be mutated)

### `MicroDBDriver.mutateAllWhere()`

Mutate all records satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |
| mutation | [`Mutation<T>`](#mutationa-b)           |

Returns: `number` (count of mutated records)

### `MicroDBDriver.mutateAll()`

Mutate all records.

| argument | type                          |
| -------- | ----------------------------- |
| mutation | [`Mutation<T>`](#mutationa-b) |

### `MicroDBDriver.delete()`

Delete a record by internal id (returned by [`create`](#microdbdrivercreate)] method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

### `MicroDBDriver.deleteWhere()`

Delete the first record satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |

Returns: `boolean` (if record could be deleted)

### `MicroDBDriver.deleteAllWhere()`

Delete all records satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |

Returns: `number` (count of deleted records)

### `MicroDBDriver.flush()`

Delete all data from the database.

---

## MicroDBFacade

Generic type `<T>`: type of the record that is going to be stored.

The `MicroDBFacade` has all methods of the [`MicroDBDriver`](#microdbdriver) as protected methods. For a usage example see [Patterns](https://github.com/fabiankachlock/micro-db/blob/docs/REDME.md).

Further, the `MicroDBFacade` provides more protected properties for convenience.

### `protected MicroDBFacade.db`

Provides a reference to the underlying [`MicroDBDriver`](#microdbdriver).

Type: [`MicroDBDriver`](#microdbdriver)`<T>`

### `protected MicroDBFacade.data`

Provides the current database state.

Type: [`MicroDBData`](#microdbdata)`<T>`

---

## MicroDBJanitor

The MicroDBJanitor cleans up data overhead and reduces database file size.
It can be used either as global instance for batching cleanups with registerDatabase & deleteDatabase or as db-personal instance.

### `MicroDBJanitor.constructor()`

| argument | type                              | default                                   |
| -------- | --------------------------------- | ----------------------------------------- |
| cron     | `string`                          | `'00 00 00 * * '` (every day at midnight) |
| ...dbs   | [`MicroDBBase`](#microdbbase)`[]` | -                                         |

### `MicroDBJanitor.databases`

Returns all registered databases.

Type: [`MicroDBBase`](#microdbbase)`[]`

### `MicroDBJanitor.cronString`

Returns the cronjob configuration.

Type: `readonly string`

### `static async MicroDBJanitor.cleanUp()`

Cleans the database passed as an argument asynchronously.

| argument | type                          |
| -------- | ----------------------------- |
| db       | [`MicroDBBase`](#microdbbase) |

### `static MicroDBJanitor.cleanUpSync()`

Cleans the database passed as an argument synchronously.

| argument | type                          |
| -------- | ----------------------------- |
| db       | [`MicroDBBase`](#microdbbase) |

### `MicroDBJanitor.cleanAll()`

Cleans all registered databases.

### `MicroDBJanitor.registerDatabase()`

Register a new database to be cleaned by the janitor.

| argument | type                          |
| -------- | ----------------------------- |
| db       | [`MicroDBBase`](#microdbbase) |

### `MicroDBJanitor.deleteDatabase()`

Delete a registered database.

> **Which database is going to be deleted is determined by the filename of the database**
> This means you don't need to pass the correct reference to the database, but if you would have two databases running on the same file (why???) both would get deleted.

| argument | type                          |
| -------- | ----------------------------- |
| db       | [`MicroDBBase`](#microdbbase) |

### `MicroDBJanitor.kill()`

Stops the running cronjob of the janitor.

### `MicroDBJanitor.restart()`

Restarts a stopped janitor.

---

## Subscription

Represents a reference to a subscription made with $watch.

### `Subscription.id`

Type: `readonly string`

### `Subscription.constructor()`

| argument | type         |
| -------- | ------------ |
| id       | `string`     |
| destroy  | `() => void` |

### `Subscription.destroy()`

Cancel the subscription.

### `Subscription.onClose()`

Function, that gets executed, when the subscription gets destroyed.

---

## MicroDBWatchable

Generic type `<Value>`: type of tha data, that is going to be watched
Generic type `<CallbackArguments>`: type of extra arguments provided to the callback

Provides an interface for subscribing and watching for data changes in a class.

Implemented by: [`MicroDBJanitor`](#microdbjanitor)

### `MicroDBWatchable.$watch()`

Watch for all upcoming value changes while the subscription is active.

| argument | type                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| callback | [`SubscriptionCallback<Value, CallbackArguments>`](#subscriptioncallbackvalue-extraarguments) |
| options  | [`Partial<SubscriptionOptions<Value>>`](#subscriptionoptionst)                                |

Returns: [`Subscription`](#subscription)

### `MicroDBWatchable.$watchNext()`

Watch for the next value change.

| argument | type                                                                                          | default    |
| -------- | --------------------------------------------------------------------------------------------- | ---------- |
| callback | [`SubscriptionCallback<Value, CallbackArguments>`](#subscriptioncallbackvalue-extraarguments) | (required) |
| times    | `number`                                                                                      | 1          |
| options  | [`Partial<SubscriptionOptions<Value>>`](#subscriptionoptionst)                                | {}         |

Returns: [`Subscription`](#subscription)

---

## MicroDBPropertyWatchable

Extends [`MicroDBWatchable`](#microdbwatchable) with methods for subscribing and watching for changes of individual properties of a object.

Generic type `<Value>`: type of tha data, that is going to be watched
Generic type `<CallbackArguments>`: type of extra arguments provided to the callback

Implemented by: [`MicroDBBase`](#microdbbase), [`MicroDBDriver`](#microdbdriver)

### `MicroDBPropertyWatchable.$watchProperty()`

Watch for all upcoming property changes while the subscription is active.

| argument | type                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| property | `P extends keyof Value`                                                                       |
| callback | [`SubscriptionCallback<Value, CallbackArguments>`](#subscriptioncallbackvalue-extraarguments) |
| options  | [`Partial<SubscriptionOptions<Value>>`](#subscriptionoptionst)                                |

Returns: [`Subscription`](#subscription)

### `MicroDBPropertyWatchable.$watchPropertyNext()`

Watch for the next property change.

| argument | type                                                                                          | default    |
| -------- | --------------------------------------------------------------------------------------------- | ---------- |
| property | `P extends keyof Value`                                                                       | (required) |
| callback | [`SubscriptionCallback<Value, CallbackArguments>`](#subscriptioncallbackvalue-extraarguments) | (required) |
| times    | `number`                                                                                      | 1          |
| options  | [`Partial<SubscriptionOptions<Value>>`](#subscriptionoptionst)                                | {}         |

Returns: [`Subscription`](#subscription)

---

## default Options

```ts
const defaultOptions: MicroDBOptions = {
	fileName: 'micro.db',
	serializer: new JSONSerializer(),
	janitorCronjob: undefined,
	defaultData: undefined,
};
```

# Types

## `MicroDBOptions`

| property       | type                                      |
| -------------- | ----------------------------------------- |
| fileName       | `string`                                  |
| defaultData    | `MicroDBData \| undefined`                |
| serializer     | [`MicroDBSerializer`](#microdbserializer) |
| janitorCronjob | `string \| undefined`                     |

## `MicroDBSerializer`

| method          | type                                                |
| --------------- | --------------------------------------------------- |
| serializeObject | `(key: string, value: any) => string`               |
| serializeAll    | `(data: `[`MicroDBData`](#microdbdata)`) => string` |
| deserialize     | `(raw: string) => MicroDBData`                      |

### Builtin

#### `JSONSerializer`

| name             | format                           |
| ---------------- | -------------------------------- |
| `JSONSerializer` | key: json-string <br>`key:{...}` |

## `MicroDBData`

Type: `Record<string, any>`

## `WherePredicate<T>`

Type: ` (object: T) => boolean`

## `Mutation<A, B>`

Type: `(object: A) => B`

## `MicroDBEntry<T>`

| property    | type     |
| ----------- | -------- |
| id          | `string` |
| value       | `T`      |
| \_microdbId | `string` |

## `SubscriptionCallback<Value, ExtraArguments>`

Type: `( value: Value, extraArguments: ExtraArguments, subscription: Subscription) => void`

## `SubscriptionOptions<T>`

| property      | type                                                   |
| ------------- | ------------------------------------------------------ |
| predicate     | ` (newValue: T, lastValue: T \| undefined) => boolean` |
| callImmediate | `boolean`                                              |
