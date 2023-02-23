import {
    Awaitable,
    ChannelType,
    Client,
    ClientOptions,
    Collection,
    Guild,
    InviteGenerationOptions,
    IntentsBitField,
    Message,
    PermissionsBitField,
    User,
    UserResolvable,
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
import { CommandoGuildManager, OverwrittenClientEvents } from './discord.overrides';
import Command, { CommandBlockData, CommandBlockReason, CommandInstances } from './commands/base';
import { ArgumentCollectorResult } from './commands/collector';
import ArgumentType from './types/base';
import CommandGroup from './commands/group';

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

export interface CommandoClientEvents extends OverwrittenClientEvents {
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

/** Discord.js Client with a command framework */
export default class CommandoClient<Ready extends boolean = boolean> extends Client<Ready> {
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
        const { prefix, commandEditableDuration, nonCommandEditable, inviteOptions, owners } = options;

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
        this.databaseSchemas = Schemas as unknown as SimplifiedSchemas;
        this._prefix = null;

        this.initDefaultListeners();

        // Fetch the owner(s)
        this.once('ready', () => owners?.forEach(owner => this.users.fetch(owner).catch(err => {
            this.emit('warn', `Unable to fetch owner ${owner}.`);
            this.emit('error', err);
        })));
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
     * Owners of the bot, set by the {@link CommandoClientOptions#owners} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @readonly
     */
    public get owners(): User[] | null {
        const { options, users } = this;
        const owners = options.owners && Array.from(options.owners);
        if (!owners) return null;
        return Util.filterNullishItems(owners.map(users.resolve));
    }

    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owners})
     * @param user - User to check for ownership
     */
    public isOwner(user: UserResolvable): boolean {
        const { users, options } = this;
        const { owners: owner } = options;

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
        this.on('guildCreate', guild => {
            const commandoGuild = this.parseGuild(guild);
            this.emit('commandoGuildCreate', commandoGuild);
        });

        // Set up message command handling
        const catchErr = (err: Error): void => {
            this.emit('error', err);
        };
        this.on('messageCreate', async message => {
            if (message.channel.type === ChannelType.GuildStageVoice) return;
            const commando = new CommandoMessage(this as CommandoClient<true>, message);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            if (newMessage.partial || newMessage.channel.type === ChannelType.GuildStageVoice) return;
            const newCommando = new CommandoMessage(this as CommandoClient<true>, newMessage);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(newCommando, oldMessage).catch(catchErr);
        });

        // Set up slash command handling
        this.once('ready', () =>
            // @ts-expect-error: registerSlashCommands is protected in CommandoRegistry
            this.registry.registerSlashCommands()
        );
        this.on('interactionCreate', interaction => {
            if (
                !interaction.isChatInputCommand() || interaction.channel?.type === ChannelType.GuildStageVoice
            ) return;
            try {
                const commando = new CommandoInteraction(this as CommandoClient<true>, interaction);
                // @ts-expect-error: handleSlash is protected in CommandDispatcher
                this.dispatcher.handleSlash(commando).catch(catchErr);
            } catch (error) {
                console.error(error);
            }
        });

        // Establishes MongoDB connection and loads all modules
        this.once('guildsReady', initializeDB);
    }

    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    protected parseGuilds(client: CommandoClient<true>): void {
        this.guilds.cache.forEach(guild => this.parseGuild(guild as Guild));
        this.emit('guildsReady', client);
    }

    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param guild - The Guild to parse
     */
    protected parseGuild(guild: Guild): CommandoGuild {
        const commandoGuild = new CommandoGuild(this, guild);
        return Util.mutateObjectInstance(guild, commandoGuild);
    }

    // @ts-expect-error: method type override
    declare public on<K extends keyof CommandoClientEvents>(
        event: K, listener: (this: this, ...args: CommandoClientEvents[K]) => unknown
    ): this;
    // @ts-expect-error: method type override
    declare public once<K extends keyof CommandoClientEvents>(
        event: K, listener: (this: this, ...args: CommandoClientEvents[K]) => unknown
    ): this;
    // @ts-expect-error: method type override
    declare public emit<K extends keyof CommandoClientEvents>(event: K, ...args: CommandoClientEvents[K]): boolean;
    // @ts-expect-error: method type override
    declare public off<K extends keyof CommandoClientEvents>(
        event: K, listener: (this: this, ...args: CommandoClientEvents[K]) => unknown
    ): this;
    // @ts-expect-error: method type override
    declare public removeAllListeners<K extends keyof CommandoClientEvents>(event?: K): this;
}
