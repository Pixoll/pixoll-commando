import {
    Client,
    PermissionsBitField,
    Collection,
    ClientOptions,
    InviteGenerationOptions,
    CachedManager,
    Snowflake,
    GuildResolvable,
    GuildCreateOptions,
    FetchGuildOptions,
    UserResolvable,
    Guild,
    User,
    OAuth2Guild,
    FetchGuildsOptions,
    InteractionType,
    IntentsBitField,
    Message,
} from 'discord.js';
import CommandoRegistry from './registry';
import CommandDispatcher from './dispatcher';
import CommandoMessage from './extensions/message';
import CommandoGuild from './extensions/guild';
import ClientDatabaseManager from './database/ClientDatabaseManager';
import Schemas, { SimplifiedSchemas } from './database/Schemas';
import GuildDatabaseManager from './database/GuildDatabaseManager';
import Util from './util';
import initializeDB from './database/initializeDB';
import CommandoInteraction from './extensions/interaction';
import { ArgumentCollectorResult } from './commands/collector';
import Command, { CommandBlockData, CommandBlockReason, CommandInstances } from './commands/base';
import CommandGroup from './commands/group';
import ArgumentType from './types/base';

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

export interface CommandoClientEvents {
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
        promise: Promise<unknown>,
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

declare module 'discord.js' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ClientEvents extends CommandoClientEvents { }
}

declare class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, CommandoGuild | GuildResolvable> {
    public create(options: GuildCreateOptions): Promise<CommandoGuild>;
    public fetch(options: FetchGuildOptions | Snowflake): Promise<CommandoGuild>;
    public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}

/**
 * Discord.js Client with a command framework
 * @augments Client
 */
export class CommandoClient<Ready extends boolean = boolean> extends Client<Ready> {
    /** Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter */
    protected _prefix?: string | null;

    /** Invite for the bot */
    public botInvite: string | null;
    /** The client's database manager */
    public database: ClientDatabaseManager;
    /** The guilds' database manager, mapped by the guilds ids */
    public databases: Collection<string, GuildDatabaseManager>;
    /** Object containing all the schemas this client uses. */
    public databaseSchemas: SimplifiedSchemas;
    /** The client's command dispatcher */
    public dispatcher: CommandDispatcher;
    declare public guilds: CommandoGuildManager;
    /** Options for the client */
    declare public options: Omit<CommandoClientOptions, 'intents'> & { intents: IntentsBitField };
    /** The client's command registry */
    public registry: CommandoRegistry;

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
        // @ts-expect-error: SimplifiedSchemas is meant to narrow and simplify methods for better understanding
        this.databaseSchemas = Schemas;
        this._prefix = null;

        this.initDefaultListeners();

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
    }

    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    public get prefix(): string | undefined {
        const { _prefix, options } = this;
        if (Util.isNullish(_prefix)) return options.prefix;
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
        const { owner } = options;

        if (!owner) return null;
        if (typeof owner === 'string') return Util.filterNullishItems([users.resolve(owner)]);
        const owners = [];
        for (const user of owner) owners.push(users.resolve(user));
        return Util.filterNullishItems(owners);
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

    /** Initializes all default listeners that make the client work. */
    protected initDefaultListeners(): void {
        // Parses all the guild instances
        this.once('ready', this.parseGuilds);
        this.on('guildCreate', this.parseGuild);

        // Set up message command handling
        const catchErr = (err: Error): void => {
            this.emit('error', err);
        };
        this.on('messageCreate', async message => {
            const commando = new CommandoMessage(this, message);
            this.emit('commandoMessageCreate', commando);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            if (oldMessage.partial || newMessage.partial) return;
            const commando = new CommandoMessage(this, newMessage);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando, oldMessage).catch(catchErr);
        });

        // Set up slash command handling
        this.once('ready', () =>
            // @ts-expect-error: registerSlashCommands is protected in CommandoRegistry
            this.registry.registerSlashCommands()
        );
        this.on('interactionCreate', interaction => {
            if (interaction.type !== InteractionType.ApplicationCommand) return;
            const commando = new CommandoInteraction(this, interaction);
            // @ts-expect-error: handleSlash is protected in CommandDispatcher
            this.dispatcher.handleSlash(commando).catch(catchErr);
        });

        // Establishes MongoDB connection and loads all modules
        this.once('guildsReady', initializeDB);
    }

    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    protected parseGuilds(): void {
        this.guilds.cache.forEach(guild => this.parseGuild(guild as Guild));
        this.emit('guildsReady', this as CommandoClient<true>);
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

export default CommandoClient;
