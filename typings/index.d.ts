import {
    AutoModerationActionExecution,
    AutoModerationRule,
    AutocompleteInteraction,
    Awaitable,
    ButtonInteraction,
    CacheType,
    CacheTypeReducer,
    CachedManager,
    CategoryChannel,
    ChannelSelectMenuInteraction,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    ClientOptions,
    Collection,
    CommandInteractionOption,
    DMChannel,
    EmbedBuilder,
    FetchGuildOptions,
    FetchGuildsOptions,
    ForumChannel,
    Guild,
    GuildBan,
    GuildCreateOptions,
    GuildEmoji,
    GuildMember,
    GuildResolvable,
    GuildScheduledEvent,
    GuildScheduledEventStatus,
    GuildTextBasedChannel,
    If,
    Invite,
    InviteGenerationOptions,
    LimitedCollection,
    MentionableSelectMenuInteraction,
    Message,
    MessageContextMenuCommandInteraction,
    MessageCreateOptions,
    MessageReaction,
    MessageReplyOptions,
    ModalMessageModalSubmitInteraction,
    ModalSubmitInteraction,
    NewsChannel,
    OAuth2Guild,
    PartialGroupDMChannel,
    PartialMessage,
    Partialize,
    PermissionsString,
    Presence,
    PrivateThreadChannel,
    PublicThreadChannel,
    RESTPostAPIChatInputApplicationCommandsJSONBody as RESTPostAPISlashCommand,
    Role,
    RoleSelectMenuInteraction,
    Snowflake,
    StageChannel,
    StageInstance,
    Sticker,
    StringSelectMenuInteraction,
    TextBasedChannel,
    TextChannel,
    TextChannelType,
    ThreadChannel,
    ThreadMember,
    Typing,
    User,
    UserContextMenuCommandInteraction,
    UserResolvable,
    UserSelectMenuInteraction,
    VoiceChannel,
    VoiceState,
} from 'discord.js';
import { FilterQuery, Model, Types, UpdateAggregationStage, UpdateQuery, UpdateWriteOpResult } from 'mongoose';

//#region Classes

/** A fancy argument */
export class Argument {
    /**
     * @param client - Client the argument is for
     * @param info - Information for the command argument
     */
    protected constructor(client: CommandoClient, info: ArgumentInfo);

    /**
     * Validator function for validating a value for the argument
     * @see ArgumentType#validate
     */
    protected validator: ArgumentInfo['validate'] | null;
    /**
     * Parser function for parsing a value for the argument
     * @see ArgumentType#parse
     */
    protected parser: ArgumentInfo['parse'] | null;
    /**
     * Function to check whether a raw value is considered empty
     * @see ArgumentType#isEmpty
     */
    protected emptyChecker: ArgumentInfo['isEmpty'] | null;
    /**
     * Prompts the user and obtains multiple values for the argument
     * @param msg - Message that triggered the command
     * @param vals - Pre-provided values for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    protected obtainInfinite(msg: CommandoMessage, vals?: string[], promptLimit?: number): Promise<ArgumentResult>;
    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    protected static validateInfo(client: CommandoClient, info: ArgumentInfo): void;
    /**
     * Gets the argument type to use from an ID
     * @param client - Client to use the registry of
     * @param id - ID of the type to use
     */
    protected static determineType(client: CommandoClient, id?: string[] | string): ArgumentType | null;

    /** Key for the argument */
    key: string;
    /** Label for the argument */
    label: string;
    /** Question prompt for the argument */
    prompt: string;
    /**
     * Error message for when a value is invalid
     * @see ArgumentType#validate
     */
    error: string | null;
    /** Type of the argument */
    type: ArgumentType | null;
    /**
     * - If type is `integer` or `float`, this is the maximum value of the number.
     * - If type is `string`, this is the maximum length of the string.
     * - If type is `duration`, this is the maximum duration.
     */
    max: number | null;
    /**
     * - If type is `integer` or `float`, this is the minimum value of the number.
     * - If type is `string`, this is the minimum length of the string.
     * - If type is `duration`, this is the minimum duration.
     */
    min: number | null;
    /** The default value for the argument */
    default: ArgumentDefault | null;
    /** Whether the argument is required or not */
    required: boolean;
    /** Whether the default argument's validation is skipped or not */
    skipExtraDateValidation: boolean;
    /**
     * Values the user can choose from.
     * - If type is `string`, this will be case-insensitive.
     * - If type is `channel`, `member`, `role`, or `user`, this will be the IDs.
     */
    oneOf: Array<number | string> | null;
    /** Whether the argument accepts an infinite number of values */
    infinite: boolean;
    /** How long to wait for input (in seconds) */
    wait: number;

    /**
     * Prompts the user and obtains the value for the argument
     * @param msg - Message that triggered the command
     * @param val - Pre-provided value for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    obtain(msg: CommandoMessage, val: string, promptLimit?: number): Promise<ArgumentResult>;
    /**
     * Checks if a value is valid for the argument
     * @param val - Value to check
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    validate(val: string, originalMsg: CommandoMessage, currentMsg?: CommandoMessage):
        Promise<boolean | string> | boolean | string;
    /**
     * Parses a value string into a proper value for the argument
     * @param val - Value to parse
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    parse(val: string, originalMsg: CommandoMessage, currentMsg?: CommandoMessage): unknown;
    /**
     * Checks whether a value for the argument is considered to be empty
     * @param val - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    isEmpty(val: string[] | string, originalMsg: CommandoMessage, currentMsg?: CommandoMessage): boolean;
}

/** Obtains, validates, and prompts for argument values */
export class ArgumentCollector {
    /**
     * @param client - Client the collector will use
     * @param args - Arguments for the collector
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    constructor(client: CommandoClient, args: ArgumentInfo[], promptLimit?: number);

    /** Client this collector is for */
    readonly client: CommandoClient;
    /** Arguments the collector handles */
    args: Argument[];
    /** Maximum number of times to prompt for a single argument */
    promptLimit: number;

    /**
     * Obtains values for the arguments, prompting if necessary.
     * @param msg - Message that the collector is being triggered by
     * @param provided - Values that are already available
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    obtain(msg: CommandoMessage, provided?: unknown[], promptLimit?: number): Promise<ArgumentCollectorResult>;
}

/** A type for command arguments */
export abstract class ArgumentType {
    /**
     * @param client - The client the argument type is for
     * @param id - The argument type ID (this is what you specify in {@link ArgumentInfo#type})
     */
    constructor(client: CommandoClient, id: string);

    /** Client that this argument type is for */
    readonly client: CommandoClient;
    /** ID of this argument type (this is what you specify in {@link ArgumentInfo#type}) */
    id: string;

    /**
     * Validates a value string against the type
     * @param val - Value to validate
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Whether the value is valid, or an error message
     */
    validate(val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage):
        Promise<boolean | string> | boolean | string;
    /**
     * Parses the raw value string into a usable value
     * @param val - Value to parse
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Usable value
     */
    parse(val: string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage): unknown;
    /**
     * Checks whether a value is considered to be empty. This determines whether the default value for an argument
     * should be used and changes the response to the user under certain circumstances.
     * @param val - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param arg - Argument the value was obtained from
     * @param currentMsg - Current response message
     * @return Whether the value is empty
     */
    isEmpty(val: string[] | string, originalMsg: CommandoMessage, arg: Argument, currentMsg?: CommandoMessage): boolean;
}

/** A type for command arguments that handles multiple other types */
export class ArgumentUnionType extends ArgumentType {
    constructor(client: CommandoClient, id: string);

    /** Types to handle, in order of priority */
    types: ArgumentType[];

    validate(val: string, msg: CommandoMessage, arg: Argument): Promise<boolean | string>;
    parse(val: string, msg: CommandoMessage, arg: Argument): Promise<unknown>;
    isEmpty(val: string, msg: CommandoMessage, arg: Argument): boolean;
}

/** A command that can be run in a client */
export abstract class Command<InGuild extends boolean = boolean> {
    /**
     * @param client - The client the command is for
     * @param info - The command information
     * @param slashInfo - The slash command information
     */
    constructor(client: CommandoClient, info: CommandInfo<InGuild>, slashInfo?: SlashCommandInfo);

    /** Whether the command is enabled globally */
    protected _globalEnabled: boolean;
    /** Current throttle objects for the command, mapped by user ID */
    protected _throttles: Map<string, Throttle>;

    /**
     * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
     * @param userId - ID of the user to throttle for
     */
    protected throttle(userId: string): Throttle | null;
    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    protected static validateInfo(client: CommandoClient, info: CommandInfo): void;
    /**
     * Validates the slash command information
     * @param info - Info to validate
     * @param slashInfo - Slash info to validate
     */
    protected static validateAndParseSlashInfo(info: CommandInfo, slashInfo?: SlashCommandInfo): APISlashCommand | null;

