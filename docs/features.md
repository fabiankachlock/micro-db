# Features

## Typescript Support ✨

micro-db supports static typing with typescript.

To use the full power of typescript you should use micro-db as a sql database. Although, if type safety isn't a matter for you, you can use micro-db also as a nosql database (by using typescripts Union Types and Type Guards your nosql database can also be type safe).

## Instant Persistent ⌛️

All your data ist instantly persistent - with every single operation. Unlike most similar json-/file-based lightweight database implementations your data will be persisted to the disk on every operation you perform.

## Performant ⚡️

micro-db delivers instant persistency and that while still being insanely performant. That's because in difference to most similar databases, micro-db won't serialize your whole data again. Instead, only the records you changed will be serialized.

## Lightweight ☁️

micro-db and it's minimal api just consists of a few source files. Besides that micro-db won't clutter up your node_modules with it's only 2 dependencies.

## Debuggable 🔎

micro-db's default json serializer stores all records in a human readable format in your database file. Since every database operation results is a new stored record, all operations an their results are traceable in the database file.

## Expandable 🛠

If the json format used for serialization doesn't suits you needs, you can implement an own `MicroDBSerializer` yourself and pass it with your config.

This technique can be used for advanced things as encryption or data compression.

## Built in Janitor 🗑

micro-db has a janitor built in. The main task of the [`MicroDBJanitor`](https://micro-db.fabiankachlock.dev/v2/janitor) is to clean redundant / outdated snapshots from your database file.

## Easily Replaceable 🔌

When used right (with the [`MicroDBFacade`](https://micro-db.fabiankachlock.dev/v2/facade)), you hide the actual database operations from the rest of your app. Which means, that you can easily change your database later on, without even noticing it anywhere else in the app.

## Zero Config ⚙️

Just, as it says, you can run micro-db without having to configure a single thing.
