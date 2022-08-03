import { Collection, LimitedCollection } from 'discord.js';
import { isEqual } from 'lodash';
import { FilterQuery, UpdateAggregationStage, UpdateQuery } from 'mongoose';
import CommandoGuild from '../extensions/guild';
import Util from '../util';
import { ModelFrom, SimplifiedModel, AnySchema } from './Schemas';

/** A MongoDB database schema manager */
export default class DatabaseManager<T extends AnySchema> {
    /** Guild for this database */
    declare public readonly guild: CommandoGuild | null;
    /** The name of the schema this manager is for */
    public Schema: SimplifiedModel<T>;
    /** The cache for this manager */
    public cache: LimitedCollection<string, T>;

    /**
     * @param schema - The schema of this manager
     * @param guild - The guild this manager is for
     */
    public constructor(schema: ModelFrom<T, boolean>, guild?: CommandoGuild) {
        Object.defineProperty(this, 'guild', { value: guild ?? null });

        // @ts-expect-error: SimplifiedModel is meant to narrow and simplify methods for better understanding
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
    public async add(doc: T): Promise<T> {
        if (typeof doc !== 'object') {
            throw new TypeError('Document must me an object');
        }

        const { guild, Schema: Schema } = this;
        if (guild) doc.guild ??= guild.id;

        const added = await new Schema(doc).save() as T;
        this.cache.set(added._id.toString(), added);

        return added;
    }

    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    public async delete(doc: T | string): Promise<T> {
        const { cache, Schema: schema } = this;

        if (typeof doc !== 'string' && typeof doc !== 'object') {
            throw new TypeError('Document must me either an object or a document _id.');
        }
        if (typeof doc === 'object' && !doc._id) {
            throw new RangeError('Document must have the _id property.');
        }
        if (typeof doc === 'string') {
            const fetched = await this.fetch(doc);
            if (!fetched) {
                throw new Error(`Could not fetch document with _id "${doc}" in schema ""${schema.collection.name}.`);
            }
            doc = fetched;
        }
        if (Util.isNullish(doc)) {
            throw new TypeError('Document cannot be undefined or null.');
        }

        cache.delete(doc._id.toString());
        await schema.deleteOne({ _id: doc._id });

        return doc;
    }

    /**
     * Update a single document of the database
     * @param doc - The document to update or its ID
     * @param update - The update to apply
     * @returns The updated document
     */
    public async update(doc: T | string, update: T | UpdateAggregationStage | UpdateQuery<T>): Promise<T> {
        const { cache, Schema: schema } = this;

        if (typeof doc !== 'string' && typeof doc !== 'object') {
            throw new TypeError('Document must me either an object or a document _id.');
        }
        if (typeof doc === 'object' && !doc._id) {
            throw new RangeError('Document must have the _id property.');
        }
        if (typeof update !== 'object') {
            throw new TypeError('Options must me an object.');
        }
        if (typeof doc === 'string') {
            const fetched = await this.fetch(doc);
            if (!fetched) {
                throw new Error(`Could not fetch document with _id "${doc}" in schema ""${schema.collection.name}.`);
            }
            doc = fetched;
        }
        if (Util.isNullish(doc)) {
            throw new TypeError('Document cannot be undefined or null.');
        }

        await schema.updateOne({ _id: doc._id }, update);
        const newDoc = await this.Schema.findById(doc._id.toString());
        cache.set(newDoc._id.toString(), newDoc);

        return newDoc;
    }

    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    public async fetch(filter: FilterQuery<T> | string = {}): Promise<T | null> {
        const { cache, guild, Schema: schema } = this;
        if (typeof filter === 'string') {
            const existing = cache.get(filter);
            if (existing) return existing;
            const data = await schema.findById(filter);
            if (data) cache.set(data._id.toString(), data);
            return data;
        }

        if (cache.size === 0) return null;

        if (guild) filter.guild ??= guild.id;
        const existing = cache.find(this.filterDocuments(filter));
        if (existing) return existing;

        const doc = await schema.findOne(filter);
        if (doc) {
            cache.set(doc._id.toString(), doc);
            return doc;
        }
        return null;
    }

    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    public async fetchMany(filter: FilterQuery<T> = {}): Promise<Collection<string, T>> {
        const { cache, guild, Schema: schema } = this;
        if (cache.size === 0) return cache;

        if (guild) filter.guild ??= guild.id;
        const filtered = cache.filter(this.filterDocuments(filter));
        if (filtered.size !== 0) return filtered;

        const data = await schema.find(filter);
        const fetched: Collection<string, T> = new LimitedCollection({
            maxSize: 200,
        });

        for (const doc of data) {
            const id = doc._id.toString();
            if (!guild && doc.guild) continue;
            if (!cache.get(id)) {
                cache.set(id, doc);
            }
            fetched.set(id, doc);
        }
        return fetched;
    }

    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    protected filterDocuments(filter: FilterQuery<T>) {
        return (doc: T): boolean => {
            const objKeys = Object.keys(filter).length;
            if (objKeys === 0) return true;
            const found = [];
            for (const p of Object.keys(filter) as Array<keyof typeof filter>) {
                found.push(isEqual(doc[p as keyof T], filter[p]));
            }
            const matchesAll = found.filter((b): b is true => b === true).length === objKeys;
            return matchesAll;
        };
    }
}
