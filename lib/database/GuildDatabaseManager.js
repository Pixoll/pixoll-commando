"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseManager_1 = __importDefault(require("./DatabaseManager"));
const Schemas_1 = __importDefault(require("./Schemas"));
/** A guilds' database manager (MongoDB) */
class GuildDatabaseManager {
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
        for (const [name, schemaCollection] of data) {
            const dbManager = this[name];
            if (!dbManager)
                continue;
            // @ts-expect-error: AnySchema is a catch-all schema type
            dbManager.cache.concat(schemaCollection);
        }
        return this;
    }
}
exports.default = GuildDatabaseManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3VpbGREYXRhYmFzZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGF0YWJhc2UvR3VpbGREYXRhYmFzZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSx3RUFBZ0Q7QUFDaEQsd0RBZ0JtQjtBQUluQiwyQ0FBMkM7QUFDM0MsTUFBcUIsb0JBQW9CO0lBSTlCLE1BQU0sQ0FBZ0M7SUFDdEMsR0FBRyxDQUE2QjtJQUNoQyxRQUFRLENBQWtDO0lBQzFDLEtBQUssQ0FBOEI7SUFDbkMsV0FBVyxDQUFvQztJQUMvQyxPQUFPLENBQWdDO0lBQ3ZDLEtBQUssQ0FBOEI7SUFDbkMsUUFBUSxDQUFnQztJQUN4QyxhQUFhLENBQXNDO0lBQ25ELEtBQUssQ0FBOEI7SUFDbkMsS0FBSyxDQUErQjtJQUNwQyxXQUFXLENBQW9DO0lBQy9DLE9BQU8sQ0FBaUM7SUFFL0M7O09BRUc7SUFDSCxZQUFtQixLQUFvQjtRQUNuQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sSUFBSSxDQUFDLElBQTZFO1FBQ3hGLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUN6QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxTQUFTO2dCQUFFLFNBQVM7WUFDekIseURBQXlEO1lBQ3pELFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDNUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFwREQsdUNBb0RDIn0=