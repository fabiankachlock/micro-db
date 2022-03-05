---
description: micro-db API
---

# api

_Version: 1.0.8_

> The micro-db api is synchronous by design.

## Contents

* Classes
  * `MicroDB`
  * `MicroDBBase`
  * `MicroDBDriver`
  * `MicroDBFacade`
  * `MicroDBJanitor`
  * `MicroDBMS`
  * `Subscription`
* Interfaces
  * `MicroDBWatchable`
  * `MicroDBPropertyWatchable`
* Constants
* Types

### MicroDB

The MicroDB class only serves the purpose of providing syntax sugar for the `MicroDbDriver`.

#### `MicroDB.constructor()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

#### `static MicroDB.table<T>()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

Returns: instance of the `MicroDBDriver`.

#### `static MicroDB.database()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

Returns: instance of the `MicroDBBase`.

#### `static MicroDB.janitor()`

| argument | type            |
| -------- | --------------- |
| cron     | `string`        |
| ...dbs   | `MicroDBBase[]` |

Returns: instance of the `MicroDBBase`.

***

### MicroDBBase

The MicroDBBase class is the heart of the micro-db package. It manages reading and writing to files.

#### `MicroDBBase.constructor()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

#### `MicroDBBase.fileName`

Type: `readonly string`

#### `MicroDBBase.dataSerializer`

Returns a reference to the active serializer.

Type: `readonly MicroDBSerializer`

#### `MicroDBBase.janitor`

Returns a reference to the active janitor instance (if a janitorCronjob got defined in the options).

Type: `readonly MicroDBJanitor | undefined`

#### `MicroDBBase.read()`

Get the current dataset of the database.

Returns: `MicroDBData`

#### `MicroDBBase.write()`

Write a single record into the db file.

| argument | type     |
| -------- | -------- |
| id       | `string` |
| data     | `any`    |

#### `MicroDBBase.writeBatch()`

Write multiple records into the file at once.

| argument | type          |
| -------- | ------------- |
| data     | `MicroDBData` |

#### `MicroDBBase.close()`

Ends the writeStream and kills the janitor (if existing).

***

### MicroDBDriver

#### `static MicroDBDriver.forDatabase()`

Generic type `<T>`: type of the record that is going to be stored.

Create a MicroDBDriver instance for a (running) `MicroDBBase` instance.

| argument | type          |
| -------- | ------------- |
| data     | `MicroDBData` |

Returns: `MicroDBDriver`

#### `MicroDBDriver.constructor()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

#### `MicroDBDriver.dbRef`

Returns a reference to the underlying `MicroDBBase`.

Type: `readonly MicroDBBase`

#### `MicroDBDriver.janitor`

Returns a reference to the active janitor instance (if a janitorCronjob got defined in the options).

Type: `readonly MicroDBJanitor | undefined`

#### `MicroDBDriver.close()`

Closes the underlining `MicroDBBase` instance.

#### `MicroDBDriver.create()`

Create a new database record.

| argument | type |
| -------- | ---- |
| object   | `T`  |

Returns: `string` (internal id of the new record)

#### `MicroDBDriver.select()`

Select a record by internal id (returned by `create` method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

Returns: `MicroDBEntry<T> | undefined`

#### `MicroDBDriver.selectWhere()`

Select the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `MicroDBEntry<T> | undefined`

#### `MicroDBDriver.selectAllWhere()`

Select all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `MicroDBEntry<T>[]`

#### `MicroDBDriver.selectAll()`

Select all records.

Returns: `MicroDBEntry<T>[]`

#### `MicroDBDriver.update()`

Update a record by internal id (returned by `create` method).

| argument | type         |
| -------- | ------------ |
| id       | `string`     |
| object   | `Partial<T>` |

Returns: `boolean` (if record could be updated)

#### `MicroDBDriver.updateWhere()`

Update the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| object   | `Partial<T>`        |

Returns: `boolean` (if record could be updated)

#### `MicroDBDriver.updateAllWhere()`

Update all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| object   | `Partial<T>`        |

Returns: `number` (count of updated records)

#### `MicroDBDriver.mutate()`

Mutate a record by internal id (returned by `create`] method).

| argument | type          |
| -------- | ------------- |
| id       | `string`      |
| mutation | `Mutation<T>` |

