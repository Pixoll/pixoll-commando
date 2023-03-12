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
            throw new TypeError('Document must be an object');
        }
        const { guild, Schema } = this;
        if (guild)
            doc.guild ??= guild.id;
        const rawDoc = await new Schema(doc).save();
        const added = util_1.default.jsonifyDocument(rawDoc);
        this.cache.set(added._id, added);
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
        if (util_1.default.isNullish(doc)) {
            throw new TypeError('Document cannot be undefined or null.');
        }
        await Schema.updateOne({ _id: doc._id }, update);
        const rawDoc = await Schema.findOne({ _id: doc._id });
        const updatedDoc = util_1.default.jsonifyDocument(rawDoc);
        cache.set(updatedDoc._id.toString(), updatedDoc);
        return updatedDoc;
    }
    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    async fetch(filter = {}, options = {}) {
        const { cache, guild, Schema } = this;
        const { cache: shouldCache = true, force = false } = options;
        if (typeof filter === 'string') {
            const existing = cache.get(filter);
            if (existing && !force)
                return existing;
            const rawData = await Schema.findById(filter);
            const data = util_1.default.jsonifyDocument(rawData);
            if (data && shouldCache)
                cache.set(data._id.toString(), data);
            return data;
        }
        if (cache.size === 0 && !force)
            return null;
        if (guild)
            filter.guild ??= guild.id;
        const existing = cache.find(this.filterDocuments(filter));
        if (existing && !force)
            return existing;
        const rawDocs = await Schema.find();
        const doc = rawDocs
            .map(util_1.default.jsonifyDocument)
            .find(this.filterDocuments(filter)) ?? null;
        if (doc && shouldCache)
            cache.set(doc._id.toString(), doc);
        return doc;
    }
    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    async fetchMany(filter = {}, options = {}) {
        const { cache, guild, Schema } = this;
        const { cache: shouldCache = true, force = false } = options;
        if (cache.size === 0 && !force)
            return cache;
        if (guild)
            filter.guild ??= guild.id;
        const filtered = cache.filter(this.filterDocuments(filter));
        if (filtered.size !== 0 && !force)
            return filtered;
        const rawDocs = await Schema.find();
        const fetched = new discord_js_1.LimitedCollection({
            maxSize: 200,
        });
        const jsonFiltered = rawDocs
            .map(util_1.default.jsonifyDocument)
            .filter(this.filterDocuments(filter))
            .slice(0, 200);
        for (const doc of jsonFiltered) {
            const id = doc._id.toString();
            if (!guild && doc.guild)
                continue;
            if (!cache.get(id) && shouldCache)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFiYXNlL0RhdGFiYXNlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUEyRDtBQUMzRCxtQ0FBaUM7QUFHakMsbURBQTJCO0FBb0IzQix3Q0FBd0M7QUFDeEMsTUFBcUIsZUFBZTtJQUdoQyxpREFBaUQ7SUFDakMsTUFBTSxDQUEwQjtJQUNoRCxpQ0FBaUM7SUFDakIsS0FBSyxDQUE4QztJQUVuRTs7O09BR0c7SUFDSCxZQUFtQixNQUErQixFQUFFLEtBQXFCO1FBQ3JFLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksOEJBQWlCLENBQUM7WUFDL0IsT0FBTyxFQUFFLEdBQUc7U0FDZixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBbUI7UUFDaEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsTUFBTSxJQUFJLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDL0IsSUFBSSxLQUFLO1lBQUUsR0FBRyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBRWxDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFpQixDQUFDO1FBQzNELE1BQU0sS0FBSyxHQUFHLGNBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsSUFB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