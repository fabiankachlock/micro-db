# MicroDBDriver

Generic Type `<T>`:  Type of the data stored in the db

### **`static MicroDBDriver.forDatabase()`**

Generic type `<T>`: Type of the data stored in the db

Create a MicroDBDriver instance for a (running) `MicroDBBase` instance.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `Promise<MicroDBDriver<T>>`

### **`MicroDBDriver.constructor()`**

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

### **`MicroDBDriver.dbRef`**

Returns a reference to the underlying `MicroDBBase`.

Type: `readonly MicroDBBase`

### **`MicroDBDriver.janitor`**

Returns a reference to the active janitor instance (if a janitorCronjob got defined in the options).

Type: `readonly MicroDBJanitor | undefined`

### **`MicroDBDriver.`**`isInitialized()`

Returns the initialization state of the underlying `MicroDBBase`.

Type: `readonly boolean`

### **`MicroDBDriver.initialize()`**

Initialize the underlining `MicroDBBase` instance.

Returns: `Promise<void>`

### **`MicroDBDriver.close()`**

Closes the underlining `MicroDBBase` instance.

Returns: `Promise<void>`

### **`MicroDBDriver.create()`**

Create a new database record.

| argument | type |
| -------- | ---- |
| object   | `T`  |

Returns: `Promise<string>` (internal id of the new record)

### **`MicroDBDriver.select()`**

Select a record by internal id (returned by `create` method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

Returns: `Promise<MicroDBEntry<T> | undefined>`

### **`MicroDBDriver.selectWhere()`**

Select the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

{% hint style="warning" %}
Remember: Where-Predicates must be synchronous
{% endhint %}

Returns: `Promise<MicroDBEntry<T> | undefined>`

### **`MicroDBDriver.selectAllWhere()`**

Select all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `Promise<MicroDBEntry<T>[]>`

### **`MicroDBDriver.selectAll()`**

Select all records.

Returns: `MicroDBEntry<T>[]`

### **`MicroDBDriver.update()`**

Update a record by internal id (returned by `create` method).

| argument | type         |
| -------- | ------------ |
| id       | `string`     |
| object   | `Partial<T>` |

Returns: `Promise<boolean>` (if record could be updated)

### **`MicroDBDriver.updateWhere()`**

Update the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| object   | `Partial<T>`        |

Returns: `Promise<boolean>` (if record could be updated)

### **`MicroDBDriver.updateAllWhere()`**

Update all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| object   | `Partial<T>`        |

Returns: `Promise<number>` (count of updated records)

### **`MicroDBDriver.mutate()`**

Mutate a record by internal id (returned by `create`] method).

| argument | type          |
| -------- | ------------- |
| id       | `string`      |
| mutation | `Mutation<T>` |

{% hint style="info" %}
Mutations can be async!
{% endhint %}

Returns: `Promise<boolean>` (if record could be mutated)

### **`MicroDBDriver.mutateWhere()`**

Mutates the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| mutation | `Mutation<T>`       |

Returns: `Promise<boolean>` (if record could be mutated)

### **`MicroDBDriver.mutateAllWhere()`**

Mutate all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| mutation | `Mutation<T>`       |

Returns: `Promise<number>` (count of mutated records)

### **`MicroDBDriver.mutateAll()`**

Mutate all records.

| argument | type          |
| -------- | ------------- |
| mutation | `Mutation<T>` |

Returns: `Promise<number>` (count of mutated records)

### **`MicroDBDriver.delete()`**

Delete a record by internal id (returned by `create`] method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

Returns: `Promise<boolean>` (if a record could be deleted)

### **`MicroDBDriver.deleteWhere()`**

Delete the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `Promise<oolean>` (if a record could be deleted)

### **`MicroDBDriver.deleteAllWhere()`**

Delete all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `Promise<number>` (count of deleted records)

### **`MicroDBDriver.flush()`**

Delete all data from the database.

***