Returns: `boolean` (if record could be mutated)

#### `MicroDBDriver.mutateWhere()`

Mutates the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| mutation | `Mutation<T>`       |

Returns: `boolean` (if record could be mutated)

#### `MicroDBDriver.mutateAllWhere()`

Mutate all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| mutation | `Mutation<T>`       |

Returns: `number` (count of mutated records)

#### `MicroDBDriver.mutateAll()`

Mutate all records.

| argument | type          |
| -------- | ------------- |
| mutation | `Mutation<T>` |

#### `MicroDBDriver.delete()`

Delete a record by internal id (returned by `create`] method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

#### `MicroDBDriver.deleteWhere()`

Delete the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `boolean` (if record could be deleted)

#### `MicroDBDriver.deleteAllWhere()`

Delete all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `number` (count of deleted records)

#### `MicroDBDriver.flush()`

Delete all data from the database.

***

### MicroDBFacade

Generic type `<T>`: type of the record that is going to be stored.

The `MicroDBFacade` has all methods of the `MicroDBDriver` as protected methods. For a usage example see [Patterns](../../../REDME.md).

Further, the `MicroDBFacade` provides more protected properties for convenience.

#### `protected MicroDBFacade.db`

Provides a reference to the underlying `MicroDBDriver`.

Type: `MicroDBDriver<T>`

#### `protected MicroDBFacade.data`

Provides the current database state.

Type: `MicroDBData<T>`

***

### MicroDBJanitor

The MicroDBJanitor cleans up data overhead and reduces database file size. It can be used either as global instance for batching cleanups with registerDatabase & deleteDatabase or as db-personal instance.

#### `MicroDBJanitor.constructor()`

| argument | type            | default                                   |
| -------- | --------------- | ----------------------------------------- |
| cron     | `string`        | `'00 00 00 * * '` (every day at midnight) |
| ...dbs   | `MicroDBBase[]` | -                                         |

#### `MicroDBJanitor.databases`

Returns all registered databases.

Type: `MicroDBBase[]`

#### `MicroDBJanitor.cronString`

Returns the cronjob configuration.

Type: `readonly string`

#### `static async MicroDBJanitor.cleanUp()`

Cleans the database passed as an argument asynchronously.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

#### `static MicroDBJanitor.cleanUpSync()`

Cleans the database passed as an argument synchronously.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

#### `MicroDBJanitor.cleanAll()`

Cleans all registered databases.

#### `MicroDBJanitor.registerDatabase()`

Register a new database to be cleaned by the janitor.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

#### `MicroDBJanitor.deleteDatabase()`

Delete a registered database.

> **Which database is going to be deleted is determined by the filename of the database** This means you don't need to pass the correct reference to the database, but if you would have two databases running on the same file (why???) both would get deleted.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

#### `MicroDBJanitor.kill()`

Stops the running cronjob of the janitor.

#### `MicroDBJanitor.restart()`

Restarts a stopped janitor.

***

### MicroDBMS

The MicroDBMS class is a small container for managing multiple MicroDB's with an ease. It also allows you to sync janitor cleanups easily.

> It is intended to use with the static methods and not as instance.

#### `static MicroDBMS.allTables`

Returns all active tables as `MicroDBDriver`.

Type: `Record<string, MicroDBDriver<unknown>>`

#### `static MicroDBMS.globalJanitor`

Returns a global `MicroDBJanitor` instance.

Type: `MicroDBJanitor | undefined`

#### `static MicroDBMS.setFolderPath()`

Set the path of the folder, where all database files will get stored.

| argument   | type     |
| ---------- | -------- |
| folderPath | `string` |

#### `static MicroDBMS.setJanitorCronjob()`

Set the cronjob of the global janitor.

| argument | type     |
| -------- | -------- |
| cron     | `string` |

#### `static MicroDBMS.table<T>()`

Create a new table in the DBMS's folder path.

| argument     | type                      |
| ------------ | ------------------------- |
| name         | `string`                  |
| extraOptions | `Partial<MicroDBOptions>` |

Returns: `MicroDBDriver<T>`

#### `static MicroDBMS.deleteTable()`

Delete a active table.

| argument | type     |
| -------- | -------- |
| name     | `string` |

***

### Subscription

Represents a reference to a subscription made with $watch.

#### `Subscription.id`

