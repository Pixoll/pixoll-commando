import { Collection } from 'discord.js';
import CommandoGuild from '../extensions/guild';
import DatabaseManager from './DatabaseManager';
import * as schemas from './util/schemas';
import {
    ActiveSchema, AfkSchema, DisabledSchema, McIpSchema, ModerationSchema, ModuleSchema, PollSchema, PrefixSchema,
    ReactionRoleSchema, RuleSchema, SetupSchema, StickyRoleSchema, WelcomeSchema
} from './util/schemas';

interface DefaultDocument {
    _id: string;
    guild?: string;
}

/** A guilds' database manager (MongoDB) */
export default class GuildDatabaseManager {
    /** Guild for this database */
    public readonly guild!: CommandoGuild;

    public active: DatabaseManager<ActiveSchema>;
    public afk: DatabaseManager<AfkSchema>;
    public disabled: DatabaseManager<DisabledSchema>;
    public mcIps: DatabaseManager<McIpSchema>;
    public moderations: DatabaseManager<ModerationSchema>;
    public modules: DatabaseManager<ModuleSchema>;
    public polls: DatabaseManager<PollSchema>;
    public prefixes: DatabaseManager<PrefixSchema>;
    public reactionRoles: DatabaseManager<ReactionRoleSchema>;
    public rules: DatabaseManager<RuleSchema>;
    public setup: DatabaseManager<SetupSchema>;
    public stickyRoles: DatabaseManager<StickyRoleSchema>;
    public welcome: DatabaseManager<WelcomeSchema>;

    /**
     * @param guild - The guild this database is for
     */
    public constructor(guild: CommandoGuild) {
        Object.defineProperty(this, 'guild', { value: guild });

        this.active = new DatabaseManager(schemas.active, guild);
        this.afk = new DatabaseManager(schemas.afk, guild);
        this.disabled = new DatabaseManager(schemas.disabled, guild);
        this.mcIps = new DatabaseManager(schemas.mcIp, guild);
        this.moderations = new DatabaseManager(schemas.moderations, guild);
        this.modules = new DatabaseManager(schemas.modules, guild);
        this.prefixes = new DatabaseManager(schemas.prefixes, guild);
        this.polls = new DatabaseManager(schemas.polls, guild);
        this.reactionRoles = new DatabaseManager(schemas.reactionRoles, guild);
        this.rules = new DatabaseManager(schemas.rules, guild);
        this.setup = new DatabaseManager(schemas.setup, guild);
        this.stickyRoles = new DatabaseManager(schemas.stickyRoles, guild);
        this.welcome = new DatabaseManager(schemas.welcome, guild);
    }

    /**
     * Initializes the caching of this guild's data
     * @param data - The data to assign to the guild
     */
    protected init(data: Collection<string, Collection<string, DefaultDocument>>): this {
        for (const [name, schema] of data) {
            // @ts-expect-error: no string index
            const dbManager = this[name] as DatabaseManager<DefaultDocument>;
            if (!dbManager) continue;
            dbManager.cache = schema;
        }
        return this;
    }
}
