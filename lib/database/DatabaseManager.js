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
        // @ts-expect-error: SimplifiedModel is meant to narrow and simplify methods for better understanding
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
        const added = await new Schema(doc).save();
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
        const newDoc = await Schema.findById(doc._id.toString());
        cache.set(newDoc._id.toString(), newDoc);
        return newDoc;
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
            const data = await Schema.findById(filter);
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
        const doc = await Schema.findOne(filter);
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
    async fetchMany(filter = {}) {
        const { cache, guild, Schema } = this;
        if (cache.size === 0)
            return cache;
        if (guild)
            filter.guild ??= guild.id;
        const filtered = cache.filter(this.filterDocuments(filter));
        if (filtered.size !== 0)
            return filtered;
        const data = await Schema.find(filter);
        const fetched = new discord_js_1.LimitedCollection({
            maxSize: 200,
        });
        for (const doc of data) {
            const id = doc._id.toString();
            if (!guild && doc.guild)
                continue;
            if (!cache.get(id)) {
                cache.set(id, doc);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFiYXNlL0RhdGFiYXNlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUEyRDtBQUMzRCxtQ0FBaUM7QUFHakMsbURBQTJCO0FBTzNCLHdDQUF3QztBQUN4QyxNQUFxQixlQUFlO0lBR2hDLGlEQUFpRDtJQUMxQyxNQUFNLENBQXFCO0lBQ2xDLGlDQUFpQztJQUMxQixLQUFLLENBQStCO0lBRTNDOzs7T0FHRztJQUNILFlBQW1CLE1BQStCLEVBQUUsS0FBcUI7UUFDckUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELHFHQUFxRztRQUNyRyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksOEJBQWlCLENBQUM7WUFDL0IsT0FBTyxFQUFFLEdBQUc7U0FDZixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBbUI7UUFDaEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsTUFBTSxJQUFJLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDL0IsSUFBSSxLQUFLO1lBQUUsR0FBRyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBRWxDLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFPLENBQUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FB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