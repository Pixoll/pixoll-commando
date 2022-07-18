import {
    Client, PermissionsBitField, Collection, ClientOptions, InviteGenerationOptions, CachedManager, Snowflake,
    GuildResolvable, GuildCreateOptions, FetchGuildOptions, FetchGuildsOptions, UserResolvable, Guild, User, ClientEvents,
    Message
} from 'discord.js';
import CommandoRegistry from './registry';
import CommandDispatcher from './dispatcher';
import CommandoMessage from './extensions/message';
import CommandoGuild from './extensions/guild';
import ClientDatabaseManager from './database/ClientDatabaseManager';
import databaseSchemas from './database/util/schemas';
import modulesLoader from './database/util/modules-loader';
import { ArgumentCollectorResult } from './commands/collector';
import Command, { CommandBlockData, CommandBlockReason, CommandInstances } from './commands/base';
import CommandGroup from './commands/group';
import ArgumentType from './types/base';
import GuildDatabaseManager from './database/GuildDatabaseManager';
import Util from './util';

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

declare class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, GuildResolvable> {
    public create(name: string, options?: GuildCreateOptions): Promise<CommandoGuild>;
    public fetch(options: FetchGuildOptions | Snowflake): Promise<CommandoGuild>;
    public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, CommandoGuild>>;
}

interface CommandoClientEvents extends ClientEvents {
    commandBlock: [instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData];
    commandCancel: [command: Command, reason: string, message: CommandoMessage, result?: ArgumentCollectorResult];
    commandError: [
        command: Command, error: Error, instances: CommandInstances, args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean, result?: ArgumentCollectorResult
    ];
    commandoGuildCreate: [guild: CommandoGuild];
    commandoMessageCreate: [message: CommandoMessage];
    commandoMessageUpdate: [oldMessage: Message, newMessage: CommandoMessage];
    commandPrefixChange: [guild?: CommandoGuild | null, prefix?: string | null];
    commandRegister: [command: Command, registry: CommandoRegistry];
    commandReregister: [newCommand: Command, oldCommand: Command];
    commandRun: [
        command: Command, promise: Promise<unknown>, instances: CommandInstances,
        args: Record<string, unknown> | string[] | string, fromPattern?: boolean, result?: ArgumentCollectorResult | null
    ];
    commandStatusChange: [guild: CommandoGuild | null, command: Command, enabled: boolean];
    commandUnregister: [command: Command];
    databaseReady: [client: CommandoClient]; // eslint-disable-line no-use-before-define
    groupRegister: [group: CommandGroup, registry: CommandoRegistry];
    groupStatusChange: [guild: CommandoGuild | null, group: CommandGroup, enabled: boolean];
    guildsReady: [client: CommandoClient]; // eslint-disable-line no-use-before-define
    modulesReady: [client: CommandoClient]; // eslint-disable-line no-use-before-define
    typeRegister: [type: ArgumentType, registry: CommandoRegistry];
    unknownCommand: [message: CommandoMessage];
}

/**
 * Discord.js Client with a command framework
 * @augments Client
 */
export default class CommandoClient extends Client {
    /** Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter */
    protected _prefix?: string | null;

    /** Invite for the bot */
    public botInvite: string | null;
    /** The client's database manager */
    public database: ClientDatabaseManager;
    /** The guilds' database manager, mapped by the guilds ids */
    public databases: Collection<string, GuildDatabaseManager>;
    /** Object containing all the schemas this client uses. */
    public databaseSchemas: typeof databaseSchemas;
    /** The client's command dispatcher */
    public dispatcher: CommandDispatcher;
    // @ts-expect-error: CommandoGuild is not assignable to Guild
    declare public guilds: CommandoGuildManager;
    /** Options for the client */
    declare public options: CommandoClientOptions;
    /** The client's command registry */
    public registry: CommandoRegistry;

