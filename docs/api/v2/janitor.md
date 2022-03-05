# MicroDBJanitor

The MicroDBJanitor cleans up data overhead and reduces database file size. It can be used either as global instance for batching cleanups with registerDatabase & deleteDatabase or as db-personal instance.

### **`MicroDBJanitor.constructor()`**

| argument | type            | default                                    |
| -------- | --------------- | ------------------------------------------ |
| cron     | `string`        | `'00 00 00 * * *'` (every day at midnight) |
| ...dbs   | `MicroDBBase[]` | -                                          |

### **`MicroDBJanitor.databases`**

Returns all registered databases.

Type: `MicroDBBase[]`

### **`MicroDBJanitor.cronString`**

Returns the cronjob configuration.

Type: `readonly string`

### **`static MicroDBJanitor.cleanUp()`**

Cleans the database passed as an argument asynchronously.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `Promise<void>`

### **`MicroDBJanitor.cleanAll()`**

Cleans all registered databases.

Returns: `void`

### **`MicroDBJanitor.registerDatabase()`**

Register a new database to be cleaned by the janitor.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `void`

### **`MicroDBJanitor.deleteDatabase()`**

Delete a registered database.

> **Which database is going to be deleted is determined by the filename of the database** This means you don't need to pass the correct reference to the database, but if you would have two databases running on the same file (why???) both would get deleted.

| argument | type          |
| -------- | ------------- |
| db       | `MicroDBBase` |

Returns: `void`

### **`MicroDBJanitor.kill()`**

Stops the running cronjob of the janitor.

Returns: `void`

### **`MicroDBJanitor.restart()`**

Restarts a stopped janitor.

Returns: `void`

***
