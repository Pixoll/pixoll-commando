import { Collection, LimitedCollection } from 'discord.js';
import { isEqual } from 'lodash';
import { Document, FilterQuery, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import CommandoGuild from '../extensions/guild';
import Util from '../util';
import { ModelFrom, AnySchema, BaseSchema, JSONIfySchema } from './Schemas';

export type QuerySchema<T extends AnySchema> = T extends { _id: string }
    ? Omit<JSONIfySchema<T>, Exclude<keyof BaseSchema, '_id'>>
    : Omit<JSONIfySchema<T>, keyof BaseSchema>;

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
    declare public readonly guild: CommandoGuild | null;
    /** The name of the schema this manager is for */
    public readonly Schema: ModelFrom<T, IncludeId>;
    /** The cache for this manager */
    public readonly cache: LimitedCollection<string, JSONIfySchema<T>>;

    /**
     * @param schema - The schema of this manager
     * @param guild - The guild this manager is for
     */
    public constructor(schema: ModelFrom<T, IncludeId>, guild?: CommandoGuild) {
        Object.defineProperty(this, 'guild', { value: guild ?? null });

        this.Schema = schema;
        this.cache = new LimitedCollection({
            maxSize: 200,
        });
    }

    /**
     * Add a single document to the database.
     * @param doc - The document to add
     * @returns The added document
     */
    public async add(doc: QuerySchema<T>): Promise<JSONIfySchema<T>> {
        if (typeof doc !== 'object') {
            throw new TypeError('Document must be an object');
        }

        const { guild, Schema } = this;
        if (guild) doc.guild ??= guild.id;

        const rawDoc = await new Schema(doc).save() as Document<T>;
        const added = Util.jsonifyDocument(rawDoc);
        this.cache.set(added._id, added);

        return added;
    }

    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    public async delete(doc: JSONIfySchema<T> | string): Promise<JSONIfySchema<T>> {
        const { cache, Schema } = this;

        if (typeof doc !== 'string' && typeof doc !== 'object') {
            throw new TypeError('Document must be either an object or a document _id.');
        }
        if (typeof doc === 'object' && !doc._id) {
            throw new RangeError('Document must have the _id property.');
        }
        if (typeof doc === 'string') {
            const fetched = await this.fetch(doc);
            if (!fetched) {
                throw new Error(`Could not fetch document with _id "${doc}" in schema "${Schema.collection.name}".`);
            }
            doc = fetched;
        }
        if (Util.isNullish(doc)) {
            throw new TypeError('Document cannot be undefined or null.');
        }

        cache.delete(doc._id.toString());
        await Schema.deleteOne({ _id: doc._id });

        return doc;
    }

    /**
     * Update a single document of the database
     * @param doc - The document to update or its ID
     * @param update - The update to apply
     * @returns The updated document
     */
    public async update(
        doc: JSONIfySchema<T> | string,
        update: QuerySchema<T> | UpdateQuery<QuerySchema<T>> | UpdateWithAggregationPipeline
    ): Promise<JSONIfySchema<T>> {
        const { cache, Schema } = this;

        if (typeof doc !== 'string' && typeof doc !== 'object') {
            throw new TypeError('Document must be either an object or a document _id.');
        }
        if (typeof doc === 'object' && !doc._id) {
            throw new RangeError('Document must have the _id property.');
        }
        if (!Array.isArray(update) && typeof update !== 'object') {
            throw new TypeError('Options must be either an object or an AggregationState array.');
        }
        if (typeof doc === 'string') {
            const fetched = await this.fetch(doc);
            if (!fetched) {
                throw new Error(`Could not fetch document with _id "${doc}" in schema "${Schema.collection.name}".`);
            }
            doc = fetched;
        }
        if (Util.isNullish(doc)) {
            throw new TypeError('Document cannot be undefined or null.');
        }

        await Schema.updateOne({ _id: doc._id }, update as UpdateWithAggregationPipeline);
        const rawDoc = await Schema.findOne({ _id: doc._id }) as Document<T>;
        const updatedDoc = Util.jsonifyDocument(rawDoc);
        cache.set(updatedDoc._id.toString(), updatedDoc);

        return updatedDoc;
    }

    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    public async fetch(
        filter: FilterQuery<QuerySchema<T>> | string = {},
        options: DatabaseFetchOptions = {}
    ): Promise<JSONIfySchema<T> | null> {
        const { cache, guild, Schema } = this;
        const { cache: shouldCache = true, force = false } = options;

        if (typeof filter === 'string') {
            const existing = cache.get(filter);
            if (existing && !force) return existing;
            const rawData = await Schema.findById<Document<T>>(filter);
            const data = Util.jsonifyDocument(rawData);
            if (data && shouldCache) cache.set(data._id.toString(), data);
            return data;
        }

        if (cache.size === 0 && !force) return null;

        if (guild) filter.guild ??= guild.id;
        const existing = cache.find(this.filterDocuments(filter));
        if (existing && !force) return existing;

        const rawDoc = await Schema.findOne<Document<T>>(filter);
        const doc = Util.jsonifyDocument(rawDoc);
        if (doc && shouldCache) cache.set(doc._id.toString(), doc);
        return doc;
    }

    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    public async fetchMany(
        filter: FilterQuery<QuerySchema<T>> = {},
        options: DatabaseFetchOptions = {}
    ): Promise<Collection<string, JSONIfySchema<T>>> {
        const { cache, guild, Schema } = this;
        const { cache: shouldCache = true, force = false } = options;
        if (cache.size === 0 && !force) return cache;

        if (guild) filter.guild ??= guild.id;
        const filtered = cache.filter(this.filterDocuments(filter));
        if (filtered.size !== 0 && !force) return filtered;

        const rawDocs = await Schema.find<Document<T>>(filter);
        const fetched: Collection<string, JSONIfySchema<T>> = new LimitedCollection({
            maxSize: 200,
        });

        const jsonFiltered = rawDocs
            .map(Util.jsonifyDocument)
            .slice(0, 200);
        for (const doc of jsonFiltered) {
            const id = doc._id.toString();
            if (!guild && doc.guild) continue;
            if (!cache.get(id) && shouldCache) cache.set(id, doc);
            fetched.set(id, doc);
        }
        return fetched;
    }

    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    protected filterDocuments(filter: FilterQuery<Omit<JSONIfySchema<T>, 'createdAt' | 'updatedAt'>>) {
        return (doc: JSONIfySchema<T>): boolean => {
            const objKeys = Object.keys(filter).length;
            if (objKeys === 0) return true;
            const found = (Object.keys(filter) as Array<keyof typeof filter>).map(p =>
                isEqual(doc[p as keyof JSONIfySchema<T>], filter[p])
            );
            const matchesAll = found.filter(b => b === true).length === objKeys;
            return matchesAll;
        };
    }
}
