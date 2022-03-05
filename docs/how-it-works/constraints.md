# Constraints

## Multiple [`MicroDBBase`](https://micro-db.fabiankachlock.dev/v2/base)

For performance reasons changes in the database are directly applied to the internal data object. This means micro-db's will only work with one active [`MicroDBBase`](https://micro-db.fabiankachlock.dev/v2/base) or [`MicroDBDriver`](https://micro-db.fabiankachlock.dev/v2/driver) at the time per database file. Changes to the database file will not be recognized after initialization.

## RAM usage

micro-db uses a fs.WriteStream under the hood for appending to the database file.This means for appending data the not the whole database file needs to be in RAM. BUT, since the database file gets evaluated at construction, the whole data contained in the database file will stored in RAM (inside a javascript object).
