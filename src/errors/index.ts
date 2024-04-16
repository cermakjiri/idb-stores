export type IDBStoresErrorCode =
    /**
     * Validator for given key in given shcema was not found.
     */
    | 'missing-schema-property'

    /**
     * Invalid database version.
     */
    | 'invalid-db-version';

const errorId = 'IDB_STORES_ERROR';

type ErrorId = typeof errorId;

export class IDBStoresError<
    Code extends IDBStoresErrorCode = IDBStoresErrorCode,
    Description extends string = string,
    OriginalError extends Error = Error,
> extends Error {
    public readonly code: Code;
    public readonly id: ErrorId;
    public readonly description: Description | undefined;
    public static readonly id = errorId;
    public readonly originalError: OriginalError | null;

    constructor(code: Code, description?: Description, originalError: OriginalError | null = null) {
        super(description ? `${code}: ${description}` : code);

        this.id = errorId;
        this.code = code;
        this.description = description;
        this.name = errorId;
        this.originalError = originalError;
    }
}

export function isError(error: unknown): error is IDBStoresError {
    return error instanceof IDBStoresError && error.id === errorId;
}

export function isErrorWithCodes<const Codes extends IDBStoresErrorCode[], Description extends string = string>(
    error: unknown,
    codes: Codes,
): error is IDBStoresError<Codes[number], Description> {
    return isError(error) && codes.includes(error.code);
}
