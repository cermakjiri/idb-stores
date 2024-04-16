import * as idb from 'idb-keyval';
import type { z } from 'zod';

import type { StoreWithSchema, StringKey, UnknownStoreSchemas } from './types';
import { createCustomUseStore, getValueValidator } from './utils';

export function getMockStore<const StoreSchemas extends UnknownStoreSchemas, StoreName extends StringKey<StoreSchemas>>(
    _storeSchemas: StoreSchemas,
    storeName: StoreName,
) {
    type StoreSchema = StoreSchemas[StoreName];
    type Schema = z.infer<StoreSchema>;
    type StoreKey = keyof Schema;

    type Store = StoreWithSchema<StoreName, StoreSchema>;

    return {
        name: storeName,
        async get<Key extends StoreKey>(_key: Key) {
            return undefined as Schema[Key];
        },
        async set<Key extends StoreKey>(_key: Key, _value: Required<Schema[Key]>) {},
        async remove<Key extends StoreKey>(_key: Key) {},
        async clear() {},
    } as const satisfies Store;
}

/**
 * Creates a strongly-typed store in IndexedDB.
 * - Put a new store name with its schema in `packages/storage/settings.ts` to register it.
 * - After adding a new store, you have to delete the IndexedDB database in the browser or increase the database version.
 */
export function getStore<const StoreSchemas extends UnknownStoreSchemas, StoreName extends StringKey<StoreSchemas>>(
    connection: Promise<IDBDatabase>,
    storeSchemas: StoreSchemas,
    storeName: StoreName,
) {
    const storeSchema = storeSchemas[storeName];

    type StoreSchema = StoreSchemas[StoreName];
    type Schema = z.infer<StoreSchema>;
    type StoreKey = keyof Schema;

    type Store = StoreWithSchema<StoreName, StoreSchema>;

    // Using a custom function instead of idb.crateStore which doesn't support creating multiple stores:
    const useStore = createCustomUseStore(connection, storeName);

    const store = {
        name: storeName,

        async get<Key extends StoreKey>(key: Key) {
            const validator = getValueValidator(storeSchema, key);

            const unknownValue = await idb.get<Schema[StoreKey]>(key as IDBValidKey, useStore);

            const result = validator.parse(unknownValue);

            return result as Schema[Key];
        },

        async set<Key extends StoreKey>(key: Key, value: Required<Schema[Key]>) {
            const validator = getValueValidator(storeSchema, key);

            const unknownValue = validator.parse(value);

            await idb.set(key as IDBValidKey, unknownValue, useStore);
        },

        async remove<Key extends StoreKey>(key: Key) {
            await idb.del(key as IDBValidKey, useStore);
        },

        async clear() {
            await idb.clear(useStore);
        },
    } as const satisfies Store;

    return store;
}
