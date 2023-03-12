import { Collection, LimitedCollection } from 'discord.js';
import { FilterQuery, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import CommandoGuild from '../extensions/guild';
import { ModelFrom, AnySchema, BaseSchema, JSONIfySchema } from './Schemas';
export type QuerySchema<T extends AnySchema> = T extends {
    _id: string;
} ? Omit<JSONIfySchema<T>, Exclude<keyof BaseSchema, '_id'>> : Omit<JSONIfySchema<T>, keyof BaseSchema>;
export interface DatabaseFetchOptions {
    /**
     * Whether to cache the fetched data if it wasn't already
     * @default true
     */
    cache?: boolean;
    /**
     * Whether to skip the cache check and request the API
     * @default false
     */
    force?: boolean;
}
/** A MongoDB database schema manager */
export default class DatabaseManager<T extends AnySchema, IncludeId extends boolean = boolean> {
    /** Guild for this database */
    readonly guild: CommandoGuild | null;
    /** The name of the schema this manager is for */
    readonly Schema: ModelFrom<T, IncludeId>;
    /** The cache for this manager */
    readonly cache: LimitedCollection<string, JSONIfySchema<T>>;
    /**
     * @param schema - The schema of this manager
     * @param guild - The guild this manager is for
     */
    constructor(schema: ModelFrom<T, IncludeId>, guild?: CommandoGuild);
    /**
     * Add a single document to the database.
     * @param doc - The document to add
     * @returns The added document
     */
    add(doc: QuerySchema<T>): Promise<JSONIfySchema<T>>;
    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    delete(doc: JSONIfySchema<T> | string): Promise<JSONIfySchema<T>>;
    /**
     * Update a single document of the database
     * @param doc - The document to update or its ID
     * @param update - The update to apply
     * @returns The updated document
     */
    update(doc: JSONIfySchema<T> | string, update: QuerySchema<T> | UpdateQuery<QuerySchema<T>> | UpdateWithAggregationPipeline): Promise<JSONIfySchema<T>>;
    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    fetch(filter?: FilterQuery<QuerySchema<T>> | string, options?: DatabaseFetchOptions): Promise<JSONIfySchema<T> | null>;
    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    fetchMany(filter?: FilterQuery<QuerySchema<T>>, options?: DatabaseFetchOptions): Promise<Collection<string, JSONIfySchema<T>>>;
    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    protected filterDocuments(filter: FilterQuery<Omit<JSONIfySchema<T>, 'createdAt' | 'updatedAt'>>): (doc: JSONIfySchema<T>) => boolean;
}
