import { Client, Collection, ClientOptions, InviteGenerationOptions, CachedManager, Snowflake, GuildResolvable, GuildCreateOptions, FetchGuildOptions, UserResolvable, Guild, User, OAuth2Guild, FetchGuildsOptions, IntentsBitField, Message, ClientEvents, Awaitable } from 'discord.js';
import CommandoRegistry from './registry';
import CommandDispatcher from './dispatcher';
import CommandoMessage from './extensions/message';
import CommandoGuild from './extensions/guild';
import ClientDatabaseManager from './database/ClientDatabaseManager';
import { SimplifiedSchemas } from './database/Schemas';
import GuildDatabaseManager from './database/GuildDatabaseManager';
import { ArgumentCollectorResult } from './commands/collector';
import Command, { CommandBlockData, CommandBlockReason, CommandInstances } from './commands/base';
import CommandGroup from './commands/group';
import ArgumentType from './types/base';
export interface CommandoClientOptions extends ClientOptions {
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
    /** IDs of the bot owners' Discord user */
    owners?: Set<string> | string[];
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
export interface CommandoClientEvents extends ClientEvents {
    ready: [client: CommandoClient<true>];
    guildDelete: [guild: CommandoGuild];
    commandBlock: [instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData];
    commandCancel: [command: Command, reason: string, message: CommandoMessage, result?: ArgumentCollectorResult];
    commandError: [
        command: Command,
        error: Error,
        instances: CommandInstances,
        args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult
    ];
    commandoGuildCreate: [guild: CommandoGuild];
    commandoMessageCreate: [message: CommandoMessage];
    commandoMessageUpdate: [oldMessage: Message, newMessage: CommandoMessage];
    commandPrefixChange: [guild?: CommandoGuild | null, prefix?: string | null];
    commandRegister: [command: Command, registry: CommandoRegistry];
    commandReregister: [newCommand: Command, oldCommand: Command];
    commandRun: [
        command: Command,
        promise: Awaitable<Message | Message[] | null | void>,
        instances: CommandInstances,
        args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult | null
    ];
    commandStatusChange: [guild: CommandoGuild | null, command: Command, enabled: boolean];
    commandUnregister: [command: Command];
    databaseReady: [client: CommandoClient<true>];
    groupRegister: [group: CommandGroup, registry: CommandoRegistry];
    groupStatusChange: [guild: CommandoGuild | null, group: CommandGroup, enabled: boolean];
    guildsReady: [client: CommandoClient<true>];
    modulesReady: [client: CommandoClient<true>];
    typeRegister: [type: ArgumentType, registry: CommandoRegistry];
    unknownCommand: [message: CommandoMessage];
}
declare class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, CommandoGuild | GuildResolvable> {
    create(options: GuildCreateOptions): Promise<CommandoGuild>;
    fetch(options: FetchGuildOptions | Snowflake): Promise<CommandoGuild>;
    fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}
/** Discord.js Client with a command framework */
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
     * Owners of the bot, set by the {@link CommandoClientOptions#owners} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @readonly
     */
    get owners(): User[] | null;
    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owners})
     * @param user - User to check for ownership
     */
    isOwner(user: UserResolvable): boolean;
    /** Initializes all default listeners that make the client work. */
    protected initDefaultListeners(): void;
    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    protected parseGuilds(client: CommandoClient<true>): void;
    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param guild - The Guild to parse
     */
    protected parseGuild(guild: Guild): CommandoGuild;
    on<K extends keyof CommandoClientEvents>(event: K, listener: (this: this, ...args: CommandoClientEvents[K]) => unknown): this;
    once<K extends keyof CommandoClientEvents>(event: K, listener: (this: this, ...args: CommandoClientEvents[K]) => unknown): this;
    emit<K extends keyof CommandoClientEvents>(event: K, ...args: CommandoClientEvents[K]): boolean;
    off<K extends keyof CommandoClientEvents>(event: K, listener: (this: this, ...args: CommandoClientEvents[K]) => unknown): this;
    removeAllListeners<K extends keyof CommandoClientEvents>(event?: K): this;
}
export default CommandoClient;
