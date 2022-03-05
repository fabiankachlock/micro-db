# MicroDBDriver

Generic Type `<T>`:  Type of the data stored in the db

### **`static forDatabase()`**

Generic type `<T>`: Type of the data stored in the db

Create a MicroDBDriver instance for a (running) `MicroDBBase` instance.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `Promise<MicroDBDriver<T>>`

### **`constructor()`**

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

### **`dbRef`**

Returns a reference to the underlying `MicroDBBase`.

Type: `readonly MicroDBBase`

### **`janitor`**

Returns a reference to the active janitor instance (if a janitorCronjob got defined in the options).

Type: `readonly MicroDBJanitor | undefined`

### `isInitialized()`

Returns the initialization state of the underlying `MicroDBBase`.

Type: `readonly boolean`

### **`initialize()`**

Initialize the underlining `MicroDBBase` instance.

Returns: `Promise<void>`

### **`close()`**

Closes the underlining `MicroDBBase` instance.

Returns: `Promise<void>`

### **`create()`**

Create a new database record.

| argument | type |
| -------- | ---- |
| object   | `T`  |

Returns: `Promise<string>` (internal id of the new record)

### **`select()`**

Select a record by internal id (returned by `create` method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

Returns: `Promise<MicroDBEntry<T> | undefined>`

### **`selectWhere()`**

Select the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

{% hint style="warning" %}
Remember: Where-Predicates must be synchronous
{% endhint %}

Returns: `Promise<MicroDBEntry<T> | undefined>`

### **`selectAllWhere()`**

Select all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `Promise<MicroDBEntry<T>[]>`

### **`selectAll()`**

Select all records.

Returns: `MicroDBEntry<T>[]`

### **`update()`**

Update a record by internal id (returned by `create` method).

| argument | type         |
| -------- | ------------ |
| id       | `string`     |
| object   | `Partial<T>` |

Returns: `Promise<boolean>` (if record could be updated)

### **`updateWhere()`**

Update the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| object   | `Partial<T>`        |

Returns: `Promise<boolean>` (if record could be updated)

### **`updateAllWhere()`**

Update all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| object   | `Partial<T>`        |

Returns: `Promise<number>` (count of updated records)

### **`mutate()`**

Mutate a record by internal id (returned by `create`] method).

| argument | type          |
| -------- | ------------- |
| id       | `string`      |
| mutation | `Mutation<T>` |

{% hint style="info" %}
Mutations can be async!
{% endhint %}

Returns: `Promise<boolean>` (if record could be mutated)

### **`mutateWhere()`**

Mutates the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| mutation | `Mutation<T>`       |

Returns: `Promise<boolean>` (if record could be mutated)

### **`mutateAllWhere()`**

Mutate all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |
| mutation | `Mutation<T>`       |

Returns: `Promise<number>` (count of mutated records)

### **`mutateAll()`**

Mutate all records.

| argument | type          |
| -------- | ------------- |
| mutation | `Mutation<T>` |

Returns: `Promise<number>` (count of mutated records)

### **`delete()`**

Delete a record by internal id (returned by `create`] method).

| argument | type     |
| -------- | -------- |
| id       | `string` |

Returns: `Promise<boolean>` (if a record could be deleted)

### **`deleteWhere()`**

Delete the first record satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `Promise<oolean>` (if a record could be deleted)

### **`deleteAllWhere()`**

Delete all records satisfying the predicate.

| argument | type                |
| -------- | ------------------- |
| pred     | `WherePredicate<T>` |

Returns: `Promise<number>` (count of deleted records)

### **`flush()`**

Delete all data from the database.

***
