import { Client, Collection, ClientOptions, InviteGenerationOptions, CachedManager, Snowflake, GuildResolvable, GuildCreateOptions, FetchGuildOptions, UserResolvable, Guild, User, OAuth2Guild, FetchGuildsOptions, IntentsBitField } from 'discord.js';
import CommandoRegistry from './registry';
import CommandDispatcher from './dispatcher';
import CommandoGuild from './extensions/guild';
import ClientDatabaseManager from './database/ClientDatabaseManager';
import { SimplifiedSchemas } from './database/Schemas';
import GuildDatabaseManager from './database/GuildDatabaseManager';
interface CommandoClientOptions extends ClientOptions {
    /**
     * Default command prefix
     * @default '!'
     */
    prefix?: string;
    /**
     * Time in seconds that command messages should be editable
     * @default 30
     */
    commandEditableDuration?: number;
    /**
     * Whether messages without commands can be edited to a command
     * @default true
     */
    nonCommandEditable?: boolean;
    /** ID of the bot owner's Discord user, or multiple ids */
    owner?: Set<string> | string[] | string;
    /** Invite URL to the bot's support server */
    serverInvite?: string;
    /** Invite options for the bot */
    inviteOptions?: InviteGenerationOptions | string;
    /** The test guild ID or the slash commands */
    testGuild?: string;
    /** The URI which will establish your connection with MongoDB */
    mongoDbURI?: string;
    /** The directory in which your modules are stored in */
    modulesDir?: string;
    /** The names of the modules to exclude */
    excludeModules?: string[];
}
declare class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, CommandoGuild | GuildResolvable> {
    create(options: GuildCreateOptions): Promise<CommandoGuild>;
    fetch(options: FetchGuildOptions | Snowflake): Promise<CommandoGuild>;
    fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}
/**
 * Discord.js Client with a command framework
 * @augments Client
 */
export declare class CommandoClient<Ready extends boolean = boolean> extends Client<Ready> {
    /** Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter */
    protected _prefix?: string | null;
    /** Invite for the bot */
    botInvite: string | null;
    /** The client's database manager */
    database: ClientDatabaseManager;
    /** The guilds' database manager, mapped by the guilds ids */
    databases: Collection<string, GuildDatabaseManager>;
    /** Object containing all the schemas this client uses. */
    databaseSchemas: SimplifiedSchemas;
    /** The client's command dispatcher */
    dispatcher: CommandDispatcher;
    guilds: CommandoGuildManager;
    /** Options for the client */
    options: Omit<CommandoClientOptions, 'intents'> & {
        intents: IntentsBitField;
    };
    /** The client's command registry */
    registry: CommandoRegistry;
    /**
     * @param options - Options for the client
     */
    constructor(options: CommandoClientOptions);
    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get prefix(): string | undefined;
    set prefix(prefix: string | undefined);
    /**
     * Owners of the bot, set by the {@link CommandoClientOptions#owner} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @readonly
     */
    get owners(): User[] | null;
    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
     * @param user - User to check for ownership
     */
    isOwner(user: UserResolvable): boolean;
    /** Initializes all default listeners that make the client work. */
    protected initDefaultListeners(): void;
    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    protected parseGuilds(): void;
    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param guild - The Guild to parse
     */
    protected parseGuild(guild: Guild): void;
}
export default CommandoClient;
