"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const schemas_1 = __importDefault(require("./util/schemas"));
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
        this.active = new DatabaseManager_1.default(schemas_1.default.active, guild);
        this.afk = new DatabaseManager_1.default(schemas_1.default.afk, guild);
        this.disabled = new DatabaseManager_1.default(schemas_1.default.disabled, guild);
        this.mcIps = new DatabaseManager_1.default(schemas_1.default.mcIp, guild);
        this.moderations = new DatabaseManager_1.default(schemas_1.default.moderations, guild);
        this.modules = new DatabaseManager_1.default(schemas_1.default.modules, guild);
        this.prefixes = new DatabaseManager_1.default(schemas_1.default.prefixes, guild);
        this.polls = new DatabaseManager_1.default(schemas_1.default.polls, guild);
        this.reactionRoles = new DatabaseManager_1.default(schemas_1.default.reactionRoles, guild);
        this.rules = new DatabaseManager_1.default(schemas_1.default.rules, guild);
        this.setup = new DatabaseManager_1.default(schemas_1.default.setup, guild);
        this.stickyRoles = new DatabaseManager_1.default(schemas_1.default.stickyRoles, guild);
        this.welcome = new DatabaseManager_1.default(schemas_1.default.welcome, guild);
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