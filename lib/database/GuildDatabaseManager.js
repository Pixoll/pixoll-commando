"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const Schemas_1 = __importDefault(require("./Schemas"));
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
        this.active = new DatabaseManager_1.default(Schemas_1.default.ActiveModel, guild);
        this.afk = new DatabaseManager_1.default(Schemas_1.default.AfkModel, guild);
        this.disabled = new DatabaseManager_1.default(Schemas_1.default.DisabledModel, guild);
        this.mcIps = new DatabaseManager_1.default(Schemas_1.default.McIpsModel, guild);
        this.moderations = new DatabaseManager_1.default(Schemas_1.default.ModerationsModel, guild);
        this.modules = new DatabaseManager_1.default(Schemas_1.default.ModulesModel, guild);
        this.prefixes = new DatabaseManager_1.default(Schemas_1.default.PrefixesModel, guild);
        this.polls = new DatabaseManager_1.default(Schemas_1.default.PollsModel, guild);
        this.reactionRoles = new DatabaseManager_1.default(Schemas_1.default.ReactionRolesModel, guild);
        this.rules = new DatabaseManager_1.default(Schemas_1.default.RulesModel, guild);
        this.setup = new DatabaseManager_1.default(Schemas_1.default.SetupModel, guild);
        this.stickyRoles = new DatabaseManager_1.default(Schemas_1.default.StickyRolesModel, guild);
        this.welcome = new DatabaseManager_1.default(Schemas_1.default.WelcomeModel, guild);
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