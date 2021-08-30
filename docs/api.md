# micro-db API

# Contents

- [Classes](#microdb)
  - [`MicroDB`](#microdb)
  - [`MicroDBBase`](#microdbbase)
  - [`MicroDBDriver`](#microdbdriver)
  - [`MicroDBFacade`](#microdbfacade)
  - [`MicroDBJanitor`](#microdbjanitor)
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

Type: `readonly `[`MicroDBSerializer`](#microdbserializer)

### `MicroDBBase.janitor`

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

### `MicroDBDriver._dbRef`

Type: `readonly `[`MicroDBBase`](#microdbbase)

### `MicroDBDriver.janitor`

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

Returns: [`MicroDBEntry<T>`]('microdbentryt)` | undefined`

### `MicroDBDriver.selectWhere()`

Select the first record satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |

Returns: [`MicroDBEntry<T>`]('microdbentryt)` | undefined`

### `MicroDBDriver.selectAllWhere()`

Select all records satisfying the predicate.

| argument | type                                    |
| -------- | --------------------------------------- |
| pred     | [`WherePredicate<T>`](#wherepredicatet) |

Returns: [`MicroDBEntry<T>`]('microdbentryt)`[]`

### `MicroDBDriver.selectAll()`

Select all records.

Returns: [`MicroDBEntry<T>`]('microdbentryt)`[]`

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

### `MicroDBDriver.flush()`

Delete all data from the database.

## MicroDBFacade

## MicroDBJanitor

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

| property | type     |
| -------- | -------- |
| id       | `string` |
| value    | `T`      |
