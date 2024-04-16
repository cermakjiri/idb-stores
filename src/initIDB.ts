import { type LogLevelNames, setLevel } from "loglevel";

import { IDBZodError } from "./errors";
import { getMockStore, getStore } from "./getStore";
import { type Logger, defaultLogger } from "./logger";
import type { StringKey, UnknownStoreSchemas } from "./types";
import { createConnection, isSupported } from "./utils";

function assertDatabaseVersion(databaseVersion: number) {
	if (databaseVersion < 1 || !Number.isInteger(databaseVersion)) {
		throw new IDBZodError(
			"invalid-db-version",
			"Database version must be an integer greater than 0",
		);
	}
}

export function defaultNoIDBSupportHandler<const StoreSchemas extends UnknownStoreSchemas>(
	storeSchemas: StoreSchemas,
) {
	return function getDatabaseMockedStore<StoreName extends StringKey<StoreSchemas>>(
		storeName: StoreName,
	) {
		return getMockStore<StoreSchemas, StoreName>(storeSchemas, storeName);
	};
}
export interface InitIDBProps {
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
	storeSchemas: UnknownStoreSchemas;

	/**
	 * Called when IndexedDB is not supported (e.g. SSR).
	 * By default, it returns function that returns mocked store so the return type is preserved.
	 */
	noIDBSupportHandler?: <const StoreSchemas extends UnknownStoreSchemas>(
		stores: StoreSchemas,
	) => ReturnType<typeof defaultNoIDBSupportHandler<StoreSchemas>>;

	logger?: Logger;

	logLevel?: LogLevelNames | "silent";
}
export function initIDB<const Props extends InitIDBProps>({
	database: { name: databaseName, version: databaseVersion },
	storeSchemas,
	noIDBSupportHandler,
	logger = defaultLogger,
	logLevel = "info",
}: Props) {
	setLevel(logLevel);

	assertDatabaseVersion(databaseVersion);

	type StoreSchemas = Props["storeSchemas"];

	if (!isSupported()) {
		return noIDBSupportHandler
			? noIDBSupportHandler<StoreSchemas>(storeSchemas)
			: defaultNoIDBSupportHandler<StoreSchemas>(storeSchemas);
	}

	const storeNames = Object.keys(storeSchemas) as ReadonlyArray<StringKey<StoreSchemas>>;

	// Create one database connection for all stores:
	const connection = createConnection({
		logger,
		databaseName,
		databaseVersion,
		storeNames,
	});

	function getDatabaseStore<StoreName extends StringKey<StoreSchemas>>(storeName: StoreName) {
		return getStore<StoreSchemas, StoreName>(connection, storeSchemas, storeName);
	}

	return getDatabaseStore;
}
