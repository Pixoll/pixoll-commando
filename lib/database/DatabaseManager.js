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
        const rawDoc = await Schema.findOne(filter);
        const doc = util_1.default.jsonifyDocument(rawDoc);
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
        const rawDocs = await Schema.find(filter);
        const fetched = new discord_js_1.LimitedCollection({
            maxSize: 200,
        });
        const jsonFiltered = rawDocs
            .map(util_1.default.jsonifyDocument)
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
            const found = Object.keys(filter).map(p => (0, lodash_1.isEqual)(doc[p], filter[p]));
            const matchesAll = found.filter(b => b === true).length === objKeys;
            return matchesAll;
        };
    }
}
exports.default = DatabaseManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFiYXNlL0RhdGFiYXNlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUEyRDtBQUMzRCxtQ0FBaUM7QUFHakMsbURBQTJCO0FBb0IzQix3Q0FBd0M7QUFDeEMsTUFBcUIsZUFBZTtJQUdoQyxpREFBaUQ7SUFDakMsTUFBTSxDQUEwQjtJQUNoRCxpQ0FBaUM7SUFDakIsS0FBSyxDQUE4QztJQUVuRTs7O09BR0c7SUFDSCxZQUFtQixNQUErQixFQUFFLEtBQXFCO1FBQ3JFLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksOEJBQWlCLENBQUM7WUFDL0IsT0FBTyxFQUFFLEdBQUc7U0FDZixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBbUI7UUFDaEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsTUFBTSxJQUFJLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDL0IsSUFBSSxLQUFLO1lBQUUsR0FBRyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBRWxDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFpQixDQUFDO1FBQzNELE1BQU0sS0FBSyxHQUFHLGNBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsSUFB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