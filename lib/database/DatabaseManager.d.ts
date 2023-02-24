import { Collection, LimitedCollection } from 'discord.js';
import { FilterQuery, UpdateAggregationStage, UpdateQuery } from 'mongoose';
import CommandoGuild from '../extensions/guild';
import { ModelFrom, SimplifiedModel, AnySchema } from './Schemas';
/** A MongoDB database schema manager */
export default class DatabaseManager<T extends AnySchema, IncludeId extends boolean = boolean> {
    /** Guild for this database */
    readonly guild: CommandoGuild | null;
    /** The name of the schema this manager is for */
    Schema: SimplifiedModel<T>;
    /** The cache for this manager */
    cache: LimitedCollection<string, T>;
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
    add(doc: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T>;
    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    delete(doc: T | string): Promise<T>;
    /**
     * Update a single document of the database
     * @param doc - The document to update or its ID
     * @param update - The update to apply
     * @returns The updated document
     */
    update(doc: T | string, update: Omit<T, 'createdAt' | 'updatedAt'> | UpdateAggregationStage | UpdateQuery<Omit<T, 'createdAt' | 'updatedAt'>>): Promise<T>;
    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    fetch(filter?: FilterQuery<Omit<T, 'createdAt' | 'updatedAt'>> | string): Promise<T | null>;
    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    fetchMany(filter?: FilterQuery<Omit<T, 'createdAt' | 'updatedAt'>>): Promise<Collection<string, T>>;
    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    protected filterDocuments(filter: FilterQuery<Omit<T, 'createdAt' | 'updatedAt'>>): (doc: T) => boolean;
}
