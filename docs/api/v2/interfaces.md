---
description: micro-db interfaces
---

# Interfaces

## `MicroDBSerializer`

| method          | type                                  |
| --------------- | ------------------------------------- |
| serializeObject | `(key: string, value: any) => string` |
| serializeAll    | `(data: MicroDBData) => string`       |
| deserialize     | `(raw: string) => MicroDBData`        |

### **Builtin**

#### **`JSONSerializer`**

| name             | format                                            |
| ---------------- | ------------------------------------------------- |
| `JSONSerializer` | <p>key: json-string<br><code>key:{...}</code></p> |

## MicroDBWatchable

Provides an interface for subscribing and watching for data changes in a class.

Generic Types:

* &#x20;`<Value>`: type of the data, that is going to be watched Generic type&#x20;
* `<CallbackArguments>`: type of extra arguments provided to the callback

Implemented by: `MicroDBJanitor`

### **`$watch()`**

Watch for all upcoming value changes while the subscription is active.

| argument | type                                             |
| -------- | ------------------------------------------------ |
| callback | `SubscriptionCallback<Value, CallbackArguments>` |
| options  | `Partial<SubscriptionOptions<Value>>`            |

Returns: `Subscription`

### **`$watchNext()`**

Watch for the next value change.

| argument | type                                             | default    |
| -------- | ------------------------------------------------ | ---------- |
| callback | `SubscriptionCallback<Value, CallbackArguments>` | (required) |
| times    | `number`                                         | 1          |
| options  | `Partial<SubscriptionOptions<Value>>`            | {}         |

Returns: `Subscription`

***

## MicroDBPropertyWatchable

Extends `MicroDBWatchable` with methods for subscribing and watching for changes of individual properties of an object.

Generic Types:

* &#x20;`<Value>`: type of the data, that is going to be watched Generic type&#x20;
* `<CallbackArguments>`: type of extra arguments provided to the callback

Implemented by: `MicroDBBase`, `MicroDBDriver`

### **`$watchProperty()`**

Watch for all upcoming property changes while the subscription is active.

| argument | type                                             |
| -------- | ------------------------------------------------ |
| property | `P extends keyof Value`                          |
| callback | `SubscriptionCallback<Value, CallbackArguments>` |
| options  | `Partial<SubscriptionOptions<Value>>`            |

Returns: `Subscription`

### **`$watchPropertyNext()`**

Watch for the next property change.

| argument | type                                             | default    |
| -------- | ------------------------------------------------ | ---------- |
| property | `P extends keyof Value`                          | (required) |
| callback | `SubscriptionCallback<Value, CallbackArguments>` | (required) |
| times    | `number`                                         | 1          |
| options  | `Partial<SubscriptionOptions<Value>>`            | {}         |

Returns: `Subscription`
