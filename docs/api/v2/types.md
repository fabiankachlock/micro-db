---
description: Utility-Types for micro-db
---

# Types

## `MicroDBOptions`

| property       | type                                                   |
| -------------- | ------------------------------------------------------ |
| fileName       | `string`                                               |
| defaultData    | ``[`MicroDBData`](types.md#microdbdata) `\| undefined` |
| serializer     | `MicroDBSerializer`                                    |
| janitorCronjob | `string \| undefined`                                  |
| lazy           | boolean                                                |

## `MicroDBData`

Type: `Record<string, any>`

## `WherePredicate<T>`

Type: `(object:` [`MicroDBEntry<T>`](types.md#microdbentry-less-than-t-greater-than)`) => boolean`

{% hint style="warning" %}
Where-Predicates must be synchronous
{% endhint %}

## `Mutation<A, B>`

Type: `(object: A, id: string) => B | void | Promise<B | void>`

{% hint style="info" %}
`Mutations can by async.`
{% endhint %}

## `MicroDBEntry<T>`

Constraints: `T extends {}`

Type: `T & { _microdbId: string }`

## `SubscriptionCallback<Value, ExtraArguments>`

Type: `(value: Value, extraArguments: ExtraArguments, subscription: Subscription) => void`

## `SubscriptionOptions<T>`

| property      | type                                                  |
| ------------- | ----------------------------------------------------- |
| predicate     | `(newValue: T, lastValue: T \| undefined) => boolean` |
| callImmediate | `boolean`                                             |