    // @ts-expect-error: missing implementation
    public on<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void): this;
    // @ts-expect-error: missing implementation
    public once<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void): this;
    // @ts-expect-error: missing implementation
    public emit<K extends keyof CommandoClientEvents>(event: K, ...args: CommandoClientEvents[K]): boolean;

    /**
     * @param options - Options for the client
     */
    public constructor(options: CommandoClientOptions) {
        const { prefix, commandEditableDuration, nonCommandEditable, inviteOptions, owner } = options;

        if (typeof prefix === 'undefined') options.prefix = '!';
        if (prefix === null) options.prefix = '';
        if (typeof commandEditableDuration === 'undefined') options.commandEditableDuration = 30;
        if (typeof nonCommandEditable === 'undefined') options.nonCommandEditable = true;
        super(options);

        if (typeof inviteOptions === 'object') {
            const invitePerms = inviteOptions.permissions;
            inviteOptions.permissions = PermissionsBitField.resolve(invitePerms);
        }

        this.botInvite = typeof inviteOptions === 'string' ? inviteOptions : null;
        if (!this.botInvite && typeof inviteOptions === 'object') {
            this.once('ready', () => {
                this.botInvite = this.generateInvite(inviteOptions);
            });
        }

        this.registry = new CommandoRegistry(this);
        this.dispatcher = new CommandDispatcher(this, this.registry);
        this.database = new ClientDatabaseManager(this);
        this.databases = new Collection();
        this.databaseSchemas = databaseSchemas;
        this._prefix = null;

        // Parses all the guild instances
        this.once('ready', this.parseGuilds);
        this.on('guildCreate', this.parseGuild);

        // Set up message command handling
        const catchErr = (err: unknown): void => {
            this.emit('error', err as Error);
        };
        this.on('messageCreate', async message => {
            const commando = new CommandoMessage(this, message);
            this.emit('commandoMessageCreate', commando);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            const commando = new CommandoMessage(this, newMessage as Message);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando, oldMessage as Message).catch(catchErr);
        });

        // Set up slash command handling
        this.once('ready', async () => {
            // @ts-expect-error: registerSlashCommands is protected in CommandoRegistry
            await this.registry.registerSlashCommands();
        });
        this.on('interactionCreate', async interaction => {
            // @ts-expect-error: handleSlash is protected in CommandDispatcher
            await this.dispatcher.handleSlash(interaction).catch(catchErr);
        });

        // Fetch the owner(s)
        if (owner) {
            this.once('ready', () => {
                if (Array.isArray(owner) || owner instanceof Set) {
                    for (const user of owner) {
                        this.users.fetch(user).catch(err => {
                            this.emit('warn', `Unable to fetch owner ${user}.`);
                            this.emit('error', err);
                        });
                    }
                    return;
                }

                this.users.fetch(owner).catch(err => {
                    this.emit('warn', `Unable to fetch owner ${owner}.`);
                    this.emit('error', err);
                });
            });
        }

        // Establishes MongoDB connection and loads all modules
        this.once('guildsReady', async () =>
            await modulesLoader(this)
        );
    }

    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    public get prefix(): string | undefined {
        const { _prefix, options } = this;
        if (typeof _prefix === 'undefined' || _prefix === null) return options.prefix;
        return _prefix;
    }

    public set prefix(prefix) {
        this._prefix = prefix;
        this.emit('commandPrefixChange', null, prefix);
    }

    /**
     * Owners of the bot, set by the {@link CommandoClientOptions#owner} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @readonly
     */
    public get owners(): User[] | null {
        const { options, users } = this;
        const { cache } = users;
        const { owner } = options;

        if (!owner) return null;
        if (typeof owner === 'string') return [cache.get(owner)].filter(u => u) as User[];
        const owners = [];
        for (const user of owner) owners.push(cache.get(user));
        return owners.filter(u => u) as User[];
    }

    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
     * @param user - User to check for ownership
     */
    public isOwner(user: UserResolvable): boolean {
        const { users, options } = this;
        const { owner } = options;

        if (!owner) return false;
        const resolved = users.resolve(user);
        if (!resolved) throw new RangeError('Unable to resolve user.');
        const { id } = resolved;

        if (typeof owner === 'string') return id === owner;
        if (Array.isArray(owner)) return owner.includes(id);
        if (owner instanceof Set) return owner.has(id);
        throw new RangeError('The client\'s "owner" option is an unknown value.');
    }

    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    protected parseGuilds(): void {
        // @ts-expect-error: CommandoGuild is not assignable to Guild
        this.guilds.cache.forEach(guild => this.parseGuild(guild));
        this.emit('guildsReady', this);
    }

    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param guild - The Guild to parse
     */
    protected parseGuild(guild: Guild): void {
        const commandoGuild = new CommandoGuild(this, guild);
        const mutatedGuild = Util.mutateObjectInstance(guild, commandoGuild);
        this.emit('commandoGuildCreate', mutatedGuild);
    }
}
