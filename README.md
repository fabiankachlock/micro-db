# micro-db

micro-db is a lightweight, (by default) json-based, file-based, zero config database for nodejs.

## Contents

- [Why micro-db](#why-micro-db)
- [Why micro-db is outstanding](#why-micro-db-is-outstanding)
- [Features](#features)
  - [Typescript Support](#typescript-support)
  - [Debuggable](#debuggable)
  - [Easily Replaceable](#easily-replaceable)
  - [Expandable](#expandable)
- [When to use micro-db](#when-to-use-micro-db)
- [When **NOT** to use micro-db](#when-not-to-use-micro-db)
  - [How to deal with space constraints](#how-to-deal-with-space-constraints)
- [Gotchas](#gotchas)
- [Patterns](#patterns)
  - [MicroDBFacade](#microdbfacade)
  - [id-aware records](#id-aware-records)

## Why micro-db

- ☁️ Lightweight
- ⚡️ Perfomant
- ⌛️ Instant Persistent
- 🔎 Debuggable
- ✨ Typescript Support
- 🔌 Easily Replaceable
- ⚙️ Zero Config
- 🛠 Expandable

## Why micro-db is outstanding

The difference between micro-db and most json-based databases is, that most json-based databases serialze the whole data object before it can be stored into a file. micro-db appends data snapshots in key-value pairs directly into the file, which has the huge advantage of instant-persistency whithout big workload, because only the stored object has to be serialized.

micro-db stores data records with an internal database id as the key. This means there is no need for implementing such things as primary keys, because micro-db does the job. If you need to use the generated id in your code, you can make your records [id-aware](#id-aware-records)

Due to the fact, that micro-db only has to serialize the changed object micro-db can handle large collections of data records. The collection size only affects database startup and janitor clean cycle times. The only impact on database opertion perfomance is the size of the data record itself. The bigger the record, the solwer the database operations will be.

## Features

### Typescript Support

micro-db supports static typing with typescript.

To use the full power of typescript you should use micro-db as a sql database. Allthpugh, if typesafty isn't a matter for you, you can use micro-db also as a nosql database (by using typescripts Union Types and Type Guards your nosql database can also be typesafe).

### Debuggable

micro-db's default json serializer stores all records in a [human readable format](#xxx) in your database file. Since every database operation results is a new stored record, all operations an their results are traceable in the database file.

### Expandable

If the json format used for serialization doesn't suits you needs, you can implement an own [MicroDBSerializer](#xxx) yourself and pass it with your config.

This technique can be used for things as encryption or data compression.

### Easily Replaceable

When used right (with the [MicroDBFacade](#xxx)), you hide the actual databse operations from the rest of your app. Which means, that you can easily change your database, without even noticing it anywhere else in the app.

## When to use micro-db

micro-db loves an environment, where performance and instant-persistence matters, but space don't.

## When **NOT** to use micro-db

When space is a heavy constraint for your nodejs app, you should consider using another database.

### How to deal with space constraints

The MicroDBJanitor is responsible for cleaning up the database file for redundent records. The MicroDBJAnitor is configured by a cronjob, which determineds when and gow often the janitor has to run. The more traffic or changes your db has, the more often the janitor should run, to prevent huge overhead in file size.

## Gotchas

In micro-db world a data value of `undefined` deletes the record. If you want store optional values anyhow, you can use `null` for that.

## Patterns

(#pattern-micro-db-facade)

### MicroDBFacade

coming soon...

(#pattern-id-aware-records)

### id-aware records

coming soon...

# API

## Contents

- [Classes](#microdb)
  - [MicroDB](#microdb)
  - [MicroDBBase](#microdbbase)
  - [MicroDBDriver](#microdbdriver)
  - [MicroDBFacade](#microdbfacade)
- [Constants](#default-options)
- [Types](#types)

coming soon...

### MicroDB

### MicroDBBase

### MicroDBDriver

### MicroDBFacade

### default Options

```ts
const defaultOptions: MicroDBOptions = {
	fileName: 'micro.db',
	serializer: new JSONSerializer(),
	janitorCronjob: undefined,
	defaultData: undefined,
};
```

## Types
