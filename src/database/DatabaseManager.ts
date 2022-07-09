import { Collection } from 'discord.js';
import { isEqual } from 'lodash';
import { FilterQuery, UpdateAggregationStage, UpdateQuery } from 'mongoose';
import CommandoGuild from '../extensions/guild';
import { DataModel } from './util/schemas';

/** A database schema manager (MongoDB) */
export default class DatabaseManager<T extends { _id: string, guild?: string }> {
    /** Guild for this database */
    public readonly guild!: CommandoGuild | null;
    /** The name of the schema this manager is for */
    public schema: DataModel<T>;
    /** The cache for this manager */
    public cache: Collection<string, T>;

    /**
     * @param schema - The schema of this manager
     * @param guild - The guild this manager is for
     */
    public constructor(schema: DataModel<T>, guild?: CommandoGuild) {
        Object.defineProperty(this, 'guild', { value: guild ?? null });

        this.schema = schema;
        this.cache = new Collection();
    }

    /**
     * Add a single document to the database, or updates it if there's an existing one
     * @param doc - The document to add
     * @returns The added document
     */
    public async add(doc: T): Promise<T> {
        if (typeof doc !== 'object') {
            throw new TypeError('Document must me an object');
        }
        const { guild, schema } = this;
        if (guild) doc.guild ??= guild.id;
        const existing = doc._id ? await schema.findById(`${doc._id}`) : await schema.findOne(doc);
        if (existing) {
            const updated = await this.update(existing, doc);
            return updated;
        }
        // eslint-disable-next-line new-cap
        const added = await new schema(doc).save() as T;
        this.cache.set(`${added._id}`, added);
        return added;
    }

    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    public async delete(doc: T | string): Promise<T> {
        if (typeof doc !== 'string' && typeof doc !== 'object') {
            throw new TypeError('Document must me either an object or a document ID.');
        }
        if (typeof doc === 'object' && !doc._id) {
            throw new RangeError('Document must have the _id property.');
        }
        if (typeof doc === 'string') {
            doc = (await this.fetch(doc))!;
        }
        this.cache.delete(`${doc._id}`);
        // @ts-expect-error: conversion from T to DataModel<T> might be a mistake
        await (doc as DataModel<T>).deleteOne();
        return doc;
    }

    /**
     * Update a single document of the database
     * @param toUpdate - The document to update or its ID
     * @param options - The options for this update
     * @returns The updated document
     */
    public async update(toUpdate: T | string, options: T | UpdateAggregationStage | UpdateQuery<T>): Promise<T> {
        if (typeof toUpdate !== 'string' && typeof toUpdate !== 'object') {
            throw new TypeError('toUpdate must me either an object or a document ID.');
        }
        if (typeof toUpdate === 'object' && !toUpdate._id) {
            throw new RangeError('toUpdate must have the _id property.');
        }
        if (typeof options !== 'object') {
            throw new TypeError('options must me an object.');
        }
        if (typeof toUpdate === 'string') {
            toUpdate = (await this.fetch(toUpdate))!;
        }
        if (typeof toUpdate === 'undefined' || toUpdate === null) {
            throw new TypeError('toUpdate cannot be undefined or null.');
        }
        // @ts-expect-error: conversion from T to DataModel<T> might be a mistake
        await (toUpdate as DataModel<T>).updateOne(options);
        const newDoc = await this.schema.findById(`${toUpdate._id}`);
        this.cache.set(`${newDoc._id}`, newDoc);
        return newDoc;
    }

    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    public async fetch(filter: FilterQuery<T> | string = {}): Promise<T | null> {
        const { guild, schema } = this;
        if (typeof filter === 'string') {
            const existing = this.cache.get(filter);
            if (existing) return existing;
            const data = await schema.findById(filter);
            if (data) this.cache.set(`${data._id}`, data);
            return data;
        }

        if (this.cache.size === 0) return null;

        if (guild) filter.guild ??= guild.id;
        const existing = this.cache.find(this._filterDocuments(filter));
        if (existing) return existing;

        const doc = await schema.findOne(filter);
        if (doc) {
            this.cache.set(`${doc._id}`, doc);
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
        if (this.cache.size === 0) return this.cache;
        const { guild, schema } = this;

        if (guild) filter.guild ??= guild.id;
        const filtered = this.cache.filter(this._filterDocuments(filter));
        if (filtered.size !== 0) return filtered;

        const data = await schema.find(filter);
        const fetched = new Collection() as Collection<string, T>;
        for (const doc of data) {
            if (!guild && doc.guild) continue;
            if (!this.cache.get(`${doc._id}`)) {
                this.cache.set(`${doc._id}`, doc);
            }
            fetched.set(`${doc._id}`, doc);
        }
        return fetched;
    }

    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    protected _filterDocuments(filter: FilterQuery<T>) {
        return (doc: T): boolean => {
            const objKeys = Object.keys(filter).length;
            if (objKeys === 0) return true;
            const found = [];
            for (const p in filter) {
                // @ts-expect-error: no string index
                found.push(isEqual(doc[p], filter[p]));
            }
            const matchesAll = found.filter(b => b === true).length === objKeys;
            return matchesAll;
        };
    }
}
