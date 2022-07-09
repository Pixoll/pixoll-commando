"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongoose_1 = require("mongoose");
const require_all_1 = __importDefault(require("require-all"));
const schemas_1 = __importDefault(require("./schemas"));
const util_1 = __importDefault(require("../../util"));
/**
 * Handlers for the whole database of the client.
 * @param client - The client these handlers are for
 */
async function modulesLoader(client) {
    const { database, databases, guilds, options } = client;
    const { mongoDbURI, modulesDir, excludeModules } = options;
    const { MONGO_DB_URI } = process.env;
    if (!MONGO_DB_URI && !mongoDbURI)
        return;
    await (0, mongoose_1.connect)(mongoDbURI ?? MONGO_DB_URI, { keepAlive: true });
    client.emit('debug', 'Established database connection');
    // Caches all the database in memory
    const data = new discord_js_1.Collection();
    for (const schema of Object.values(schemas_1.default)) {
        const objs = await schema.find({});
        const name = util_1.default.removeDashes(schema.collection.name);
        const entries = objs.map(obj => ([`${obj._id}`, obj]));
        const coll = new discord_js_1.Collection(entries);
        data.set(name, coll);
    }
    const clientData = data.mapValues(coll => coll.filter(doc => typeof doc.guild !== 'string'));
    // @ts-expect-error: init is protected in ClientDatabaseManager
    database.init(clientData);
    for (const guild of guilds.cache.toJSON()) {
        const guildData = data.mapValues(coll => coll.filter(doc => doc.guild === guild.id));
        // @ts-expect-error: init is protected in GuildDatabaseManager
        guild.database.init(guildData);
        databases.set(guild.id, guild.database);
    }
    client.emit('debug', 'Database caching process finished');
    client.emit('databaseReady', client);
    // Loads all the bot's features
    if (!modulesDir)
        return;
    const features = (0, require_all_1.default)(modulesDir);
    for (const folderName of Object.keys(features)) {
        const folder = features[folderName];
        if (typeof folder !== 'object')
            continue;
        for (const fileName in folder) {
            if (excludeModules?.includes(fileName))
                continue;
            const file = folder[fileName];
            await file(client);
            client.emit('debug', `Loaded feature ${folderName}/${fileName}`);
        }
    }
    client.emit('debug', 'Loaded client features');
    client.emit('modulesReady', client);
}
exports.default = modulesLoader;
//# sourceMappingURL=modules-loader.js.map