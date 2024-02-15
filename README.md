# idb-zod

Strongly typed IndexedDB stores with [Zod](https://zod.dev).

## Getting started

```sh
yarn add idb-zod
```

```ts
import { z } from "zod";
import { initDatabase } from "idb-zod";

(async () => {
  // Initialize IndexedDB database
  const getStore = initDatabase({
    database: {
      name: "my-database",
      version: 1,
    },

    storeSchemas: {
      auth: z.object({
        username: z.string().optional(),
      }),
    },
  });

  const store = getStore("auth"); // ✅
  // const store = getStore('non-existing-store-name') // ❌

  await store.set("username", "alois"); // ✅
  // await store.set('username', 1234) // ❌

  const username = await store.get("username"); // `username` is type of `string | undefined`
})();
```
