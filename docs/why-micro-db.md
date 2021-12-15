# Why micro-db?

## Why micro-db is outstanding

The difference between micro-db and most json-based databases is, that most json-based databases serialize the whole data object before it can be stored into a file. micro-db appends data snapshots in key-value pairs directly into the file. This has the huge advantage of instant-persistency without a big workload, because only the stored object has to be serialized.

micro-db stores data records with an internal database id as the key. This means there is no need for worrying about such things as primary keys, because micro-db does the job. If you need to use the generated id in your code, you can make your records id-aware

Due to the fact, that micro-db only has to serialize the changed object micro-db can handle large collections of data records. The collection size only affects database startup and janitor clean cycle times. The only impact on database operation performance is the size of the data record itself. The bigger the record, the slower the database operations will be.


### When to use micro-db

micro-db loves an environment, where performance and instant-persistence matters, but space don't.

### When **NOT** to use micro-db

When space (database file size) is a heavy constraint for your nodejs app and you are willing to use micro-db in a high traffic production environment, you should consider using another database.
