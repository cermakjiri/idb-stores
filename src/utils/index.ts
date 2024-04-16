import type { UseStore } from "idb-keyval";
import type { z } from "zod";

import { IDBZodError } from "../errors";
import type { Logger } from "../logger";
import type { UnknownStoreSchema } from "../types";

export const isSupported = () => "indexedDB" in globalThis;

export function getValueValidator<
	Schema extends UnknownStoreSchema,
	Key extends keyof z.infer<Schema>,
>(schema: Schema, key: Key) {
	const validator = schema.shape[key] as z.ZodTypeAny;

	if (!validator) {
		throw new IDBZodError(
			"missing-schema-property",
			`No schema property found for "${key as string}" key in ${JSON.stringify(
				schema.shape,
				null,
				2,
			)} shape.`,
		);
	}

	return validator;
}

interface CreateConnectionProps {
	databaseName: string;
	databaseVersion: number;
	storeNames: ReadonlyArray<string>;
	logger: Logger;
}

export async function createConnection<Props extends CreateConnectionProps>({
	databaseVersion,
	databaseName,
	storeNames,
	logger,
}: Props) {
	return new Promise<IDBDatabase>((res, rej) => {
		const request = indexedDB.open(databaseName, databaseVersion);

		request.onupgradeneeded = () => {
			const db = request.result;

			logger.debug("Creating IndexedDB stores:", storeNames);

			storeNames
				.filter((storeName) => !db.objectStoreNames.contains(storeName))
				.forEach((storeName) => {
					db.createObjectStore(storeName, {
						keyPath: null,
						autoIncrement: true,
					});
				});

			logger.debug("IndexedDB stores created", db.objectStoreNames);
		};

		request.onsuccess = () => {
			res(request.result);
		};
		request.onerror = () => {
			rej(request.error);
		};
	});
}

export function createCustomUseStore(
	connection: Promise<IDBDatabase>,
	storeName: string,
): UseStore {
	return async (txMode, callback) => {
		const db = await connection;

		const transaction = db.transaction(storeName, txMode);

		const store = transaction.objectStore(storeName);

		return callback(store);
	};
}
