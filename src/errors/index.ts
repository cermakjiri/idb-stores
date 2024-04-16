export type IDBZodErrorCode =
    /**
     * Validator for given key in given shcema was not found.
     */
    | 'missing-schema-property'

    /**
     * Invalid database version.
     */
    | 'invalid-db-version';

const errorId = 'IDB_ZOD_ERROR';

type ErrorId = typeof errorId;

export class IDBZodError<
    Code extends IDBZodErrorCode = IDBZodErrorCode,
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
        this.name = this.constructor.name;
        this.originalError = originalError;
    }
}

export function isIDBZodError(error: unknown): error is IDBZodError {
    return error instanceof IDBZodError && error.id === errorId;
}

export function isIDBZodErrorWithCodes<const Codes extends IDBZodErrorCode[], Description extends string = string>(
    error: unknown,
    codes: Codes,
): error is IDBZodError<Codes[number], Description> {
    return isIDBZodError(error) && codes.includes(error.code);
}