    /** Client that this command is for */
    readonly client: CommandoClient;
    /** Name of this command */
    name: string;
    /** Aliases for this command */
    aliases: string[];
    /** ID of the group the command belongs to */
    groupId: string;
    /** The group the command belongs to, assigned upon registration */
    group: CommandGroup;
    /** Name of the command within the group */
    memberName: string;
    /** Short description of the command */
    description: string;
    /** Usage format string of the command */
    format: string | null;
    /** Long description of the command */
    details: string | null;
    /** Example usage strings */
    examples: string[] | null;
    /** Whether the command can only be run in direct messages */
    dmOnly: boolean;
    /** Whether the command can only be run in a guild channel */
    guildOnly: InGuild;
    /** Whether the command can only be used by a server owner */
    guildOwnerOnly: boolean;
    /** Whether the command can only be used by an owner */
    ownerOnly: boolean;
    /** Permissions required by the client to use the command. */
    clientPermissions: PermissionsString[] | null;
    /** Permissions required by the user to use the command. */
    userPermissions: PermissionsString[] | null;
    /** Whether this command's user permissions are based on "moderator" permissions */
    modPermissions: boolean;
    /** Whether the command can only be used in NSFW channels */
    nsfw: boolean;
    /** Whether the default command handling is enabled for the command */
    defaultHandling: boolean;
    /** Options for throttling command usages */
    throttling: ThrottlingOptions | null;
    /** The argument collector for the command */
    argsCollector: ArgumentCollector | null;
    /** How the arguments are split when passed to the command's run method */
    argsType: 'multiple' | 'single';
    /** Maximum number of arguments that will be split */
    argsCount: number;
    /** Whether single quotes are allowed to encapsulate an argument */
    argsSingleQuotes: boolean;
    /** Regular expression triggers */
    patterns: RegExp[] | null;
    /** Whether the command is protected from being disabled */
    guarded: boolean;
    /** Whether the command should be hidden from the help command */
    hidden: boolean;
    /** Whether the command will be run when an unknown command is used */
    unknown: boolean;
    /** Whether the command is marked as deprecated */
    deprecated: boolean;
    /** The name or alias of the command that is replacing the deprecated command. Required if `deprecated` is `true`. */
    deprecatedReplacement: string | null;
    /** Whether this command will be registered in the test guild only or not */
    testEnv: boolean;
    /** The data for the slash command */
    slashInfo?: APISlashCommand | null;

    /**
     * Runs the command
     * @param instances - The message the command is being run for
     * @param args - The arguments for the command, or the matches from a pattern.
     * If args is specified on the command, this will be the argument values object. If argsType is single, then only
     * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
     * matches array from the pattern match
     * (see [RegExp#exec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)).
     * @param fromPattern - Whether or not the command is being run from a pattern match
     * @param result - Result from obtaining the arguments from the collector (if applicable)
     */
    abstract run(
        instances: CommandInstances<InGuild>,
        args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult | null
    ): Awaitable<Message | Message[] | null | void>;
    /**
     * Checks whether the user has permission to use the command
     * @param instances - The triggering command instances
     * @param ownerOverride - Whether the bot owner(s) will always have permission
     * @return Whether the user has permission, or an error message to respond with if they don't
     */
    hasPermission(
        instances: CommandInstances<InGuild>, ownerOverride?: boolean
    ): CommandBlockReason | PermissionsString[] | true;
    /**
     * Called when the command is prevented from running
     * @param instances - The instances the command is being run for
     * @param reason - Reason that the command was blocked
     * @param data - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Throttle}), `remaining` (number) time in seconds
     * - userPermissions & clientPermissions: `missing` (Array<string>) permission names
     */
    onBlock(instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData): Promise<Message | null>;
    /**
     * Called when the command produces an error while running
     * @param err - Error that was thrown
     * @param instances - The instances the command is being run for
     * @param args - Arguments for the command (see {@link Command#run})
     * @param fromPattern - Whether the args are pattern matches (see {@link Command#run})
     * @param result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command#run})
     */
    onError(
        err: Error,
        instances: CommandInstances,
        args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult | null
    ): Promise<Message | Message[] | null>;
    /**
     * Enables or disables the command in a guild
     * @param guild - Guild to enable/disable the command in
     * @param enabled - Whether the command should be enabled or disabled
     */
    setEnabledIn(guild: CommandoGuildResolvable | null, enabled: boolean): void;
    /**
     * Checks if the command is enabled in a guild
     * @param guild - Guild to check in
     * @param bypassGroup - Whether to bypass checking the group's status
     */
    isEnabledIn(guild: CommandoGuildResolvable | null, bypassGroup?: boolean): boolean;
    /**
     * Checks if the command is usable for a message
     * @param instances - The instances
     */
    isUsable(instances?: CommandInstances<InGuild>): boolean;
    /**
     * Creates a usage string for the command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    usage(argString?: string, prefix?: string | null | undefined, user?: User | null): string;
    /** Reloads the command */
    reload(): void;
    /** Unloads the command */
    unload(): void;
    /**
     * Creates a usage string for a command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    static usage(command: string, prefix?: string | null, user?: User | null): string;
}

/** Handles parsing messages and running commands from them */
export class CommandDispatcher {
    /**
     * @param client - Client the dispatcher is for
     * @param registry - Registry the dispatcher will use
     */
    constructor(client: CommandoClient, registry: CommandoRegistry);

    /** Map of {@link RegExp}s that match command messages, mapped by string prefix */
    protected _commandPatterns: Map<string | undefined, RegExp>;
    /** Old command message results, mapped by original message ID */
    protected _results: Map<string, CommandoMessage>;
    /** Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a channel */
    protected _awaiting: Set<string>;

    /**
     * Handle a new message or a message update
     * @param message - The message to handle
     * @param oldMessage - The old message before the update
     */
    protected handleMessage(message: CommandoMessage, oldMessage?: Message): Promise<void>;
    /**
     * Handle a new slash command interaction
     * @param interaction - The interaction to handle
     */
    protected handleSlash(interaction: CommandoInteraction): Promise<void>;
    /**
     * Check whether a message should be handled
     * @param message - The message to handle
     * @param oldMessage - The old message before the update
     */
    protected shouldHandleMessage(message: CommandoMessage, oldMessage?: Message): boolean;
    /**
     * Check whether an interaction should be handled
     * @param interaction - The interaction to handle
     */
    protected shouldHandleSlash(interaction: CommandoInteraction): boolean;
    /**
     * Inhibits a command message
     * @param message - Command message to inhibit
     */
    protected inhibit(message: CommandoMessage): Inhibition | null;
    /**
     * Caches a command message to be editable
     * @param message - Triggering message
     * @param oldMessage - Triggering message's old version
     * @param cmdMsg - Command message to cache
     * @param responses - Responses to the message
     */
    protected cacheCommandoMessage(
        message: CommandoMessage,
        oldMessage: Message | undefined,
        cmdMsg: CommandoMessage | null,
        responses: CommandoMessageResponse
    ): void;
    /**
     * Parses a message to find details about command usage in it
     * @param message - The message
     */
    protected parseMessage(message: CommandoMessage): CommandoMessage | null;
    /**
     * Matches a message against a guild command pattern
     * @param message - The message
     * @param pattern - The pattern to match against
     * @param commandNameIndex - The index of the command name in the pattern matches
     * @param prefixless - Whether the match is happening for a prefixless usage
     */
    protected matchDefault(message: CommandoMessage, pattern: RegExp, commandNameIndex?: number, prefixless?: boolean):
        CommandoMessage | null;
    /**
     * Creates a regular expression to match the command prefix and name in a message
     * @param prefix - Prefix to build the pattern for
     */
    protected buildCommandPattern(prefix?: string): RegExp;

    /** Client this dispatcher handles messages for */
    readonly client: CommandoClient;
    /** Registry this dispatcher uses */
    registry: CommandoRegistry;
    /** Functions that can block commands from running */
    inhibitors: Set<Inhibitor>;

    /**
     * Adds an inhibitor
     * @param inhibitor - The inhibitor function to add
     * @return Whether the addition was successful
     * @example
     * client.dispatcher.addInhibitor(msg => {
     *     if (blacklistedUsers.has(msg.author.id)) return 'blacklisted';
     * });
     * @example
     * client.dispatcher.addInhibitor(msg => {
     *     if (!coolUsers.has(msg.author.id)) return { reason: 'cool', response: msg.reply('You\'re not cool enough!') };
     * });
     */
    addInhibitor(inhibitor: Inhibitor): boolean;
    /**
     * Removes an inhibitor
     * @param inhibitor - The inhibitor function to remove
     * @return Whether the removal was successful
     */
    removeInhibitor(inhibitor: Inhibitor): boolean;
}

/** Has a descriptive message for a command not having proper format */
export class CommandFormatError extends FriendlyError {
    /**
     * @param msg - The command message the error is for
     */
    constructor(msg: CommandoMessage);
}

/** A group for commands. Whodathunkit? */
export class CommandGroup {
    /**
     * @param client - The client the group is for
     * @param id - The ID for the group
     * @param name - The name of the group
     * @param guarded - Whether the group should be protected from disabling
     */
    constructor(client: CommandoClient, id: string, name?: string, guarded?: boolean);

    /** Whether the group is enabled globally */
    protected _globalEnabled: boolean;

    /** Client that this group is for */
    readonly client: CommandoClient;
    /** ID of this group */
    id: string;
    /** Name of this group */
    name: string;
    /** The commands in this group (added upon their registration) */
    commands: Collection<string, Command>;
    /** Whether or not this group is protected from being disabled */
    guarded: boolean;

    /**
     * Enables or disables the group in a guild
     * @param guild - Guild to enable/disable the group in
     * @param enabled - Whether the group should be enabled or disabled
     */
    setEnabledIn(guild: CommandoGuildResolvable | null, enabled: boolean): void;
    /**
     * Checks if the group is enabled in a guild
     * @param guild - Guild to check in
     * @return Whether or not the group is enabled
     */
    isEnabledIn(guild: CommandoGuildResolvable | null): boolean;
    /** Reloads all of the group's commands */
    reload(): void;
}

/** Discord.js Client with a command framework */
export class CommandoClient<Ready extends boolean = boolean> extends Client<Ready> {
    /**
     * @param options - Options for the client
     */
    constructor(options: CommandoClientOptions);

    /** Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter */
    protected _prefix?: string | null;

