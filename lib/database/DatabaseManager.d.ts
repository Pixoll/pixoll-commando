import { Collection } from 'discord.js';
import { FilterQuery, Model, UpdateAggregationStage, UpdateQuery } from 'mongoose';
import CommandoGuild from '../extensions/guild';
export interface DataModel<T> extends Model<T> {
    find(filter: FilterQuery<T>): Promise<T[]>;
    findOne(filter: FilterQuery<T>): Promise<T>;
    findById(id: string): Promise<T>;
    updateOne(filter: FilterQuery<T>): Promise<T>;
}
/** A database schema manager (MongoDB) */
export default class DatabaseManager<T extends {
    _id: string;
    guild?: string;
}> {
    /** Guild for this database */
    readonly guild: CommandoGuild | null;
    /** The name of the schema this manager is for */
    schema: DataModel<T>;
    /** The cache for this manager */
    cache: Collection<string, T>;
    /**
     * @param schema - The schema of this manager
     * @param guild - The guild this manager is for
     */
    constructor(schema: Model<T>, guild?: CommandoGuild);
    /**
     * Add a single document to the database, or updates it if there's an existing one
     * @param doc - The document to add
     * @returns The added document
     */
    add(doc: T): Promise<T>;
    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    delete(doc: T | string): Promise<T>;
    /**
     * Update a single document of the database
     * @param toUpdate - The document to update or its ID
     * @param options - The options for this update
     * @returns The updated document
     */
    update(toUpdate: T | string, options: T | UpdateAggregationStage | UpdateQuery<T>): Promise<T>;
    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    fetch(filter?: FilterQuery<T> | string): Promise<T | null>;
    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    fetchMany(filter?: FilterQuery<T>): Promise<Collection<string, T>>;
    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    protected _filterDocuments(filter: FilterQuery<T>): (doc: T) => boolean;
}
