"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongoose_1 = require("mongoose");
const require_all_1 = __importDefault(require("require-all"));
const schemas = __importStar(require("./schemas"));
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
    for (const schema of Object.values(schemas)) {
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