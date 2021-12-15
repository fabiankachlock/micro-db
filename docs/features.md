# Features

### Features

#### Typescript Support

micro-db supports static typing with typescript.

To use the full power of typescript you should use micro-db as a sql database. Although, if type safety isn't a matter for you, you can use micro-db also as a nosql database (by using typescripts Union Types and Type Guards your nosql database can also be type safe).

#### Debuggable

micro-db's default json serializer stores all records in a human readable format in your database file. Since every database operation results is a new stored record, all operations an their results are traceable in the database file.

#### Expandable

If the json format used for serialization doesn't suits you needs, you can implement an own `MicroDBSerializer` yourself and pass it with your config.

This technique can be used for things as encryption or data compression.

#### Built in Janitor

micro-db has a janitor built in. The main task of the [`MicroDBJanitor`](api.md#microdbjanitor) is to clean redundant / outdated snapshots from your database file.

#### Easily Replaceable

When used right (with the [`MicroDBFacade`](api.md#microdbfacade)), you hide the actual database operations from the rest of your app. Which means, that you can easily change your database later on, without even noticing it anywhere else in the app.
