# MicroDBFacade

Generic type `<T>`: Type of the record that is going to be stored.

### Methods:

The `MicroDBFacade` has all methods of the `MicroDBDriver` as protected methods. For a usage example see Patterns or Examples.

Further, the `MicroDBFacade` provides more protected properties for convenience.

### `protected db`

The underlying MicroDBDriver instances.

Type: `readonly MicroDBDriver<T>`

### `protected data`

The current data stored in the db.

Type: `readonly MicroDBData<T>`
