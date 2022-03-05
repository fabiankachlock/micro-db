# MicroDB

The MicroDB class only serves the purpose of providing syntax sugar for the [`MicroDbDriver`](driver.md).

### `MicroDB<T>.constructor():` [`MicroDBDriver<T>`](driver.md)``

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

### `static MicroDB.table<T>()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

Returns: instance of the `MicroDBDriver`.

### `static MicroDB.database()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

Returns: instance of the `MicroDBBase`.

### `static MicroDB.janitor()`

| argument | type            |
| -------- | --------------- |
| cron     | `string`        |
| ...dbs   | `MicroDBBase[]` |

Returns: instance of the `MicroDBBase`.
