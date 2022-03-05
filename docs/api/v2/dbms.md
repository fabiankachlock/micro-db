# MicroDBMS

The MicroDBMS class is a small container for managing multiple MicroDB's with an ease. It also allows you to sync janitor cleanups easily.

{% hint style="success" %}
It is intended to use with the static methods and not as instance.
{% endhint %}

### **`static MicroDBMS.allTables`**

Returns all active tables as `MicroDBDriver`.

Type: `Record<string, MicroDBDriver<unknown>>`

### **`static MicroDBMS.globalJanitor`**

Returns a global `MicroDBJanitor` instance.

Type: `MicroDBJanitor | undefined`

### **`static MicroDBMS.setFolderPath()`**

Set the path of the folder, where all database files will get stored.

| argument   | type     |
| ---------- | -------- |
| folderPath | `string` |

Returns: `void`

### **`static MicroDBMS.setJanitorCronjob()`**

Set the cronjob of the global janitor.

| argument | type     |
| -------- | -------- |
| cron     | `string` |

Returns: `void`

### **`static MicroDBMS.table<T>()`**

Create a new table in the DBMS's folder path.

| argument     | type                      |
| ------------ | ------------------------- |
| name         | `string`                  |
| extraOptions | `Partial<MicroDBOptions>` |

Returns: `Promise<MicroDBDriver<T>>`

### **`static MicroDBMS.deleteTable()`**

Delete a active table.

| argument | type     |
| -------- | -------- |
| name     | `string` |

Returns: `Promise<void>`

***
