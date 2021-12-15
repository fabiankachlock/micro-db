# micro-db

micro-db is a lightweight, file-based, zero config database for nodejs.

For the full documentation please see [micro-db.fabiankachlock.dev](https://micro-db.fabiankachlock.dev).

![Maintainability](https://api.codeclimate.com/v1/badges/d529c6f4ff7dfb2dc28b/maintainability) ![Coverage](https://api.codeclimate.com/v1/badges/d529c6f4ff7dfb2dc28b/test\_coverage)

## Installation

```bash
npm i node-micro-db
```

```bash
yarn add node-micro-db
```

### Why micro-db

* ☁️ Lightweight
* ⚡️ Performant
* ⌛️ Instant Persistent
* 🔎 Debuggable
* ✨ Typescript Support
* ⚙️ Zero Config
* 🛠 Expandable
* 🔌 Easily Replaceable
* [Read more ...](https://micro-db.fabiankachlock.dev/features)

## Navigation
* [Quickstart](https://micro-db.fabiankachlock.dev/#quickstart)
* [Guide](https://micro-db.fabiankachlock.dev/guide/index)
* [Example](https://micro-db.fabiankachlock.dev/example/index)
* [API](https://micro-db.fabiankachlock.dev/v2/index)
* [Legacy](https://micro-db.fabiankachlock.dev/old-versions)

## 🪄 Quickstart

```typescript
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

For more information about available methods, check out the [API](docs/api/v2/index.md)

### Patterns

#### Facade Pattern

micro-db encourages you, to hide bare-bones database operations, like `select` or `update` statements from the rest of you application using the [Facade pattern](https://en.wikipedia.org/wiki/Facade\_pattern)

To implement this in your code, you can extend the [`MicroDBFacade`](docs/api.md#microdbfacade) class. The [`MicroDBFacade`](docs/api.md#microdbfacade) provides the same api as a [`MicroDBDriver`](docs/api.md#microdbdriver), but all methods are protected, which means they are inaccessible from outside of the class.

The example below shows how straight forward this approach is:

**Example**

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

**Example (using instance methods rather than static ones)**

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

#### id-aware Records

Sometimes, you need your database records to be aware of their id. This is mainly the case, when otherwise heavy select statements are needed to query some commonly used data. Implementing this with micro-db is very easy (and works best with the Facade Pattern).

**Example**

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
