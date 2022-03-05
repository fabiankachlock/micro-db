---
description: The api of the MicroDBBase class.
---

# MicroDBBase

The MicroDBBase class is the heart of the micro-db package. It manages reading and writing to files.

### **`MicroDBBase.constructor()`**

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

### `MicroDBBase.isInitialized`

Returns true when the db is initialized.&#x20;

Type: `readonly boolean`

### **`MicroDBBase.fileName`**

Returns the filename of the db-file.

Type: `readonly string`

### **`MicroDBBase.dataSerializer`**

Returns a reference to the active serializer.

Type: `readonly MicroDBSerializer`

### **`MicroDBBase.janitor`**

Returns a reference to the active janitor instance (if a janitorCronjob got defined in the options).

Type: `readonly MicroDBJanitor | undefined`

### `MicroDBBase.initialize()`

Initialize the Database (read in existing data, setup the writeStream, etc.)

{% hint style="info" %}
The initialization happens automatically before read/write operations when the instance isn't initialized.
{% endhint %}

Returns: `Promise<void>`

### **`MicroDBBase.read()`**

Get the current dataset of the database.

Returns: `Promise<MicroDBData>()`

### **`MicroDBBase.write()`**

Write a single record into the db file.

| argument | type     |
| -------- | -------- |
| id       | `string` |
| data     | `any`    |

Returns: `Promise<void>`

### **`MicroDBBase.writeBatch()`**

Write multiple records into the file at once.

| argument | type          |
| -------- | ------------- |
| data     | `MicroDBData` |

Returns: `Promise<void>`

### `MicroDBBase.deallocate()`

Free up memory space by ending the writeStream and removing all stored data from RAM. The Janitor will keep running.

Returns: `Promise<void>`

### **`MicroDBBase.close()`**

Ends the writeStream and kills the janitor (if existing).

Returns: `Promise<void>`