    /** Initializes all default listeners that make the client work. */
    protected initDefaultListeners(): void;
    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    protected parseGuilds(client: CommandoClient<true>): void;
    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param guild - The {@link Guild} to parse
     */
    protected parseGuild(guild: Guild): CommandoGuild;

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
    options: CommandoClientOptions;
    /**
     * Owners of the bot, set by the {@link CommandoClientOptions#owners} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     */
    get owners(): User[] | null;
    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     */
    prefix: string | undefined;
    /** The client's command registry */
    registry: CommandoRegistry;

    isReady(): this is CommandoClient<true>;
    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owners})
     * @param user - User to check for ownership
     */
    isOwner(user: UserResolvable): boolean;

    on<K extends keyof CommandoClientEvents>(
        event: K, listener: (...args: CommandoClientEvents[K]) => unknown
    ): this;
    once<K extends keyof CommandoClientEvents>(
        event: K, listener: (...args: CommandoClientEvents[K]) => unknown
    ): this;
    emit<K extends keyof CommandoClientEvents>(event: K, ...args: CommandoClientEvents[K]): boolean;
    off<K extends keyof CommandoClientEvents>(
        event: K, listener: (...args: CommandoClientEvents[K]) => unknown
    ): this;
    removeAllListeners<K extends keyof CommandoClientEvents>(event?: K): this;
}

/** A fancier Guild for fancier people. */
export class CommandoGuild extends Guild {
    /**
     * @param client - The client the guild is for
     * @param data - The guild data
     */
    constructor(client: CommandoClient<true>, data: Guild);

    /** Internal command prefix for the guild, controlled by the {@link CommandoGuild#prefix} getter/setter */
    protected _prefix?: string | null;
    /** Internal map object of internal command statuses, mapped by command name */
    protected _commandsEnabled: Map<string, boolean>;
    /** Internal map object of internal group statuses, mapped by group ID */
    protected _groupsEnabled: Map<string, boolean>;

    /** The client the guild is for */
    readonly client: CommandoClient<true>;
    /** The database manager for the guild */
    database: GuildDatabaseManager;
    /**
     * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
     * Setting to `null` means that the prefix from {@link CommandoClient#prefix} will be used instead.
     */
    prefix: string | undefined;
    /** The queued logs for this guild */
    queuedLogs: EmbedBuilder[];

    /**
     * Sets whether a command is enabled in the guild
     * @param command - Command to set status of
     * @param enabled - Whether the command should be enabled
     */
    setCommandEnabled(command: CommandResolvable, enabled: boolean): void;
    /**
     * Checks whether a command is enabled in the guild (does not take the command's group status into account)
     * @param command - Command to check status of
     */
    isCommandEnabled(command: CommandResolvable): boolean;
    /**
     * Sets whether a command group is enabled in the guild
     * @param group - Group to set status of
     * @param enabled - Whether the group should be enabled
     */
    setGroupEnabled(group: CommandGroupResolvable, enabled: boolean): void;
    /**
     * Checks whether a command group is enabled in the guild
     * @param group - Group to check status of
     */
    isGroupEnabled(group: CommandGroupResolvable): boolean;
    /**
     * Creates a command usage string using the guild's prefix
     * @param command - A command + arg string
     * @param user - User to use for the mention command format
     */
    commandUsage(command: string, user?: User | null): string;
}

/** An extension of the base Discord.js ChatInputCommandInteraction class to add command-related functionality. */
export class CommandoInteraction<InGuild extends boolean = boolean> extends ChatInputCommandInteraction {
    /**
     * @param client - The client the interaction is for
     * @param data - The interaction data
     */
    constructor(client: CommandoClient<true>, data: ChatInputCommandInteraction);

    /** Command that the interaction triggers */
    protected _command: Command<InGuild>;

    get author(): User;
    /** The channel this interaction was used in */
    get channel(): Exclude<If<InGuild, GuildTextBasedChannel, TextBasedChannel>, StageChannel>;
    /** The client the interaction is for */
    readonly client: CommandoClient<true>;
    /** Command that the interaction triggers */
    get command(): Command<InGuild>;
    /** The guild this interaction was used in */
    get guild(): If<InGuild, CommandoGuild>;
    member: CommandoGuildMember | null;

    /**
     * Parses the options data into usable arguments
     * @see Command#run
     */
    parseArgs(options: CommandInteractionOption[]): Record<string, unknown>;
    /** Runs the command */
    run(): Promise<void>;
}

/** An extension of the base Discord.js Message class to add command-related functionality. */
export class CommandoMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
    /**
     * @param client - The client the message is for
     * @param data - The message data
     */
    constructor(client: CommandoClient<true>, data: CommandoifiedMessage);

    /**
     * Initializes the message for a command
     * @param command - Command the message triggers
     * @param argString - Argument string for the command
     * @param patternMatches - Command pattern matches (if from a pattern trigger)
     * @return This message
     */
    protected initCommand(command: Command | null, argString: string | null, patternMatches: string[] | null): this;
    /**
     * Responds to the command message
     * @param options - Options for the response
     */
    protected respond(options?: ResponseOptions): Promise<CommandoMessageResponse>;
    /**
     * Edits a response to the command message
     * @param response - The response message(s) to edit
     * @param options - Options for the response
     */
    protected editResponse(response?: CommandoMessageResponse, options?: ResponseOptions):
        Promise<CommandoMessageResponse>;
    /**
     * Edits the current response
     * @param id - The ID of the channel the response is in ("DM" for direct messages)
     * @param options - Options for the response
     */
    protected editCurrentResponse(id: string, options?: ResponseOptions): Promise<CommandoMessageResponse>;
    /**
     * Finalizes the command message by setting the responses and deleting any remaining prior ones
     * @param responses - Responses to the message
     */
    protected finalize(responses?: CommandoMessageResponse | CommandoMessageResponse[] | null): void;
    /** Deletes any prior responses that haven't been updated */
    protected deleteRemainingResponses(): void;

    /** The client the message is for */
    readonly client: CommandoClient<true>;
    get member(): CommandoGuildMember | null;
    /** The guild this message was sent in */
    get guild(): If<InGuild, CommandoGuild>;
    /** The channel this message was sent in */
    get channel(): Exclude<If<InGuild, GuildTextBasedChannel, TextBasedChannel>, StageChannel>;
    /** Whether the message contains a command (even an unknown one) */
    isCommand: boolean;
    /** Command that the message triggers, if any */
    command: Command | null;
    /** Argument string for the command */
    argString: string | null;
    /** Pattern matches (if from a pattern trigger) */
    patternMatches: string[] | null;
    /** Response messages sent, mapped by channel ID (set by the dispatcher after running the command) */
    responses: Map<string, CommandoMessageResponse[]>;
    /** Index of the current response that will be edited, mapped by channel ID */
    responsePositions: Map<string, number>;

