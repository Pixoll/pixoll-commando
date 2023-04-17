import { Collection, LimitedCollection } from 'discord.js';
import CommandoGuild from '../extensions/guild';
import DatabaseManager from './DatabaseManager';
import { ActiveSchema, AfkSchema, AnySchema, DisabledSchema, JSONIfySchema, McIpSchema, ModerationSchema, ModuleSchema, PollSchema, PrefixSchema, ReactionRoleSchema, RuleSchema, SetupSchema, StickyRoleSchema, WelcomeSchema } from './Schemas';
/** A guilds' database manager (MongoDB) */
export default class GuildDatabaseManager {
    /** Guild for this database */
    readonly guild: CommandoGuild;
    active: DatabaseManager<ActiveSchema>;
    afk: DatabaseManager<AfkSchema>;
    disabled: DatabaseManager<DisabledSchema>;
    mcIps: DatabaseManager<McIpSchema>;
    moderations: DatabaseManager<ModerationSchema>;
    modules: DatabaseManager<ModuleSchema>;
    polls: DatabaseManager<PollSchema>;
    prefixes: DatabaseManager<PrefixSchema>;
    reactionRoles: DatabaseManager<ReactionRoleSchema>;
    rules: DatabaseManager<RuleSchema>;
    setup: DatabaseManager<SetupSchema>;
    stickyRoles: DatabaseManager<StickyRoleSchema>;
    welcome: DatabaseManager<WelcomeSchema>;
    /**
     * @param guild - The guild this database is for
     */
    constructor(guild: CommandoGuild);
    /**
     * Initializes the caching of this guild's data
     * @param data - The data to assign to the guild
     */
    protected init(data: Collection<string, LimitedCollection<string, JSONIfySchema<AnySchema>>>): this;
}
