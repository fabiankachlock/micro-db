# micro-db

micro-db is a lightweigth, performant, json-based, typesafe, (prefferably) sql database for nodejs.

The difference between micro-db and most json-based databases is, that most json based dbs serialze the whole data object before it can be stored into a file. micro-db appends data snapshots in key-value pairs directly into the file, which has the advantage of instant-persistency and only the stored object has to be serialized.

micro-db stores data records with an internal database id. This means there is no need for implementing such thinks as primary keys, because micro-db does the job. If you need to use the generated id in your code, you can make your records [id-aware](#id-aware-records)

To use the full power of typescript you should use micro-db as a sql database. If typesafty isn't a matter for you, you can use micro-db also as a nosql database (using type-guards your nosql database can also be typesafe).

Due to the fact, that micro-db only has to serialize the changed object micro-db can handle large collections of data records. The collection size only affects database startup and janitor clean cycle times. The only impact on database opertion perfomance is the size of the data record itself. The bigger the record, the solwer the database operations will be.

# Why micro-db?

- lightweight
- perfomant
- instant persistent

## When to use micro-db

When performanace and instant-persistency matters, but space don't.

## When NOT to use micro-db

When space is a havy constraint for your nodejs app.

## How to deal with space constraints?

The MicroDBJanitor is responsible for cleaning up the database file for redundent records. The MicroDBJAnitor is configured by a cronjob, which determineds when and gow often the janitor has to run. The more traffic or changes your db has, the more often the janitor should run, to prevent huge overhead in file size.

# Gotchas

In MicroDB a data value of undefined deletes a value. If you want store optional values anyway, you can use null for that.

# Patterns

## MicroDBFacade

(#id-aware-records)

## id-aware records

# API

## MicroDB

```ts
MicroDB.new: (options: Partial<MicroDBOptions>): MicroDBDriver
MicroDB.table: (options: Partial<MicroDBOptions>): MicroDBDriver
MicroDB.database: (options: Partial<MicroDBOptions>): MicroDBBase
MicroDB.janitor: (options: Partial<MicroDBOptions>): MicroDBJanitor
```

### default Options

```ts
const defaultOptions: MicroDBOptions = {
	fileName: 'micro.db',
	serializer: new JSONSerializer(),
	janitorCronjob: undefined,
	defaultData: undefined,
};
```
