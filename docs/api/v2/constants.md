---
description: micro-db constants
---

# Constants

## MicroDBDefaultOptions

Type: [MicroDBOptions](types.md#microdboptions)

```typescript
const defaultOptions: MicroDBOptions = {
  fileName: 'micro.db',
  serializer: new JSONSerializer(),
  janitorCronjob: undefined,
  defaultData: undefined,
};
```