Type: `readonly string`

#### `Subscription.constructor()`

| argument | type         |
| -------- | ------------ |
| id       | `string`     |
| destroy  | `() => void` |

#### `Subscription.destroy()`

Cancel the subscription.

#### `Subscription.onClose()`

Function, that gets executed, when the subscription gets destroyed.

***

### MicroDBWatchable

Generic type `<Value>`: type of tha data, that is going to be watched Generic type `<CallbackArguments>`: type of extra arguments provided to the callback

Provides an interface for subscribing and watching for data changes in a class.

Implemented by: `MicroDBJanitor`

#### `MicroDBWatchable.$watch()`

Watch for all upcoming value changes while the subscription is active.

| argument | type                                             |
| -------- | ------------------------------------------------ |
| callback | `SubscriptionCallback<Value, CallbackArguments>` |
| options  | `Partial<SubscriptionOptions<Value>>`            |

Returns: `Subscription`

#### `MicroDBWatchable.$watchNext()`

Watch for the next value change.

| argument | type                                             | default    |
| -------- | ------------------------------------------------ | ---------- |
| callback | `SubscriptionCallback<Value, CallbackArguments>` | (required) |
| times    | `number`                                         | 1          |
| options  | `Partial<SubscriptionOptions<Value>>`            | {}         |

Returns: `Subscription`

***

### MicroDBPropertyWatchable

Extends `MicroDBWatchable` with methods for subscribing and watching for changes of individual properties of a object.

Generic type `<Value>`: type of tha data, that is going to be watched Generic type `<CallbackArguments>`: type of extra arguments provided to the callback

Implemented by: `MicroDBBase`, `MicroDBDriver`

#### `MicroDBPropertyWatchable.$watchProperty()`

Watch for all upcoming property changes while the subscription is active.

| argument | type                                             |
| -------- | ------------------------------------------------ |
| property | `P extends keyof Value`                          |
| callback | `SubscriptionCallback<Value, CallbackArguments>` |
| options  | `Partial<SubscriptionOptions<Value>>`            |

Returns: `Subscription`

#### `MicroDBPropertyWatchable.$watchPropertyNext()`

Watch for the next property change.

| argument | type                                             | default    |
| -------- | ------------------------------------------------ | ---------- |
| property | `P extends keyof Value`                          | (required) |
| callback | `SubscriptionCallback<Value, CallbackArguments>` | (required) |
| times    | `number`                                         | 1          |
| options  | `Partial<SubscriptionOptions<Value>>`            | {}         |

Returns: `Subscription`

***

### default Options

```ts
const defaultOptions: MicroDBOptions = {
	fileName: 'micro.db',
	serializer: new JSONSerializer(),
	janitorCronjob: undefined,
	defaultData: undefined,
};
```

## Types

### `MicroDBOptions`

| property       | type                       |
| -------------- | -------------------------- |
| fileName       | `string`                   |
| defaultData    | `MicroDBData \| undefined` |
| serializer     | `MicroDBSerializer`        |
| janitorCronjob | `string \| undefined`      |

### `MicroDBSerializer`

| method          | type                                  |
| --------------- | ------------------------------------- |
| serializeObject | `(key: string, value: any) => string` |
| serializeAll    | `(data: MicroDBData) => string`       |
| deserialize     | `(raw: string) => MicroDBData`        |

#### Builtin

**`JSONSerializer`**

| name             | format                                            |
| ---------------- | ------------------------------------------------- |
| `JSONSerializer` | <p>key: json-string<br><code>key:{...}</code></p> |

### `MicroDBData`

Type: `Record<string, any>`

### `WherePredicate<T>`

Type: `(object: T) => boolean`

### `Mutation<A, B>`

Type: `(object: A) => B`

### `MicroDBEntry<T>`

| property    | type     |
| ----------- | -------- |
| id          | `string` |
| value       | `T`      |
| \_microdbId | `string` |

### `SubscriptionCallback<Value, ExtraArguments>`

Type: `( value: Value, extraArguments: ExtraArguments, subscription: Subscription) => void`

### `SubscriptionOptions<T>`

| property      | type                                                  |
| ------------- | ----------------------------------------------------- |
| predicate     | `(newValue: T, lastValue: T \| undefined) => boolean` |
| callImmediate | `boolean`                                             |
