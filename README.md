# idb-stores

Strongly typed IndexedDB stores with [Zod](https://zod.dev). Store can present arbitrary an object schema.

## Features

- Type-safe IndexedDB.
- Runtime validations against Zod schemas.
- Create multiple IndexedDB databases, each with multiple stores.
- Mocked store for non-browser env (SSR).

## Getting started

```sh
yarn add idb-stores
```

```ts
import { z } from "zod";
import { initIDB } from "idb-stores";

(async () => {
  // Initialize IndexedDB database
  const getStore = initIDB({
    database: {
      name: "my-database",
      version: 1,
    },

    storeSchemas: {
      auth: z.object({
        username: z.string().optional(),

        meta: z
          .array(
            z.shape({
              foo: z.boolean(),
            })
          )
          .optional(),
      }),
    },
  });

  const store = getStore("auth"); // ✅
  // const store = getStore('non-existing-store-name') // ❌

  await store.set("username", "alois"); // ✅
  // await store.set('username', 1234) // ❌

  const username = await store.get("username"); // `username` is type of `string | undefined`

  // ----

  await store.set("meta", [{ foo: true }, { foo: false }]);
  const meta = await store.get("meta"); // [{ foo: true }, { foo: false }]
})();
```

<!-- ## Motivation

IndexedDB offers various of complex APIs but most of web apps just need good, async alternative to old, synchronyous, string-value-only `localStorage`. Also, why should we assert the retrieved values manually when we have cool tool for declaring schemas such as `zod`? So that's why this SDK has been built - tool that's easy to use strongly typed, object-like and uses async & secure storage.

- _Why to prefer async. over sync. storage?_
  When you use, for example, `localStorage.setItem('username', 'Alice')`, it blocks the main thread until it finishes which might cause unresponsive UI. This is visually noticable only if you would store large amount of data or did high amount of those operations.

- -->
