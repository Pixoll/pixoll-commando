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
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const schemas = __importStar(require("./util/schemas"));
/** A guilds' database manager (MongoDB) */
class GuildDatabaseManager {
    /** Guild for this database */
    guild;
    active;
    afk;
    disabled;
    mcIps;
    moderations;
    modules;
    polls;
    prefixes;
    reactionRoles;
    rules;
    setup;
    stickyRoles;
    welcome;
    /**
     * @param guild - The guild this database is for
     */
    constructor(guild) {
        Object.defineProperty(this, 'guild', { value: guild });
        this.active = new DatabaseManager_1.default(schemas.active, guild);
        this.afk = new DatabaseManager_1.default(schemas.afk, guild);
        this.disabled = new DatabaseManager_1.default(schemas.disabled, guild);
        this.mcIps = new DatabaseManager_1.default(schemas.mcIp, guild);
        this.moderations = new DatabaseManager_1.default(schemas.moderations, guild);
        this.modules = new DatabaseManager_1.default(schemas.modules, guild);
        this.prefixes = new DatabaseManager_1.default(schemas.prefixes, guild);
        this.polls = new DatabaseManager_1.default(schemas.polls, guild);
        this.reactionRoles = new DatabaseManager_1.default(schemas.reactionRoles, guild);
        this.rules = new DatabaseManager_1.default(schemas.rules, guild);
        this.setup = new DatabaseManager_1.default(schemas.setup, guild);
        this.stickyRoles = new DatabaseManager_1.default(schemas.stickyRoles, guild);
        this.welcome = new DatabaseManager_1.default(schemas.welcome, guild);
    }
    /**
     * Initializes the caching of this guild's data
     * @param data - The data to assign to the guild
     */
    init(data) {
        for (const [name, schema] of data) {
            // @ts-expect-error: no string index
            const dbManager = this[name];
            if (!dbManager)
                continue;
            dbManager.cache = schema;
        }
        return this;
    }
}
exports.default = GuildDatabaseManager;
//# sourceMappingURL=GuildDatabaseManager.js.map