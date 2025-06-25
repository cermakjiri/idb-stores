import { enableAll, setLevel } from 'loglevel';

import { IDBStoresError } from './errors/index.ts';
import { getMockStore, getStore } from './getStore.ts';
import { createDefaultLogger, defaultLogLevel, type Logger, type LogLevel } from './logger/index.ts';
import type { StringKey, UnknownStoreSchemas } from './types/index.ts';
import { createConnection, isSupported } from './utils/index.ts';

function assertDatabaseVersion(databaseVersion: number) {
    if (databaseVersion < 1 || !Number.isInteger(databaseVersion)) {
        throw new IDBStoresError('invalid-db-version', 'Database version must be an integer greater than 0');
    }
}

export function defaultNoIDBSupportHandler<const StoreSchemas extends UnknownStoreSchemas>(storeSchemas: StoreSchemas) {
    return function getDatabaseMockedStore<StoreName extends StringKey<StoreSchemas>>(storeName: StoreName) {
        return getMockStore<StoreName, StoreSchemas[StoreName]>(storeSchemas[storeName], storeName);
    };
}
export interface InitIDBProps<StoreSchemas extends UnknownStoreSchemas> {
    database: {
        /**
         * IndexedDB database name
         */
        name: string;
        /**
         * Accepts integers only.
         */
        version: number;
    };

    /**
     * Zod schemas for each IndexedDB store.
     */
    storeSchemas: StoreSchemas;

    /**
     * Called when IndexedDB is not supported (e.g. SSR).
     * By default, it returns function that returns mocked store so the return type is preserved.
     */
    noIDBSupportHandler?: <const StoreSchemas extends UnknownStoreSchemas>(
        stores: StoreSchemas,
    ) => ReturnType<typeof defaultNoIDBSupportHandler<StoreSchemas>>;

    logger?: Logger;

    logLevel?: LogLevel | 'silent';
}

// TODO: migrations
export function initIDB<const StoreSchemas extends UnknownStoreSchemas>({
    database: { name: databaseName, version: databaseVersion },
    storeSchemas,
    noIDBSupportHandler,
    logger = createDefaultLogger(defaultLogLevel),
    logLevel = defaultLogLevel,
}: InitIDBProps<StoreSchemas>) {
    enableAll();
    setLevel(logLevel);

    assertDatabaseVersion(databaseVersion);

    if (!isSupported()) {
        if (noIDBSupportHandler) {
            return noIDBSupportHandler<StoreSchemas>(storeSchemas);
        }

        return defaultNoIDBSupportHandler<StoreSchemas>(storeSchemas);
    }

    const storeNames: ReadonlyArray<StringKey<StoreSchemas>> = Object.keys(storeSchemas);

    // Create one database connection for all stores:
    const connection = createConnection({
        logger,
        databaseName,
        databaseVersion,
        storeNames,
    });

    function getDatabaseStore<const StoreName extends StringKey<StoreSchemas>>(storeName: StoreName) {
        const storeSchema = storeSchemas[storeName];
        type StoreSchema = StoreSchemas[StoreName];

        return getStore<StoreName, StoreSchema>({
            connection,
            storeSchema,
            storeName,
            logger,
        });
    }

    return getDatabaseStore;
}