    inGuild(): this is CommandoMessage<true>;
    /**
     * Creates a usage string for the message's command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the
     * prefixed command format
     * @param user - User to use for the mention command format
     */
    usage(argString?: string, prefix?: string | null, user?: User | null): string;
    /**
     * Creates a usage string for any command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the
     * prefixed command format
     * @param user - User to use for the mention command format
     */
    anyUsage(command: string, prefix?: string | null, user?: User | null): string;
    /**
     * Parses the argString into usable arguments, based on the argsType and argsCount of the command
     * @see Command#run
     */
    parseArgs(): string[] | string;
    /** Runs the command */
    run(): Promise<CommandoMessageResponse>;
    /**
     * Responds with a plain message
     * @param content - Content for the message
     * @param options - Options for the message
     */
    say(content: StringResolvable, options?: MessageCreateOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with a direct message
     * @param content - Content for the message
     * @param options - Options for the message
     */
    direct(content: StringResolvable, options?: MessageCreateOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with a code message
     * @param lang - Language for the code block
     * @param content - Content for the message
     * @param options - Options for the message
     */
    code(lang: string, content: StringResolvable, options?: MessageCreateOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with an embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    embed(embed: EmbedBuilder | EmbedBuilder[], content?: StringResolvable, options?: MessageCreateOptions):
        Promise<CommandoMessageResponse>;
    /**
     * Responds with a reply + embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    replyEmbed(embed: EmbedBuilder | EmbedBuilder[], content?: StringResolvable, options?: MessageReplyOptions):
        Promise<CommandoMessageResponse>;
    /**
     * Parses an argument string into an array of arguments
     * @param argString - The argument string to parse
     * @param argCount - The number of arguments to extract from the string
     * @param allowSingleQuote - Whether or not single quotes should be allowed to wrap arguments, in addition to
     * double quotes
     * @return The array of arguments
     */
    static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[];
}

/** Handles registration and searching of commands and groups */
export class CommandoRegistry {
    /**
     * @param client - Client to use
     */
    constructor(client: CommandoClient);

    /** Registers every client and guild slash command available - this may only be called upon startup. */
    protected registerSlashCommands(): Promise<void>;

    /** The client this registry is for */
    readonly client: CommandoClient;
    /** Registered commands, mapped by their name */
    commands: Collection<string, Command>;
    /** Registered command groups, mapped by their ID */
    groups: Collection<string, CommandGroup>;
    /** Registered argument types, mapped by their ID */
    types: Collection<string, ArgumentType>;
    /** Fully resolved path to the bot's commands directory */
    commandsPath: string | null;
    /** Command to run when an unknown command is used */
    unknownCommand: Command | null;

    /**
     * Registers a single group
     * @param group - A CommandGroup instance
     * or the constructor parameters (with ID, name, and guarded properties)
     * @see CommandoRegistry#registerGroups
     */
    registerGroup(group: CommandGroup | {
        id: string;
        name?: string;
        guarded?: boolean;
    }): this;
    /**
     * Registers multiple groups
     * @param groups - An array of CommandGroup instances or the constructors parameters (with ID, name, and guarded
     * properties).
     * @example
     * registry.registerGroups([
     *     { id: 'fun', name: 'Fun' },
     *     { id: 'mod', name: 'Moderation' }
     * ]);
     */
    registerGroups(groups: Array<CommandGroup | {
        id: string;
        name?: string;
        guarded?: boolean;
    }>): this;
    /**
     * Registers a single command
     * @param command - Either a Command instance, or a constructor for one
     * @see CommandoRegistry#registerCommands
     */
    registerCommand(command: Command): this;
    /**
     * Registers multiple commands
     * @param commands - An array of Command instances or constructors
     * @param ignoreInvalid - Whether to skip over invalid objects without throwing an error
     */
    registerCommands(commands: Command[], ignoreInvalid?: boolean): this;
    /**
     * Registers all commands in a directory. The files must export a Command class constructor or instance.
     * @param options - The path to the directory, or a require-all options object
     * @example
     * const path = require('path');
     * registry.registerCommandsIn(path.join(__dirname, 'commands'));
     */
    registerCommandsIn(options: RequireAllOptions | string): this;
    /**
     * Registers a single argument type
     * @param type - Either an ArgumentType instance, or a constructor for one
     * @see CommandoRegistry#registerTypes
     */
    registerType(type: ArgumentType): this;
    /**
     * Registers multiple argument types
     * @param types - An array of ArgumentType instances or constructors
     * @param ignoreInvalid - Whether to skip over invalid objects without throwing an error
     */
    registerTypes(types: ArgumentType[], ignoreInvalid?: boolean): this;
    /**
     * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
     * @param options - The path to the directory, or a require-all options object
     */
    registerTypesIn(options: RequireAllOptions | string): this;
    /**
     * Registers the default argument types to the registry
     * @param types - Object specifying which types to register
     */
    registerDefaultTypes(types?: DefaultTypesOptions): this;
    /**
     * Reregisters a command (does not support changing name, group, or memberName)
     * @param command - New command
     * @param oldCommand - Old command
     */
    reregisterCommand(command: Command, oldCommand: Command): void;
    /**
     * Unregisters a command
     * @param command - Command to unregister
     */
    unregisterCommand(command: Command): void;
    /**
     * Finds all groups that match the search string
     * @param searchString - The string to search for
     * @param exact - Whether the search should be exact
     * @return All groups that are found
     */
    findGroups(searchString?: string | null, exact?: boolean): CommandGroup[];
    /**
     * Resolves a CommandGroupResolvable to a CommandGroup object
     * @param group - The group to resolve
     * @return The resolved CommandGroup
     */
    resolveGroup(group: CommandGroupResolvable): CommandGroup;
    /**
     * Finds all commands that match the search string
     * @param searchString - The string to search for
     * @param exact - Whether the search should be exact
     * @param instances - The instances to check usability against
     * @return All commands that are found
     */
    findCommands(searchString?: string | null, exact?: boolean, instances?: CommandInstances): Command[];
    /**
     * Resolves a CommandResolvable to a Command object
     * @param command - The command to resolve
     * @return The resolved Command
     */
    resolveCommand(command: CommandResolvable): Command;
    /**
     * Resolves a command file path from a command's group ID and memberName
     * @param group - ID of the command's group
     * @param memberName - Member name of the command
     * @return Fully-resolved path to the corresponding command file
     */
    resolveCommandPath(group: string, memberName: string): string;
}

/** Has a message that can be considered user-friendly */
export class FriendlyError extends Error {
    /**
     * @param message - The error message
     */
    constructor(message: string);
}

/** Contains various general-purpose utility methods and constants. */
export class Util extends null {
    /** Object that maps every PermissionsString to its representation inside the Discord client. */
    static get permissions(): Readonly<Record<PermissionsString, string>>;
    /**
     * Escapes the following characters from a string: `|\{}()[]^$+*?.`.
     * @param str - The string to escape.
     */
    static escapeRegex(str: string): string;
    /**
     * Basic probability function.
     * @param n - The probability percentage, from 0 to 100.
     */
    static probability(n: number): boolean;
    /**
     * Checks if the argument is a promise.
     * @param obj - The object of function to check.
     */
    static isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T>;
    /**
     * Removes the reply ping from a message if its sent in DMs.
     * @param msg - The message instance.
     * @returns A {@link MessageCreateOptions} object.
     */
    static noReplyPingInDMs(msg: CommandoMessage | Message): MessageCreateOptions;
    /**
     * Disambiguate items from an array into a list.
     * @param items - An array of strings or objects.
     * @param label - The label for the items list.
     * @param property - The property to read from the objects (only usable if `items` is an array of objects).
     * @returns A string with the disambiguated items.
     */
    static disambiguation(items: Array<Record<string, string> | string>, label: string, property?: string): string;
    /**
     * Removes the dashes from a string and capitalizes the characters in front of them.
     * @param str - The string to parse.
     */
    static removeDashes(str: string): string;
    /**
     * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
     * @param text - Content to split
     * @param options - Options controlling the behavior of the split
     */
    static splitMessage(text: string, options?: SplitOptions): string[];
    /**
     * **Extremely hacky method. Use at own risk.**
     * Will mutate the first object into an instance of the new one, assigning all of its properties, accessors and methods.
     * @param obj - The object to mutate.
     * @param newObj - The data to assign.
     */
    static mutateObjectInstance<T extends object>(obj: object, newObj: T): T;
    /**
     * Gets the last item of an array.
     * @param array - An array.
     */
    static lastFromArray<T>(array: T[]): T;
    /**
     * **For arrays.**
     * Filters all nullish (`undefined` | `null`) items from an array. Mostly useful for TS.
     * @param array - Any array that could contain nullish items.
     * @returns An array with all non-nullish items.
     */
    static filterNullishItems<T>(array: Array<T | null | undefined>): T[];
    /**
     * **For {@link Collection Collections}.**
     * Filters all nullish (`undefined` | `null`) items from a collection. Mostly useful for TS.
     * @param collection - Any collection that could contain nullish values.
     * @returns An array with all non-nullish values.
     */
    static filterNullishValues<K, V>(collection: Collection<K, V | null | undefined>): Collection<K, V>;
    /**
     * Checks if a value is undefined.
     * @param val - The value to check.
     * @returns Whether the value is nullish.
     */
    static isNullish(val: unknown): val is null | undefined;
    /**
     * Get the current instance of a command. Useful if you need to get the same properties from both instances.
     * @param instances - The instances object.
     * @returns The instance of the command.
     */
    static getInstanceFrom(instances: CommandInstances): CommandoInteraction | CommandoMessage;
    static equals<T extends number | string>(value: number | string, ...values: T[]): value is T;
    /**
     * Verifies the provided data is a string, otherwise throws provided error.
     * @param data - The string resolvable to resolve
     * @param error - The Error constructor to instantiate. Defaults to Error
     * @param errorMessage - The error message to throw with. Defaults to "Expected string, got <data> instead."
     * @param allowEmpty - Whether an empty string should be allowed
     */
    protected static verifyString(
        data: string, error?: ErrorConstructor, errorMessage?: string, allowEmpty?: boolean
    ): string;
}

//#endregion

//#region Constants

/** The package's version */
export const version: string;

//#endregion

//#region Managers

/** The client's database manager (MongoDB) */
export class ClientDatabaseManager {
    /**
     * @param client - The client this database is for
     */
    constructor(client: CommandoClient);

    /**
     * Initializes the caching of this client's data
     * @param data - The data to assign to the client
     */
    protected init(data: Collection<string, LimitedCollection<string, AnySchema>>): this;

    /** Client for this database */
    readonly client: CommandoClient;
    disabled: DatabaseManager<DisabledSchema>;
    errors: DatabaseManager<ErrorSchema>;
    faq: DatabaseManager<FaqSchema>;
    prefixes: DatabaseManager<PrefixSchema>;
    reminders: DatabaseManager<ReminderSchema>;
    todo: DatabaseManager<TodoSchema>;
}

/** A MongoDB database schema manager */
export default class DatabaseManager<T extends AnySchema, IncludeId extends boolean = boolean> {
    /**
     * @param schema - The schema of this manager
     * @param guild - The guild this manager is for
     */
    constructor(schema: ModelFrom<T, IncludeId>, guild?: CommandoGuild);
    /** Filtering function for fetching documents. May only be used in `Array.filter()` or `Collection.filter()` */
    protected filterDocuments(filter: FilterQuery<T>): (doc: T) => boolean;

    /** Guild for this database */
    readonly guild: CommandoGuild | null;
    /** The name of the schema this manager is for */
    Schema: SimplifiedModel<T>;
    /** The cache for this manager */
    cache: LimitedCollection<string, T>;

    /**
     * Add a single document to the database
     * @param doc - The document to add
     * @returns The added document
     */
    add(doc: T): Promise<T>;
    /**
     * Delete a single document from the database
     * @param doc - The document to delete or its ID
     * @returns The deleted document
     */
    delete(doc: T | string): Promise<T>;
    /**
     * Update a single document of the database
     * @param doc - The document to update or its ID
     * @param update - The update to apply
     * @returns The updated document
     */
    update(doc: T | string, update: T | UpdateAggregationStage | UpdateQuery<T>): Promise<T>;
    /**
     * Fetch a single document
     * @param filter - The ID or fetching filter for this document
     * @returns The fetched document
     */
    fetch(filter?: FilterQuery<T> | string): Promise<T | null>;
    /**
     * Fetch multiple documents
     * @param filter - The fetching filter for the documents
     * @returns The fetched documents
     */
    fetchMany(filter?: FilterQuery<T>): Promise<Collection<string, T>>;
}

/** A guilds' database manager (MongoDB) */
export class GuildDatabaseManager {
    /**
     * @param guild - The guild this database is for
     */
    constructor(guild: CommandoGuild);

    /**
     * Initializes the caching of this guild's data
     * @param data - The data to assign to the guild
     */
    protected init(data: Collection<string, LimitedCollection<string, AnySchema>>): this;

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
}

//#endregion

//#region Overrides

export interface OverwrittenClientEvents extends ClientEvents {
    autoModerationActionExecution: [autoModerationActionExecution: CommandoAutoModerationActionExecution];
    autoModerationRuleCreate: [autoModerationRule: CommandoAutoModerationRule];
    autoModerationRuleDelete: [autoModerationRule: CommandoAutoModerationRule];
    autoModerationRuleUpdate: [
        oldAutoModerationRule: CommandoAutoModerationRule | null,
        newAutoModerationRule: CommandoAutoModerationRule,
    ];
    channelCreate: [channel: NonThreadCommandoGuildBasedChannel];
    channelDelete: [channel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel];
    channelPinsUpdate: [channel: CommandoTextBasedChannel, date: Date];
    channelUpdate: [
        oldChannel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel,
        newChannel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel,
    ];
    emojiCreate: [emoji: CommandoGuildEmoji];
    emojiDelete: [emoji: CommandoGuildEmoji];
    emojiUpdate: [oldEmoji: CommandoGuildEmoji, newEmoji: CommandoGuildEmoji];
    guildBanAdd: [ban: CommandoGuildBan];
    guildBanRemove: [ban: CommandoGuildBan];
    guildDelete: [guild: CommandoGuild];
    guildUnavailable: [guild: CommandoGuild];
    guildIntegrationsUpdate: [guild: CommandoGuild];
    guildMemberAdd: [member: CommandoGuildMember];
    guildMemberAvailable: [member: CommandoGuildMember | PartialCommandoGuildMember];
    guildMemberRemove: [member: CommandoGuildMember | PartialCommandoGuildMember];
    guildMembersChunk: [
        members: Collection<Snowflake, CommandoGuildMember>,
        guild: CommandoGuild,
        data: {
            count: number;
            index: number;
            nonce: string | undefined;
        },
    ];
    guildMemberUpdate: [
        oldMember: CommandoGuildMember | PartialCommandoGuildMember,
        newMember: CommandoGuildMember,
    ];
    guildUpdate: [oldGuild: CommandoGuild, newGuild: CommandoGuild];
    inviteCreate: [invite: CommandoInvite];
    inviteDelete: [invite: CommandoInvite];
    messageCreate: [message: CommandoifiedMessage];
    messageDelete: [message: CommandoifiedMessage | PartialCommandoifiedMessage];
    messageReactionRemoveAll: [
        message: CommandoifiedMessage | PartialCommandoifiedMessage,
        reactions: Collection<Snowflake | string, CommandoMessageReaction>,
    ];
    messageDeleteBulk: [
        messages: Collection<Snowflake, CommandoifiedMessage | PartialCommandoifiedMessage>,
        channel: CommandoGuildTextBasedChannel,
    ];
    messageUpdate: [
        oldMessage: CommandoifiedMessage | PartialCommandoifiedMessage,
        newMessage: CommandoifiedMessage | PartialCommandoifiedMessage,
    ];
    presenceUpdate: [oldPresence: CommandoPresence | null, newPresence: CommandoPresence];
    ready: [client: CommandoClient<true>];
    roleCreate: [role: CommandoRole];
    roleDelete: [role: CommandoRole];
    roleUpdate: [oldRole: CommandoRole, newRole: CommandoRole];
    threadCreate: [thread: AnyCommandoThreadChannel, newlyCreated: boolean];
    threadDelete: [thread: AnyCommandoThreadChannel];
    threadListSync: [threads: Collection<Snowflake, AnyCommandoThreadChannel>, guild: CommandoGuild];
    threadMembersUpdate: [
        addedMembers: Collection<Snowflake, CommandoThreadMember>,
        removedMembers: Collection<Snowflake, CommandoThreadMember | PartialCommandoThreadMember>,
        thread: AnyCommandoThreadChannel,
    ];
    threadUpdate: [oldThread: AnyCommandoThreadChannel, newThread: AnyCommandoThreadChannel];
    typingStart: [typing: CommandoTyping];
    userUpdate: [oldUser: CommandoUser | PartialCommandoUser, newUser: CommandoUser];
    voiceStateUpdate: [oldState: CommandoVoiceState, newState: CommandoVoiceState];
    webhookUpdate: [channel: CommandoForumChannel | CommandoNewsChannel | CommandoTextChannel | CommandoVoiceChannel];
    interactionCreate: [interaction: CommandoifiedInteraction];
    stageInstanceCreate: [stageInstance: CommandoStageInstance];
    stageInstanceUpdate: [
        oldStageInstance: CommandoStageInstance | null,
        newStageInstance: CommandoStageInstance,
    ];
    stageInstanceDelete: [stageInstance: CommandoStageInstance];
    stickerCreate: [sticker: CommandoSticker];
    stickerDelete: [sticker: CommandoSticker];
    stickerUpdate: [oldSticker: CommandoSticker, newSticker: CommandoSticker];
    guildScheduledEventCreate: [guildScheduledEvent: CommandoGuildScheduledEvent];
    guildScheduledEventUpdate: [
        oldGuildScheduledEvent: CommandoGuildScheduledEvent | null,
        newGuildScheduledEvent: CommandoGuildScheduledEvent,
    ];
    guildScheduledEventDelete: [guildScheduledEvent: CommandoGuildScheduledEvent];
    guildScheduledEventUserAdd: [guildScheduledEvent: CommandoGuildScheduledEvent, user: CommandoUser];
    guildScheduledEventUserRemove: [guildScheduledEvent: CommandoGuildScheduledEvent, user: CommandoUser];
}

export type CommandoGuildResolvable = CommandoGuild | GuildResolvable;

export declare class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, CommandoGuildResolvable> {
    public create(options: GuildCreateOptions): Promise<CommandoGuild>;
    public fetch(options: FetchGuildOptions | Snowflake): Promise<CommandoGuild>;
    public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}

// @ts-expect-error: private constructor
export declare class CommandoAutoModerationActionExecution extends AutoModerationActionExecution {
    public guild: CommandoGuild;
    public get autoModerationRule(): CommandoAutoModerationRule | null;
}

// @ts-expect-error: private constructor
export declare class CommandoAutoModerationRule extends AutoModerationRule {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoGuildEmoji extends GuildEmoji {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoGuildBan extends GuildBan {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoGuildMember extends GuildMember {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isCommunicationDisabled(): this is CommandoGuildMember & {
        communicationDisabledUntilTimestamp: number;
        readonly communicationDisabledUntil: Date;
    };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoGuildMember extends Partialize<
    CommandoGuildMember, 'joinedAt' | 'joinedTimestamp' | 'pending'
> { }

// @ts-expect-error: private constructor
export declare class CommandoInvite extends Invite {
    public guild: CommandoGuild | Exclude<Invite['guild'], Guild>;
}

export declare class CommandoPresence extends Presence {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild | null;
}

// @ts-expect-error: private constructor
export declare class CommandoRole extends Role {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoTyping extends Typing {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
    public inGuild(): this is this & {
        channel: CommandoNewsChannel | CommandoTextChannel | CommandoThreadChannel;
        get guild(): CommandoGuild;
    };
}

// @ts-expect-error: private constructor
export declare class CommandoVoiceState extends VoiceState {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoStageInstance extends StageInstance {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
}

// @ts-expect-error: private constructor
export declare class CommandoSticker extends Sticker {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
}

export declare class CommandoGuildScheduledEvent<
    S extends GuildScheduledEventStatus = GuildScheduledEventStatus
// @ts-expect-error: private constructor
> extends GuildScheduledEvent<S> {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
    public isActive(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Active>;
    public isCanceled(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Canceled>;
    public isCompleted(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Completed>;
    public isScheduled(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Scheduled>;
}

// @ts-expect-error: private constructor
export declare class CommandoifiedMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
    public readonly client: CommandoClient<true>;
    public get guild(): If<InGuild, CommandoGuild>;
    public inGuild(): this is CommandoifiedMessage<true>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoifiedMessage extends Partialize<
    CommandoifiedMessage, 'pinned' | 'system' | 'tts' | 'type', 'author' | 'cleanContent' | 'content'
> { }

export declare class CommandoCategoryChannel extends CategoryChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

// @ts-expect-error: private constructor
export declare class CommandoDMChannel extends DMChannel {
    public readonly client: CommandoClient<true>;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export interface PartialCommandoDMChannel extends Partialize<CommandoDMChannel, null, null, 'lastMessageId'> {
    lastMessageId: undefined;
}

export declare class CommandoForumChannel extends ForumChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

// @ts-expect-error: private constructor
export declare class PartialCommandoGroupDMChannel extends PartialGroupDMChannel {
    public readonly client: CommandoClient<true>;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoNewsChannel extends NewsChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoStageChannel extends StageChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoTextChannel extends TextChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

// @ts-expect-error: private constructor
export declare class CommandoThreadChannel extends ThreadChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoVoiceChannel extends VoiceChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export type AnyCommandoThreadChannel<Forum extends boolean = boolean> =
    | CommandoPrivateThreadChannel
    | CommandoPublicThreadChannel<Forum>;

export interface CommandoPublicThreadChannel<Forum extends boolean = boolean> extends PublicThreadChannel<Forum> {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export interface CommandoPrivateThreadChannel extends PrivateThreadChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export type CommandoChannel =
    | AnyCommandoThreadChannel
    | CommandoCategoryChannel
    | CommandoDMChannel
    | CommandoForumChannel
    | CommandoNewsChannel
    | CommandoStageChannel
    | CommandoTextChannel
    | CommandoVoiceChannel
    | PartialCommandoDMChannel
    | PartialCommandoGroupDMChannel;

export type CommandoTextBasedChannel = Exclude<
    Extract<CommandoChannel, { type: TextChannelType }>,
    CommandoForumChannel | PartialCommandoGroupDMChannel
>;

export type CommandoVoiceBasedChannel = Extract<CommandoChannel, { bitrate: number }>;

export type CommandoGuildBasedChannel = Extract<CommandoChannel, { guild: CommandoGuild }>;

export type NonThreadCommandoGuildBasedChannel = Exclude<CommandoGuildBasedChannel, AnyCommandoThreadChannel>;

export type CommandoGuildTextBasedChannel = Exclude<
    Extract<CommandoGuildBasedChannel, CommandoTextBasedChannel>,
    CommandoForumChannel
>;

export declare class CommandoUser extends User {
    public readonly client: CommandoClient<true>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoUser extends Partialize<CommandoUser, 'discriminator' | 'tag' | 'username'> { }

// @ts-expect-error: private constructor
export declare class CommandoMessageReaction extends MessageReaction {
    public readonly client: CommandoClient<true>;
}

// @ts-expect-error: private constructor
export declare class CommandoThreadMember extends ThreadMember {
    public readonly client: CommandoClient<true>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoThreadMember extends Partialize<
    CommandoThreadMember, 'flags' | 'joinedAt' | 'joinedTimestamp'
> { }

export declare class CommandoAutocompleteInteraction<
    Cached extends CacheType = CacheType
> extends AutocompleteInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoAutocompleteInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoAutocompleteInteraction<'cached'>;
    public inRawGuild(): this is CommandoAutocompleteInteraction<'raw'>;
}

// @ts-expect-error: private constructor
export declare class CommandoButtonInteraction<Cached extends CacheType = CacheType> extends ButtonInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoButtonInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoButtonInteraction<'cached'>;
    public inRawGuild(): this is CommandoButtonInteraction<'raw'>;
}

export declare class CommandoChatInputCommandInteraction<
    Cached extends CacheType = CacheType
> extends ChatInputCommandInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoChatInputCommandInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoChatInputCommandInteraction<'cached'>;
    public inRawGuild(): this is CommandoChatInputCommandInteraction<'raw'>;
}

export declare class CommandoMessageContextMenuCommandInteraction<
    Cached extends CacheType = CacheType
> extends MessageContextMenuCommandInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoMessageContextMenuCommandInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoMessageContextMenuCommandInteraction<'cached'>;
    public inRawGuild(): this is CommandoMessageContextMenuCommandInteraction<'raw'>;
}

export declare class CommandoModalSubmitInteraction<
    Cached extends CacheType = CacheType
// @ts-expect-error: private constructor
> extends ModalSubmitInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoModalSubmitInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoModalSubmitInteraction<'cached'>;
    public inRawGuild(): this is CommandoModalSubmitInteraction<'raw'>;
    public isFromMessage(): this is CommandoModalMessageModalSubmitInteraction<Cached>;
}

export interface CommandoModalMessageModalSubmitInteraction<
    Cached extends CacheType = CacheType
> extends ModalMessageModalSubmitInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoModalMessageModalSubmitInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoModalMessageModalSubmitInteraction<'cached'>;
    inRawGuild(): this is CommandoModalMessageModalSubmitInteraction<'raw'>;
}

export declare class CommandoUserContextMenuCommandInteraction<
    Cached extends CacheType = CacheType
> extends UserContextMenuCommandInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoUserContextMenuCommandInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoUserContextMenuCommandInteraction<'cached'>;
    public inRawGuild(): this is CommandoUserContextMenuCommandInteraction<'raw'>;
}

export declare class CommandoChannelSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends ChannelSelectMenuInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoChannelSelectMenuInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoChannelSelectMenuInteraction<'cached'>;
    public inRawGuild(): this is CommandoChannelSelectMenuInteraction<'raw'>;
}

export declare class CommandoMentionableSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends MentionableSelectMenuInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoMentionableSelectMenuInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoMentionableSelectMenuInteraction<'cached'>;
    public inRawGuild(): this is CommandoMentionableSelectMenuInteraction<'raw'>;
}

export declare class CommandoRoleSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends RoleSelectMenuInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoRoleSelectMenuInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoRoleSelectMenuInteraction<'cached'>;
    public inRawGuild(): this is CommandoRoleSelectMenuInteraction<'raw'>;
}

export declare class CommandoStringSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends StringSelectMenuInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoStringSelectMenuInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoStringSelectMenuInteraction<'cached'>;
    public inRawGuild(): this is CommandoStringSelectMenuInteraction<'raw'>;
}

export declare class CommandoUserSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends UserSelectMenuInteraction<Cached> {
    public readonly client: CommandoClient<true>;
    public get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    public inGuild(): this is CommandoUserSelectMenuInteraction<'cached' | 'raw'>;
    public inCachedGuild(): this is CommandoUserSelectMenuInteraction<'cached'>;
    public inRawGuild(): this is CommandoUserSelectMenuInteraction<'raw'>;
}

export type AnyCommandoSelectMenuInteraction<Cached extends CacheType = CacheType> =
    | CommandoChannelSelectMenuInteraction<Cached>
    | CommandoMentionableSelectMenuInteraction<Cached>
    | CommandoRoleSelectMenuInteraction<Cached>
    | CommandoStringSelectMenuInteraction<Cached>
    | CommandoUserSelectMenuInteraction<Cached>;

export type CommandoifiedInteraction<Cached extends CacheType = CacheType> =
    | AnyCommandoSelectMenuInteraction<Cached>
    | CommandoAutocompleteInteraction<Cached>
    | CommandoButtonInteraction<Cached>
    | CommandoChatInputCommandInteraction<Cached>
    | CommandoMessageContextMenuCommandInteraction<Cached>
    | CommandoModalSubmitInteraction<Cached>
    | CommandoUserContextMenuCommandInteraction<Cached>;

//#endregion

//#region Typedefs

export type APISlashCommand = Required<Pick<SlashCommandInfo, 'deferEphemeral'>> & RESTPostAPISlashCommand;

type ArgumentCheckerParams = [
    val: string[] | string,
    originalMsg: CommandoMessage,
    arg: Argument,
    currentMsg?: CommandoMessage
];

/** Either a value or a function that returns a value. The function is passed the CommandoMessage and the Argument. */
export type ArgumentDefault = (msg: CommandoMessage, arg: Argument) => Promise<unknown>;

export type ArgumentResponse = CommandoMessage | Message | null;

export type ArgumentTypes =
    | 'boolean'
    | 'category-channel'
    | 'channel'
    | 'command'
    | 'custom-emoji'
    | 'date'
    | 'default-emoji'
    | 'duration'
    | 'float'
    | 'group'
    | 'integer'
    | 'invite'
    | 'member'
    | 'message'
    | 'role'
    | 'stage-channel'
    | 'string'
    | 'text-channel'
    | 'thread-channel'
    | 'time'
    | 'user'
    | 'voice-channel';

/** The reason of {@link Command#onBlock} */
export type CommandBlockReason =
    | 'clientPermissions'
    | 'dmOnly'
    | 'guildOnly'
    | 'guildOwnerOnly'
    | 'modPermissions'
    | 'nsfw'
    | 'ownerOnly'
    | 'throttling'
    | 'userPermissions';

/**
 * A CommandGroupResolvable can be:
 * - A {@link CommandGroup}
 * - A group ID
 */
export type CommandGroupResolvable = CommandGroup | string;

export type CommandoMessageResponse<InGuild extends boolean = boolean> =
    | Array<Message<InGuild>>
    | CommandoMessage<InGuild>
    | Message<InGuild>
    | null;

/**
 * A CommandResolvable can be:
 * - A {@link Command}
 * - A command name
 * - A {@link CommandoMessage}
 */
export type CommandResolvable = Command | CommandoMessage | string;

/**
 * A function that decides whether the usage of a command should be blocked
 * @param msg - Message triggering the command
 * @returns `false` if the command should *not* be blocked.
 * If the command *should* be blocked, then one of the following:
 * - A single string identifying the reason the command is blocked
 * - An Inhibition object
 */
type Inhibitor = (msg: CommandoMessage) => Inhibition | string;

/** Type of the response */
export type ResponseType = 'code' | 'direct' | 'plain' | 'reply';

export type StringResolvable = MessageCreateOptions | string;

/** Result object from obtaining argument values from an {@link ArgumentCollector} */
export interface ArgumentCollectorResult<T = Record<string, unknown>> {
    /** Final values for the arguments, mapped by their keys */
    values: T | null;
    /**
     * One of:
     * - `user` (user cancelled)
     * - `time` (wait time exceeded)
     * - `promptLimit` (prompt limit exceeded)
     */
    cancelled: 'promptLimit' | 'time' | 'user' | null;
    /** All messages that were sent to prompt the user */
    prompts: ArgumentResponse[];
    /** All of the user's messages that answered a prompt */
    answers: ArgumentResponse[];
}

/** Information for the command argument */
export interface ArgumentInfo {
    /** Key for the argument */
    key: string;
    /**
     * Label for the argument
     * @default this.key
     */
    label?: string;
    /** First prompt for the argument when it wasn't specified */
    prompt: string;
    /** Predefined error message to output for the argument when it isn't valid */
    error?: string;
    /**
     * Type of the argument (must be the ID of one of the registered argument types or multiple IDs in order of priority
     * separated by `|` for a union type - see {@link CommandoRegistry#registerDefaultTypes} for the built-in types)
     */
    type?: ArgumentTypes | ArgumentTypes[];
    /**
     * - If type is `integer` or `float`, this is the maximum value of the number.
     * - If type is `string`, this is the maximum length of the string.
     * - If type is `duration`, this is the maximum duration.
     */
    max?: number;
    /**
     * - If type is `integer` or `float`, this is the minimum value of the number.
     * - If type is `string`, this is the minimum length of the string.
     * - If type is `duration`, this is the minimum duration.
     */
    min?: number;
    /** Default value for the argument (makes the arg optional - cannot be `null`) */
    default?: ArgumentDefault;
    /** An array of values that are allowed to be used */
    oneOf?: Array<number | string>;
    /**
     * Whether the argument is required or not
     * @default true
     */
    required?: boolean;
    /**
     * Whether the date/time argument validation is skipped or not
     * @default false
     */
    skipExtraDateValidation?: boolean;
    /**
     * Whether the argument accepts infinite values
     * @default false;
     */
    infinite?: boolean;
    /** Validator function for the argument (see {@link ArgumentType#validate}) */
    validate?: (...args: ArgumentCheckerParams) => Promise<boolean | string> | boolean | string;
    /** Parser function for the argument (see {@link ArgumentType#parse}) */
    parse?: (...args: ArgumentCheckerParams) => unknown;
    /** Empty checker for the argument (see {@link ArgumentType#isEmpty}) */
    isEmpty?: (...args: ArgumentCheckerParams) => boolean;
    /**
     * How long to wait for input (in seconds)
     * @default 30
     */
    wait?: number;
}

/** Result object from obtaining a single {@link Argument}'s value(s) */
export interface ArgumentResult {
    /** Final value(s) for the argument */
    value: unknown;
    /**
     * One of:
     * - `user` (user cancelled)
     * - `time` (wait time exceeded)
     * - `promptLimit` (prompt limit exceeded)
     */
    cancelled: 'promptLimit' | 'time' | 'user' | null;
    /** All messages that were sent to prompt the user */
    prompts: ArgumentResponse[];
    /** All of the user's messages that answered a prompt */
    answers: ArgumentResponse[];
}

/** Additional data associated with the block */
export interface CommandBlockData {
    /**
     * Built-in reason: `throttling`
     * - The throttle object
     */
    throttle?: Throttle;
    /**
     * Built-in reason: `throttling`
     * - Remaining time in seconds
     */
    remaining?: number;
    /**
     * Built-in reasons: `userPermissions` & `clientPermissions`
     * - Missing permissions names
     */
    missing?: PermissionsString[];
}

/** The command information */
export interface CommandInfo<InGuild extends boolean = boolean> {
    /** The name of the command (must be lowercase). */
    name: string;
    /** Alternative names for the command (all must be lowercase). */
    aliases?: string[];
    /**
     * Whether automatic aliases should be added.
     * @default false
     */
    autoAliases?: boolean;
    /** The ID of the group the command belongs to (must be lowercase). */
    group: string;
    /**
     * The member name of the command in the group (must be lowercase).
     * @default this.name
     */
    memberName?: string;
    /** A short description of the command. */
    description: string;
    /** The command usage format string - will be automatically generated if not specified, and `args` is specified. */
    format?: string;
    /** A detailed description of the command and its functionality. */
    details?: string;
    /** Usage examples of the command. */
    examples?: string[];
    /**
     * Whether the command is usable only in NSFW channels.
     * @default false
     */
    nsfw?: boolean;
    /**
     * Whether or not the command should only function in direct messages.
     * @default false
     */
    dmOnly?: boolean;
    /**
     * Whether or not the command should only function in a guild channel.
     * @default false
     */
    guildOnly?: InGuild;
    /**
     * Whether or not the command is usable only by a server owner.
     * @default false
     */
    guildOwnerOnly?: boolean;
    /**
     * Whether or not the command is usable only by an owner.
     * @default false
     */
    ownerOnly?: boolean;
    /** Permissions required by the client to use the command. */
    clientPermissions?: PermissionsString[];
    /** Permissions required by the user to use the command. */
    userPermissions?: PermissionsString[];
    /**
     * Whether this command's user permissions are based on "moderator" permissions.
     * @default false
     */
    modPermissions?: boolean;
    /**
     * Whether or not the default command handling should be used.
     * If false, then only patterns will trigger the command.
     * @default true
     */
    defaultHandling?: boolean;
    /** Options for throttling usages of the command. */
    throttling?: ThrottlingOptions;
    /**
     * Whether the slash command will be registered in the test guild only or not.
     * @default false
     */
    testEnv?: boolean;
    /** Arguments for the command. */
    args?: ArgumentInfo[];
    /**
     * Maximum number of times to prompt a user for a single argument. Only applicable if `args` is specified.
     * @default Infinity
     */
    argsPromptLimit?: number;
    /**
     * One of 'single' or 'multiple'. Only applicable if `args` is not specified.
     * When 'single', the entire argument string will be passed to run as one argument.
     * When 'multiple', it will be passed as multiple arguments.
     * @default 'single'
     */
    argsType?: 'multiple' | 'single';
    /**
     * The number of arguments to parse from the command string. Only applicable when argsType is 'multiple'.
     * If nonzero, it should be at least 2. When this is 0, the command argument string will be split into as
     * many arguments as it can be. When nonzero, it will be split into a maximum of this number of arguments.
     * @default 0
     */
    argsCount?: number;
    /**
     * Whether or not single quotes should be allowed to box-in arguments in the command string.
     * @default true
     */
    argsSingleQuotes?: boolean;
    /** Patterns to use for triggering the command. */
    patterns?: RegExp[];
    /**
     * Whether the command should be protected from disabling.
     * @default false
     */
    guarded?: boolean;
    /**
     * Whether the command should be hidden from the help command.
     * @default false
     */
    hidden?: boolean;
    /**
     * Whether the command should be run when an unknown command is used -
     * there may only be one command registered with this property as `true`.
     * @default false
     */
    unknown?: boolean;
    /**
     * Whether the command is marked as deprecated.
     * @default false
     */
    deprecated?: boolean;
    /**
     * The name or alias of the command that is replacing the deprecated command.
     * Required if `deprecated` is `true`.
     */
    deprecatedReplacement?: string;
}

/** The instances the command is being run for */
export type CommandInstances<InGuild extends boolean = boolean> = {
    /** The interaction the command is being run for */
    interaction: CommandoInteraction<InGuild>;
} | {
    /** The message the command is being run for */
    message: CommandoMessage<InGuild>;
};

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
    commandoMessageCreate: [message: CommandoMessage];
    commandoMessageDelete: [message: CommandoMessage];
    commandoMessageUpdate: [oldMessage: CommandoMessage, newMessage: CommandoMessage];
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

export interface Inhibition {
    /** Identifier for the reason the command is being blocked */
    reason: string;
    /** Response being sent to the user */
    response?: Promise<Message> | null;
}

export interface SimplifiedModel<T> extends Model<T> {
    find(filter: FilterQuery<T>): Promise<T[]>;
    findOne(filter: FilterQuery<T>): Promise<T>;
    findById(id: string): Promise<T>;
    updateOne(filter: FilterQuery<T>, update: Omit<T, '_id'> | UpdateQuery<Omit<T, '_id'>>): Promise<UpdateWriteOpResult>;
}

/** Object specifying which types to register */
export interface DefaultTypesOptions {
    /**
     * Whether to register the built-in string type
     * @default true
     */
    string?: boolean;
    /**
     * Whether to register the built-in integer type
     * @default true
     */
    integer?: boolean;
    /**
     * Whether to register the built-in float type
     * @default true
     */
    float?: boolean;
    /**
     * Whether to register the built-in boolean type
     * @default true
     */
    boolean?: boolean;
    /**
     * Whether to register the built-in duration type
     * @default true
     */
    duration?: boolean;
    /**
     * Whether to register the built-in date type
     * @default true
     */
    date?: boolean;
    /**
     * Whether to register the built-in time type
     * @default true
     */
    time?: boolean;
    /**
     * Whether to register the built-in user type
     * @default true
     */
    user?: boolean;
    /**
     * Whether to register the built-in member type
     * @default true
     */
    member?: boolean;
    /**
     * Whether to register the built-in role type
     * @default true
     */
    role?: boolean;
    /**
     * Whether to register the built-in channel type
     * @default true
     */
    channel?: boolean;
    /**
     * Whether to register the built-in text-channel type
     * @default true
     */
    textChannel?: boolean;
    /**
     * Whether to register the built-in thread-channel type
     * @default true
     */
    threadChannel?: boolean;
    /**
     * Whether to register the built-in voice-channel type
     * @default true
     */
    voiceChannel?: boolean;
    /**
     * Whether to register the built-in stage-channel type
     * @default true
     */
    stageChannel?: boolean;
    /**
     * Whether to register the built-in category-channel type
     * @default true
     */
    categoryChannel?: boolean;
    /**
     * Whether to register the built-in message type
     * @default true
     */
    message?: boolean;
    /**
     * Whether to register the built-in invite type
     * @default true
     */
    invite?: boolean;
    /**
     * Whether to register the built-in custom-emoji type
     * @default true
     */
    customEmoji?: boolean;
    /**
     * Whether to register the built-in default-emoji type
     * @default true
     */
    defaultEmoji?: boolean;
    /**
     * Whether to register the built-in command type
     * @default true
     */
    command?: boolean;
    /**
     * Whether to register the built-in group type
     * @default true
     */
    group?: boolean;
}

export interface RequireAllOptions {
    dirname: string;
    filter?: RegExp | ((name: string, path: string) => string | false);
    excludeDirs?: RegExp;
    map?: ((name: string, path: string) => string);
    resolve?: ((module: unknown) => unknown);
    recursive?: boolean;
}

export interface ResponseOptions {
    /** Type of the response */
    type?: ResponseType;
    /** Content of the response */
    content?: StringResolvable | null;
    /** Options of the response */
    options?: MessageCreateOptions;
    /** Language of the response, if its type is `code` */
    lang?: string;
    /** If the response is from an edited message */
    fromEdit?: boolean;
}

/** The slash command information */
export interface SlashCommandInfo extends Omit<
    ChatInputApplicationCommandData, 'defaultMemberPermissions' | 'description' | 'dmPermission' | 'name' | 'type'
> {
    /** Whether the deferred reply should be ephemeral or not */
    deferEphemeral?: boolean;
}

/** Options for splitting a message */
export interface SplitOptions {
    /**
     * Maximum character length per message piece.
     * @default 2000
     */
    maxLength?: number;
    /**
     * Character(s) or Regex(es) to split the message with, an array can be used to split multiple times.
     * @default '\n'
     */
    char?: RegExp | RegExp[] | string[] | string;
    /** Text to prepend to every piece except the first. */
    prepend?: string;
    /** Text to append to every piece except the last. */
    append?: string;
}

/** Throttling object of the command. */
export interface Throttle {
    /** Time when the throttle started */
    start: number;
    /** Amount usages of the command */
    usages: number;
    /** Timeout function for this throttle */
    timeout: NodeJS.Timeout;
}

/** Options for throttling usages of the command. */
export interface ThrottlingOptions {
    /** Maximum number of usages of the command allowed in the time frame. */
    usages: number;
    /** Amount of time to count the usages of the command within (in seconds). */
    duration: number;
}

//#endregion

//#region Util types

export type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

export type Require<T extends object, K extends keyof T = keyof T, Expand extends boolean = true> = Expand extends true
    ? Destructure<Omit<T, K> & Required<Pick<T, K>>>
    : Omit<T, K> & Required<Pick<T, K>>;

export type Destructure<T> = { [P in keyof T]: T[P] };

export type Commandoify<T, Ready extends boolean = boolean> = OverrideGuild<OverrideClient<T, Ready>>;

export type OverrideGuild<T> = T extends { guild: Guild | infer R }
    ? Omit<T, 'guild'> & { guild: CommandoGuild | Exclude<R, Guild> }
    : T;

export type OverrideClient<T, Ready extends boolean = boolean> = T extends { client: Client | infer R }
    ? Omit<T, 'client'> & { readonly client: CommandoClient<Ready> | Exclude<R, Client> }
    : T;

export type CommandoifyMessage<
    Type extends Message | PartialMessage,
    InGuild extends boolean = boolean
> = OverrideClient<Omit<Type extends Message ? Message<InGuild> : PartialMessage, 'guild'> & {
    get guild(): If<InGuild, CommandoGuild>;
}>;

//#endregion

//#region Schemas

export type AnySchema<IncludeId extends boolean = boolean> = Partial<
    | ActiveSchema
    | AfkSchema
    | DisabledSchema
    | ErrorSchema
    | FaqSchema
    | McIpSchema
    | ModerationSchema
    | ModuleSchema
    | PollSchema
    | PrefixSchema
    | ReactionRoleSchema
    | ReminderSchema
    | RuleSchema
    | SetupSchema
    | StickyRoleSchema
    | TodoSchema
    | WelcomeSchema
>
    & (IncludeId extends true ? (Omit<BaseSchema, '_id'> & { readonly _id: string }) : BaseSchema)
    & { guild?: string };

export interface SimplifiedSchemas {
    ActiveModel: SimplifiedModel<ActiveSchema>;
    AfkModel: SimplifiedModel<AfkSchema>;
    DisabledModel: SimplifiedModel<DisabledSchema>;
    ErrorsModel: SimplifiedModel<ErrorSchema>;
    FaqModel: SimplifiedModel<FaqSchema>;
    McIpsModel: SimplifiedModel<McIpSchema>;
    ModerationsModel: SimplifiedModel<ModerationSchema>;
    ModulesModel: SimplifiedModel<ModuleSchema>;
    PollsModel: SimplifiedModel<PollSchema>;
    PrefixesModel: SimplifiedModel<PrefixSchema>;
    ReactionRolesModel: SimplifiedModel<ReactionRoleSchema>;
    RemindersModel: SimplifiedModel<ReminderSchema>;
    RulesModel: SimplifiedModel<RuleSchema>;
    SetupModel: SimplifiedModel<SetupSchema>;
    StickyRolesModel: SimplifiedModel<StickyRoleSchema>;
    TodoModel: SimplifiedModel<TodoSchema>;
    WelcomeModel: SimplifiedModel<WelcomeSchema>;
}

export type DocumentFrom<
    T extends BaseSchema | (Omit<BaseSchema, '_id'> & { readonly _id: string }) = BaseSchema,
    IncludeId extends boolean = false
> = Omit<
    T, IncludeId extends true ? Exclude<keyof BaseSchema, '_id'> : keyof BaseSchema
> & (IncludeId extends true ? { readonly _id: string } : object);

export type ModelFrom<
    T extends BaseSchema | (Omit<BaseSchema, '_id'> & { readonly _id: string }) = BaseSchema,
    IncludeId extends boolean = boolean
> = Model<
    DocumentFrom<T, IncludeId>
>;

export type TimeBasedModerationType = 'mute' | 'temp-ban' | 'time-out';

export type ModerationType = TimeBasedModerationType | 'ban' | 'kick' | 'soft-ban' | 'warn';

export interface BaseSchema {
    readonly _id: Types.ObjectId;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

export interface BaseSchemaWithTimestamps extends Require<BaseSchema, 'createdAt' | 'updatedAt'> { }

export interface ActiveSchema extends Omit<BaseSchemaWithTimestamps, '_id'> {
    readonly _id: string;
    type: TimeBasedModerationType | 'temp-role';
    guild: Snowflake;
    userId: Snowflake;
    userTag: string;
    role: Snowflake;
    duration: number;
}

export interface AfkSchema extends BaseSchemaWithTimestamps {
    guild: Snowflake;
    user: Snowflake;
    status: string;
}

export interface DisabledSchema extends BaseSchema {
    guild?: Snowflake;
    global: boolean;
    commands: string[];
    groups: string[];
}

export interface ErrorSchema extends Omit<BaseSchemaWithTimestamps, '_id'> {
    readonly _id: string;
    type: string;
    name: string;
    message: string;
    command?: string | undefined;
    files: string;
}

export interface FaqSchema extends BaseSchema {
    question: string;
    answer: string;
}

export interface ModerationSchema extends Omit<BaseSchemaWithTimestamps, '_id'> {
    readonly _id: string;
    type: ModerationType;
    guild: Snowflake;
    userId: Snowflake;
    userTag: string;
    modId: Snowflake;
    modTag: string;
    reason: string;
    duration: string;
}

export interface McIpSchema extends BaseSchema {
    guild: Snowflake;
    type: 'bedrock' | 'java';
    ip: string;
    port: number;
}

export interface ModuleSchema extends BaseSchema {
    guild: Snowflake;
    stickyRoles: boolean;
    welcome: boolean;
    auditLogs: {
        boosts: boolean;
        channels: boolean;
        commands: boolean;
        emojis: boolean;
        events: boolean;
        invites: boolean;
        members: boolean;
        messages: boolean;
        moderation: boolean;
        modules: boolean;
        roles: boolean;
        server: boolean;
        stickers: boolean;
        threads: boolean;
        users: boolean;
        voice: boolean;
    };
}

export type Module = 'audit-logs' | 'sticky-roles' | 'welcome';

export type AuditLog = keyof ModuleSchema['auditLogs'];

export interface PrefixSchema extends BaseSchema {
    global: boolean;
    guild?: Snowflake;
    prefix: string;
}

export interface PollSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
    emojis: Array<Snowflake | string>;
    duration: number;
}

export interface ReactionRoleSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: Snowflake;
    roles: Snowflake[];
    emojis: Array<Snowflake | string>;
}

export interface ReminderSchema extends BaseSchemaWithTimestamps {
    user: Snowflake;
    reminder: string;
    remindAt: number;
    message: Snowflake;
    msgURL: string;
    channel: Snowflake;
}

export interface RuleSchema extends BaseSchema {
    guild: Snowflake;
    rules: string[];
}

export interface SetupSchema extends BaseSchema {
    guild: Snowflake;
    logsChannel: Snowflake;
    memberRole: Snowflake;
    botRole: Snowflake;
    mutedRole: Snowflake;
    lockChannels: Snowflake[];
}

export interface StickyRoleSchema extends BaseSchema {
    guild: Snowflake;
    user: Snowflake;
    roles: Snowflake[];
}

export interface TodoSchema extends BaseSchema {
    user: Snowflake;
    list: string[];
}

export interface WelcomeSchema extends BaseSchema {
    guild: Snowflake;
    channel: Snowflake;
    message: string;
}

//#endregion
