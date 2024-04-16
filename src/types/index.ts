import type z from 'zod';

export type StringKey<T extends Record<any, any>> = keyof T & string;

export type UnknownStoreSchema = z.ZodObject<any>;

export type UnknownStoreSchemas = Readonly<Record<string, UnknownStoreSchema>>;

export type StoreWithSchema<
    Name extends string,
    Schema extends UnknownStoreSchema,
    SchemaType extends z.infer<Schema> = z.infer<Schema>,
    StoreKey extends StringKey<SchemaType> = StringKey<SchemaType>,
> = {
    name: Name;

    get<Key extends StoreKey>(key: Key): Promise<SchemaType[Key]>;

    set<Key extends StoreKey>(key: Key, value: Required<SchemaType[Key]>): Promise<void>;

    remove<Key extends StoreKey>(key: Key): Promise<void>;

    clear(): Promise<void>;
};
