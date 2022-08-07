"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongoose_1 = require("mongoose");
const require_all_1 = __importDefault(require("require-all"));
const Schemas_1 = __importDefault(require("./Schemas"));
const util_1 = __importDefault(require("../util"));
/**
 * Connects to MongoDB, caches the database and loads all client modules.
 * @param client - The client the database is for.
 */
async function initializeDB(client) {
    const connected = await connectDB(client);
    if (!connected)
        return;
    await cacheDB(client);
    await loadModules(client);
}
exports.default = initializeDB;
/**
 * Connects the client to the database.
 * @param client - The client this handlers is for.
 */
async function connectDB(client) {
    const { mongoDbURI } = client.options;
    const { MONGO_DB_URI } = process.env;
    const uri = mongoDbURI ?? MONGO_DB_URI;
    if (!uri)
        return false;
    await (0, mongoose_1.connect)(uri, { keepAlive: true });
    client.emit('debug', 'Established database connection');
    return true;
}
/**
 * Caches all the DB data.
 * @param client - The client this handlers is for.
 */
async function cacheDB(client) {
    const { database, databases, guilds } = client;
    const schemas = Object.values(Schemas_1.default);
    // Resolves all promises at once after getting all data.
    const schemasData = await Promise.all(schemas.map(schema => schema.find({})));
    const data = new discord_js_1.Collection();
    for (let i = 0; i < schemas.length; i++) {
        const schemaName = util_1.default.removeDashes(schemas[i].collection.name);
        const entries = schemasData[i].map(doc => [doc._id.toString(), doc]);
        const documents = new discord_js_1.LimitedCollection({
            maxSize: 200,
        }, entries);
        data.set(schemaName, documents);
    }
    const clientData = data.mapValues(coll => coll.filter(doc => typeof doc.guild !== 'string'));
    // @ts-expect-error: init is protected in ClientDatabaseManager
    database.init(clientData);
    for (const guild of guilds.cache.values()) {
        const guildData = data.mapValues(coll => coll.filter(doc => doc.guild === guild.id));
        // @ts-expect-error: init is protected in GuildDatabaseManager
        guild.database.init(guildData);
        databases.set(guild.id, guild.database);
    }
    client.emit('debug', 'Database caching process finished');
    client.emit('databaseReady', client);
}
/**
 * Loads all the client's modules.
 * @param client - The client this handlers is for.
 */
async function loadModules(client) {
    const { options } = client;
    const { modulesDir, excludeModules } = options;
    if (!modulesDir)
        return;
    const modules = (0, require_all_1.default)(modulesDir);
    for (const folderName of Object.keys(modules)) {
        const folder = modules[folderName];
        if (typeof folder !== 'object')
            continue;
        for (const fileName in folder) {
            if (excludeModules?.includes(fileName))
                continue;
            const file = folder[fileName];
            // eslint-disable-next-line no-await-in-loop
            await file(client);
            client.emit('debug', `Loaded module ${folderName}/${fileName}`);
        }
    }
    client.emit('debug', 'Loaded client module');
    client.emit('modulesReady', client);
}
//# sourceMappingURL=initializeDB.js.map