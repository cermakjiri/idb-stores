import * as idb from 'idb-keyval';
import type { z } from 'zod';

import type { Logger } from './logger';
import type { StringKey, UnknownStoreSchema } from './types';
import { createCustomUseStore, getValueValidator } from './utils';

interface GetStoreProps<StoreName extends string, StoreSchema extends UnknownStoreSchema> {
    connection: Promise<IDBDatabase>;
    storeSchema: StoreSchema;
    storeName: StoreName;
    logger: Logger;
}

/**
 * Creates a strongly-typed store in IndexedDB.
 * - Put a new store name with its schema in `packages/storage/settings.ts` to register it.
 * - After adding a new store, you have to delete the IndexedDB database in the browser or increase the database version.
 */
export function getStore<const StoreName extends string, const StoreSchema extends UnknownStoreSchema>({
    connection,
    storeName,
    storeSchema,
    logger,
}: GetStoreProps<StoreName, StoreSchema>) {
    type Schema = z.infer<StoreSchema>;
    type StoreKey = StringKey<Schema>;

    // Using a custom function instead of idb.crateStore which doesn't support creating multiple stores:
    const useStore = createCustomUseStore(connection, storeName);

    const store = {
        name: storeName,

        async get<Key extends StoreKey>(key: Key) {
            const validator = getValueValidator(storeSchema, key);

            const unknownValue = await idb.get<Schema[StoreKey]>(key as IDBValidKey, useStore);

            logger.debug('get', { store: storeName, key, value: unknownValue });

            const result = validator.parse(unknownValue);

            return result as Schema[Key];
        },

        async set<Key extends StoreKey>(key: Key, value: Schema[Key]) {
            const validator = getValueValidator(storeSchema, key);

            logger.debug('set', { store: storeName, key, value });

            const unknownValue = validator.parse(value);

            await idb.set(key, unknownValue, useStore);
        },

        async setMany(values: Partial<Record<StoreKey, Schema[StoreKey]>>) {
            const entries = Object.entries(values);

            logger.debug('setMany', { store: storeName, values });

            // TODO: validate all values before setting any of them

            await idb.setMany(entries, useStore);
        },

        async remove<Key extends StoreKey>(key: Key) {
            logger.debug('remove', { store: storeName, key });
            await idb.del(key, useStore);
        },

        async clear() {
            logger.debug('clear', { store: storeName });
            await idb.clear(useStore);
        },
    } as const;

    return store;
}

export function getMockStore<const StoreName extends string, const StoreSchema extends UnknownStoreSchema>(
    _storeSchema: StoreSchema,
    storeName: StoreName,
) {
    type Store = ReturnType<typeof getStore<StoreName, StoreSchema>>;
    type Schema = z.infer<StoreSchema>;
    type StoreKey = StringKey<Schema>;

    return {
        name: storeName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async get<Key extends StoreKey>(key: Key) {
            return undefined as Schema[Key];
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async set<Key extends StoreKey>(key: Key, value: Required<Schema[Key]>) {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async remove<Key extends StoreKey>(key: Key) {},
        async clear() {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async setMany(values: Partial<Record<StoreKey, Required<Schema[StoreKey]>>>) {},
    } as const satisfies Store;
}
