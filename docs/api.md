# micro-db API

## Contents

- [Classes](#microdb)
  - [`MicroDB`](#microdb)
  - [`MicroDBBase`](#microdbbase)
  - [`MicroDBDriver`](#microdbdriver)
  - [`MicroDBFacade`](#microdbfacade)
  - [`MicroDBJanitor`](#microdbjanitor)
- [Constants](#default-options)
- [Types](#types)

coming soon...

### MicroDB

The MicroDB class only serves the purpose of providing syntax sugar.

### MicroDBBase

### MicroDBDriver

### MicroDBFacade

### MicroDBJanitor

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

### `MicroDBOptions`

| property       | type                                      |
| -------------- | ----------------------------------------- |
| fileName       | `string`                                  |
| defaultData    | `MicroDBData \| undefined`                |
| serializer     | [`MicroDBSerializer`](#microdbserializer) |
| janitorCronjob | `string \| undefined`                     |

### `MicroDBSerializer`

| method          | type                                                |
| --------------- | --------------------------------------------------- |
| serializeObject | `(key: string, value: any) => string`               |
| serializeAll    | `(data: `[`MicroDBData`](#microdbdata)`) => string` |
| deserialize     | `(raw: string) => MicroDBData`                      |

#### Builtin

##### `JSONSerializer`

| name             | format                           |
| ---------------- | -------------------------------- |
| `JSONSerializer` | key: json-string <br>`key:{...}` |

### `MicroDBData`

Type: `Record<string, any>`

### `WherePredicate<T>`

Type: ` (object: T) => boolean`

### `Mutation<A, B>`

Type: `(object: A) => B`

### `MicroDBEntry<T>`

| property | type     |
| -------- | -------- |
| id       | `string` |
| value    | `T`      |
