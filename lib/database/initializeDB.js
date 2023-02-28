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
    // @ts-expect-error: we only care about the general schema type
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
            const loader = typeof file === 'function'
                ? file
                : file.default
                    || file[Object.keys(file).filter(k => k !== '__esModule')[0]];
            // eslint-disable-next-line no-await-in-loop
            await loader(client);
            client.emit('debug', `Loaded module ${folderName}/${fileName}`);
        }
    }
    client.emit('debug', 'Loaded client modules');
    client.emit('modulesReady', client);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6ZURCLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFiYXNlL2luaXRpYWxpemVEQi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUEyRDtBQUMzRCx1Q0FBbUM7QUFDbkMsOERBQXFDO0FBRXJDLHdEQUEwRDtBQUMxRCxtREFBMkI7QUFRM0I7OztHQUdHO0FBQ1ksS0FBSyxVQUFVLFlBQVksQ0FBQyxNQUE0QjtJQUNuRSxNQUFNLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQyxJQUFJLENBQUMsU0FBUztRQUFFLE9BQU87SUFDdkIsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEIsTUFBTSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUxELCtCQUtDO0FBRUQ7OztHQUdHO0FBQ0gsS0FBSyxVQUFVLFNBQVMsQ0FBQyxNQUE0QjtJQUNqRCxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUN0QyxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUNyQyxNQUFNLEdBQUcsR0FBRyxVQUFVLElBQUksWUFBWSxDQUFDO0lBRXZDLElBQUksQ0FBQyxHQUFHO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDdkIsTUFBTSxJQUFBLGtCQUFPLEVBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztJQUN4RCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsS0FBSyxVQUFVLE9BQU8sQ0FBQyxNQUE0QjtJQUMvQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENB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