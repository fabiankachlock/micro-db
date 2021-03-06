# micro-db

> **INFO:** v2 of micro-db is late stage of development and on the track to be released soon

micro-db is a lightweight, (by default) json-based, file-based, zero config database for nodejs.

![Maintainability](https://api.codeclimate.com/v1/badges/d529c6f4ff7dfb2dc28b/maintainability)
![Coverage](https://api.codeclimate.com/v1/badges/d529c6f4ff7dfb2dc28b/test_coverage)

## Installation

```bash
npm i node-micro-db
```

```bash
yarn add node-micro-db
```

## 🪄 Quickstart

```ts
type User = {
	name: string;
	age: number;
};

const db = new MicroDB<User>();

const idOfJohn = db.create({ name: 'john', age: 23 });

// john's birthday
db.update(idOfJohn, { age: 24 });

// select with id
const john = db.select(idOfJohn);
// john.name = 'john'
// john.age = 24

// select without id
const john1 = db.selectWhere(user => user.name === 'john');
// john1.name = 'john'
// john1.age = 24
```

For more information about available methods, check out the [API](#api)

## Contents

- [micro-db](#micro-db)
	- [Installation](#installation)
	- [🪄 Quickstart](#-quickstart)
	- [Contents](#contents)
	- [Why micro-db](#why-micro-db)
		- [Why micro-db is outstanding](#why-micro-db-is-outstanding)
	- [Features](#features)
		- [Typescript Support](#typescript-support)
		- [Debuggable](#debuggable)
		- [Expandable](#expandable)
		- [Built in Janitor](#built-in-janitor)
		- [Easily Replaceable](#easily-replaceable)
	- [When to use micro-db](#when-to-use-micro-db)
	- [When **NOT** to use micro-db](#when-not-to-use-micro-db)
		- [How to deal with space constraints](#how-to-deal-with-space-constraints)
	- [Gotchas](#gotchas)
		- [`undefined` vs `null` values](#undefined-vs-null-values)
		- [`$watchPropertyNext()`](#watchpropertynext)
		- [RAM usage](#ram-usage)
		- [Multiple `MicroDBBase.read`](#multiple-microdbbaseread)
	- [Patterns](#patterns)
		- [Facade Pattern](#facade-pattern)
			- [Example](#example)
			- [Example (using instance methods rather than static ones)](#example-using-instance-methods-rather-than-static-ones)
		- [id-aware Records](#id-aware-records)
			- [Example](#example-1)

## Why micro-db

- ☁️ Lightweight
- ⚡️ Preformat
- ⌛️ Instant Persistent
- 🔎 Debuggable
- ✨ Typescript Support
- ⚙️ Zero Config
- 🛠 Expandable
- 🔌 Easily Replaceable

### Why micro-db is outstanding

The difference between micro-db and most json-based databases is, that most json-based databases serialize the whole data object before it can be stored into a file. micro-db appends data snapshots in key-value pairs directly into the file. This has the huge advantage of instant-persistency without a big workload, because only the stored object has to be serialized.

micro-db stores data records with an internal database id as the key. This means there is no need for worrying about such things as primary keys, because micro-db does the job. If you need to use the generated id in your code, you can make your records [id-aware](#id-aware-records)

Due to the fact, that micro-db only has to serialize the changed object micro-db can handle large collections of data records. The collection size only affects database startup and janitor clean cycle times. The only impact on database operation performance is the size of the data record itself. The bigger the record, the slower the database operations will be.

## Features

### Typescript Support

micro-db supports static typing with typescript.

To use the full power of typescript you should use micro-db as a sql database. Although, if type safety isn't a matter for you, you can use micro-db also as a nosql database (by using typescripts Union Types and Type Guards your nosql database can also be type safe).

### Debuggable

micro-db's default json serializer stores all records in a [human readable format](#https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#jsonserializer) in your database file. Since every database operation results is a new stored record, all operations an their results are traceable in the database file.

### Expandable

If the json format used for serialization doesn't suits you needs, you can implement an own [`MicroDBSerializer`](#https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbserializer) yourself and pass it with your config.

This technique can be used for things as encryption or data compression.

### Built in Janitor

micro-db has a janitor built in. The main task of the [`MicroDBJanitor`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbjanitor) is to clean redundant / outdated snapshots from your database file.

### Easily Replaceable

When used right (with the [`MicroDBFacade`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbfacade)), you hide the actual database operations from the rest of your app. Which means, that you can easily change your database later on, without even noticing it anywhere else in the app.

## When to use micro-db

micro-db loves an environment, where performance and instant-persistence matters, but space don't.

## When **NOT** to use micro-db

When space (database file size) is a heavy constraint for your nodejs app, you should consider using another database.

### How to deal with space constraints

The [`MicroDBJanitor`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbjanitor) is responsible for cleaning up the database file for redundant records. The [`MicroDBJanitor`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbjanitor) is configured with a cronjob, which determines when and how often the janitor has to run. The more traffic or changes your database has, the more often the janitor should run to prevent huge overhead in file size.

## Gotchas

### `undefined` vs `null` values

In micro-db world a data value of `undefined` deletes the record. If you want to store optional records anyhow, you can use `null` for that.

### `$watchPropertyNext()`

Making watching a property working correct, requires the currentValue and a `lastValue` (value before the change) to be passed into the predicate. Because of how Javascript works, while the SubscriptionManager gets constructed the derived class (the one you want to watch) isn't fully constructed yet, so the `lastValue` gets initialized as `undefined`. To take care of that, the `lastValue` gets its value within an `setImmediate()`.

This results in the fact, that all `$watchProperty()` and `$watchPropertyNext()` subscriptions made within the iteration of the event loop while the constructor of the derived class (the one you are want to watch) is run, will be triggered whenever the first value change in the class appears.

See example [in tests](https://github.com/fabiankachlock/micro-db/blob/main/src/__tests__/watcher/propertyWatchable.test.ts#L62-L73)

### RAM usage

micro-db uses a fs.WriteStream under the hood for appending to the database file.This means for appending data the not the whole database file needs to be in RAM. BUT, since the database file gets evaluated at construction, the whole data contained in the database file will stored in RAM (inside a javascript object).

### Multiple `MicroDBBase.read`

For performance reasons changes in the database are directly applied to the internal data object. This means micro-db's will only work with one active [`MicroDBBase`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbbase) or [`MicroDBDriver`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbdriver) at the time. Changes to the database file will not be recognized after initialization.

## Patterns

### Facade Pattern

micro-db encourages you, to hide bare-bones database operations, like `select` or `update` statements from the rest of you application using the [Facade pattern](https://en.wikipedia.org/wiki/Facade_pattern)

To implement this in your code, you can extend the [`MicroDBFacade`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbfacade) class. The [`MicroDBFacade`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbfacade) provides the same api as a [`MicroDBDriver`](https://github.com/fabiankachlock/micro-db/blob/docs/docs/api.md#microdbdriver), but all methods are protected, which means they are inaccessible from outside of the class.

The example below shows how straight forward this approach is:

#### Example

```ts
export class UserDB extends MicroDBFacade<UserDBEntry> {
	// 1. create the db instance
	private static db = new UserDB({ fileName: 'db/users.db' });

	// 2. expose shutdown function
	static shutdown = UserDB.db.shutdown;

	// 3. define complex database operations
	static logout = (userId: string) => {
		const userRecord = UserDB.db.select(userId);

		// ...

		UserDB.db.update(userId, {
			//...
		});
	};
}

// 4. usage
UserDB.logout('some-user-id');
```

#### Example (using instance methods rather than static ones)

```ts
export class UserDB extends MicroDBFacade<UserDBEntry> {
	constructor() {
		// 1. construct db instance
		super({ fileName: 'db/users.db' });
	}
	// 2. expose shutdown function
	shutdown = () => this.db.close();

	// 3. define complex database operations
	logout = (userId: string) => {
		const userRecord = this.db.select(userId);

		// ...

		this..db.update(userId, {
			//...
		});
	};
}

// 4. usage
const db = new UserDB();
db.logout('some-user-id');
```

### id-aware Records

Sometimes, you need your database records to be aware of their id. This is mainly the case, when otherwise heavy select statements are needed to query some commonly used data. Implementing this with micro-db is very easy (and works best with the [Facade Pattern](#facade-pattern)).

#### Example

```ts
export class UserDB extends MicroDBFacade<UserDBEntry> {
	// same as above
	private static db = new UserDB({ name: 'users', fileName: 'db/users.db' });
	static shutdown = UserDB.db.shutdown;

	static createUser = (name: string, age: number) => {
		// 1. user object with empty id
		const data: UserDBEntry = {
			id: '',
			name,
			age,
		};

		// 2. create database records and receive id
		const id = UserDB.db.create(data);

		// 3. update created record with received id
		UserDB.db.update(id, { id });
	};
}
```
