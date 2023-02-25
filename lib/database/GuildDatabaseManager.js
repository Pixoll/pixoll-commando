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
        for (const [name, schema] of data) {
            const dbManager = this[name];
            if (!dbManager)
                continue;
            // @ts-expect-error: AnySchema not assignable to individual schema types
            dbManager.cache = schema;
        }
        return this;
    }
}
exports.default = GuildDatabaseManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3VpbGREYXRhYmFzZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGF0YWJhc2UvR3VpbGREYXRhYmFzZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSx3RUFBZ0Q7QUFDaEQsd0RBZW1CO0FBSW5CLDJDQUEyQztBQUMzQyxNQUFxQixvQkFBb0I7SUFJOUIsTUFBTSxDQUFnQztJQUN0QyxHQUFHLENBQTZCO0lBQ2hDLFFBQVEsQ0FBa0M7SUFDMUMsS0FBSyxDQUE4QjtJQUNuQyxXQUFXLENBQW9DO0lBQy9DLE9BQU8sQ0FBZ0M7SUFDdkMsS0FBSyxDQUE4QjtJQUNuQyxRQUFRLENBQWdDO0lBQ3hDLGFBQWEsQ0FBc0M7SUFDbkQsS0FBSyxDQUE4QjtJQUNuQyxLQUFLLENBQStCO0lBQ3BDLFdBQVcsQ0FBb0M7SUFDL0MsT0FBTyxDQUFpQztJQUUvQzs7T0FFRztJQUNILFlBQW1CLEtBQW9CO1FBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXZELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHlCQUFlLENBQUMsaUJBQU8sQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUkseUJBQWUsQ0FBQyxpQkFBTyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSx5QkFBZSxDQUFDLGlCQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7O09BR0c7SUFDTyxJQUFJLENBQUMsSUFBOEQ7UUFDekUsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtZQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxTQUFTO2dCQUFFLFNBQVM7WUFDekIsd0VBQXdFO1lBQ3hFLFNBQVMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBcERELHVDQW9EQyJ9