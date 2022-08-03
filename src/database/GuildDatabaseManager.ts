import { Collection, LimitedCollection } from 'discord.js';
import CommandoGuild from '../extensions/guild';
import DatabaseManager from './DatabaseManager';
import schemas, {
    ActiveSchema,
    AfkSchema,
    AnySchema,
    DisabledSchema,
    McIpSchema,
    ModerationSchema,
    ModuleSchema,
    PollSchema,
    PrefixSchema,
    ReactionRoleSchema,
    RuleSchema,
    SetupSchema,
    StickyRoleSchema,
    WelcomeSchema,
} from './Schemas';

type SchemaKey = Exclude<keyof GuildDatabaseManager, 'guild'>;

/** A guilds' database manager (MongoDB) */
export default class GuildDatabaseManager {
    /** Guild for this database */
    declare public readonly guild: CommandoGuild;

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

        this.active = new DatabaseManager(schemas.ActiveModel, guild);
        this.afk = new DatabaseManager(schemas.AfkModel, guild);
        this.disabled = new DatabaseManager(schemas.DisabledModel, guild);
        this.mcIps = new DatabaseManager(schemas.McIpsModel, guild);
        this.moderations = new DatabaseManager(schemas.ModerationsModel, guild);
        this.modules = new DatabaseManager(schemas.ModulesModel, guild);
        this.prefixes = new DatabaseManager(schemas.PrefixesModel, guild);
        this.polls = new DatabaseManager(schemas.PollsModel, guild);
        this.reactionRoles = new DatabaseManager(schemas.ReactionRolesModel, guild);
        this.rules = new DatabaseManager(schemas.RulesModel, guild);
        this.setup = new DatabaseManager(schemas.SetupModel, guild);
        this.stickyRoles = new DatabaseManager(schemas.StickyRolesModel, guild);
        this.welcome = new DatabaseManager(schemas.WelcomeModel, guild);
    }

    /**
     * Initializes the caching of this guild's data
     * @param data - The data to assign to the guild
     */
    protected init(data: Collection<string, LimitedCollection<string, AnySchema>>): this {
        for (const [name, schema] of data) {
            const dbManager = this[name as SchemaKey];
            if (!dbManager) continue;
            // @ts-expect-error: AnySchema not assignable to individual schema types
            dbManager.cache = schema;
        }
        return this;
    }
}
