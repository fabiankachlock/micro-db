# Subscription

Represents a reference to a subscription made with `$watch` or similar.

### **`Subscription.id`**

Type: `readonly string`

### **`Subscription.constructor()`**

| argument | type         |
| -------- | ------------ |
| id       | `string`     |
| destroy  | `() => void` |

### **`Subscription.destroy()`**

Cancel the subscription.

Returns: `void`

### **`Subscription.onClose()`**

Function, that gets executed, when the subscription gets destroyed.

Returns: `void`
