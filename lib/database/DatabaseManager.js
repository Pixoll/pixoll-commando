"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const util_1 = __importDefault(require("../util"));
/** A MongoDB database schema manager */
class DatabaseManager {
    /** The name of the schema this manager is for */
    Schema;
    /** The cache for this manager */
    cache;
    /**
     * @param schema - The schema of this manager
     * @param guild - The guild this manager is for
     */
    constructor(schema, guild) {
        Object.defineProperty(this, 'guild', { value: guild ?? null });
        this.Schema = schema;
        this.cache = new discord_js_1.LimitedCollection({
            maxSize: 200,
        });
    }
    /**
     * Add a single document to the database.
     * @param doc - The document to add
     * @returns The added document
     */
    async add(doc) {
        if (typeof doc !== 'object') {
            throw new TypeError('Document must me an object');
        }
        const { guild, Schema } = this;
        if (guild)
            doc.guild ??= guild.id;
        const rawDoc = await new Schema(doc).save();
        const added = rawDoc.toJSON();
        this.cache.set(added._id.toString(), added);
        return added;
    }
    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    async delete(doc) {
        const { cache, Schema } = this;
        if (typeof doc !== 'string' && typeof doc !== 'object') {
            throw new TypeError('Document must me either an object or a document _id.');
        }
        if (typeof doc === 'object' && !doc._id) {
            throw new RangeError('Document must have the _id property.');
        }
        if (typeof doc === 'string') {
            const fetched = await this.fetch(doc);
            if (!fetched) {
                throw new Error(`Could not fetch document with _id "${doc}" in schema "${Schema.collection.name}#.`);
            }
            doc = fetched;
        }
        if (util_1.default.isNullish(doc)) {
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
    async update(doc, update) {
        const { cache, Schema } = this;
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
                throw new Error(`Could not fetch document with _id "${doc}" in schema "${Schema.collection.name}".`);
            }
            doc = fetched;
        }
        if (util_1.default.isNullish(doc)) {
            throw new TypeError('Document cannot be undefined or null.');
        }
        await Schema.updateOne({ _id: doc._id }, update);
        const rawDoc = await Schema.findOne({ _id: doc._id });
        const updatedDoc = rawDoc.toJSON();
        cache.set(updatedDoc._id.toString(), updatedDoc);
        return updatedDoc;
    }
    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    async fetch(filter = {}) {
        const { cache, guild, Schema } = this;
        if (typeof filter === 'string') {
            const existing = cache.get(filter);
            if (existing)
                return existing;
            const rawData = await Schema.findById(filter);
            const data = rawData?.toJSON() ?? null;
            if (data)
                cache.set(data._id.toString(), data);
            return data;
        }
        if (cache.size === 0)
            return null;
        if (guild)
            filter.guild ??= guild.id;
        const existing = cache.find(this.filterDocuments(filter));
        if (existing)
            return existing;
        const rawDoc = await Schema.findOne(filter);
        const doc = rawDoc?.toJSON() ?? null;
        if (doc)
            cache.set(doc._id.toString(), doc);
        return doc;
    }
    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    async fetchMany(filter = {}) {
        const { cache, guild, Schema } = this;
        if (cache.size === 0)
            return cache;
        if (guild)
            filter.guild ??= guild.id;
        const filtered = cache.filter(this.filterDocuments(filter));
        if (filtered.size !== 0)
            return filtered;
        const rawData = await Schema.find(filter);
        const fetched = new discord_js_1.LimitedCollection({
            maxSize: 200,
        });
        for (const rawDoc of rawData.slice(0, 200)) {
            const doc = rawDoc.toJSON();
            const id = doc._id.toString();
            if (!guild && doc.guild)
                continue;
            if (!cache.get(id))
                cache.set(id, doc);
            fetched.set(id, doc);
        }
        return fetched;
    }
    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    filterDocuments(filter) {
        return (doc) => {
            const objKeys = Object.keys(filter).length;
            if (objKeys === 0)
                return true;
            const found = [];
            for (const p of Object.keys(filter)) {
                found.push((0, lodash_1.isEqual)(doc[p], filter[p]));
            }
            const matchesAll = found.filter(b => b === true).length === objKeys;
            return matchesAll;
        };
    }
}
exports.default = DatabaseManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFiYXNlL0RhdGFiYXNlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUEyRDtBQUMzRCxtQ0FBaUM7QUFHakMsbURBQTJCO0FBTzNCLHdDQUF3QztBQUN4QyxNQUFxQixlQUFlO0lBR2hDLGlEQUFpRDtJQUMxQyxNQUFNLENBQTBCO0lBQ3ZDLGlDQUFpQztJQUMxQixLQUFLLENBQStCO0lBRTNDOzs7T0FHRztJQUNILFlBQW1CLE1BQStCLEVBQUUsS0FBcUI7UUFDckUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSw4QkFBaUIsQ0FBQztZQUMvQixPQUFPLEVBQUUsR0FBRztTQUNmLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFtQjtRQUNoQyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUN6QixNQUFNLElBQUksU0FBUyxDQUFDLDRCQUE0QixDQUFDLENBQUM7U0FDckQ7UUFFRCxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUMvQixJQUFJLEtBQUs7WUFBRSxHQUFHLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFFbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQTBCLENBQUM7UUFDcEUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFL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