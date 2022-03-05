# MicroDBJanitor

The MicroDBJanitor cleans up data overhead and reduces database file size. It can be used either as global instance for batching cleanups with registerDatabase & deleteDatabase or as db-personal instance.

### **`constructor()`**

| argument | type            | default                                    |
| -------- | --------------- | ------------------------------------------ |
| cron     | `string`        | `'00 00 00 * * *'` (every day at midnight) |
| ...dbs   | `MicroDBBase[]` | -                                          |

### **`databases`**

Returns all registered databases.

Type: `MicroDBBase[]`

### **`cronString`**

Returns the cronjob configuration.

Type: `readonly string`

### **`static cleanUp()`**

Cleans the database passed as an argument asynchronously.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `Promise<void>`

### **`cleanAll()`**

Cleans all registered databases.

Returns: `void`

### **`registerDatabase()`**

Register a new database to be cleaned by the janitor.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `void`

### **`deleteDatabase()`**

Delete a registered database.

> **Which database is going to be deleted is determined by the filename of the database.** This means you don't need to pass the correct reference to the database, but if you would have two databases running on the same file both would get deleted.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `void`

### **`kill()`**

Stops the running cronjob of the janitor.

Returns: `void`

### **`restart()`**

Restarts a stopped janitor.

Returns: `void`

***
