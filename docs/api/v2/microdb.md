# MicroDB

The MicroDB class only serves the purpose of providing syntax sugar for the [`MicroDbDriver`](driver.md).

### `constructor():` [`MicroDBDriver<T>`](driver.md)``

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

### `static table<T>()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

Returns: instance of the `MicroDBDriver`.

### `static database()`

| argument | type                      |
| -------- | ------------------------- |
| options  | `Partial<MicroDBOptions>` |

Returns: instance of the `MicroDBBase`.

### `static janitor()`

| argument | type            |
| -------- | --------------- |
| cron     | `string`        |
| ...dbs   | `MicroDBBase[]` |

Returns: instance of the `MicroDBBase`.
