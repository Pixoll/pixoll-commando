import {
    Message,
    EmbedBuilder,
    PermissionsString,
    User,
    Colors,
    SlashCommandBuilder,
    PermissionsBitField,
    ApplicationCommandOptionType as SlashCommandOptionType,
    ApplicationCommandOptionBase,
    ApplicationCommandOptionData as SlashCommandOptionData,
    APIApplicationCommandOption,
    APIApplicationCommandOptionChoice,
    SharedNameAndDescription,
    SharedSlashCommandOptions,
    ChatInputApplicationCommandData,
    RESTPostAPIContextMenuApplicationCommandsJSONBody as APIContextMenuCommand,
    RESTPostAPIChatInputApplicationCommandsJSONBody as RESTPostAPISlashCommand,
    Awaitable,
    MessageCreateOptions,
    ChannelType,
    ContextMenuCommandType,
    LocalizationMap,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
} from 'discord.js';
import path from 'path';
import ArgumentCollector, { ArgumentCollectorResult, ParseRawArguments } from './collector';
import Util, { Require } from '../util';
import CommandoClient from '../client';
import CommandGroup from './group';
import { ArgumentInfo, ArgumentInfoResolvable } from './argument';
import CommandoMessage from '../extensions/message';
import CommandoGuild from '../extensions/guild';
import CommandoInteraction from '../extensions/interaction';
import {
    CommandoAutocompleteInteraction,
    CommandoGuildMember,
    CommandoGuildResolvable,
    CommandoMessageContextMenuCommandInteraction,
    CommandoUserContextMenuCommandInteraction,
} from '../discord.overrides';

/** Options for throttling usages of the command. */
export interface ThrottlingOptions {
    /** Maximum number of usages of the command allowed in the time frame. */
    usages: number;
    /** Amount of time to count the usages of the command within (in seconds). */
    duration: number;
}

export type CommandArgumentsResolvable = ArgumentInfoResolvable[] | readonly ArgumentInfoResolvable[];

/** The command information */
export interface CommandInfo<
    InGuild extends boolean = boolean,
    Args extends CommandArgumentsResolvable = ArgumentInfo[]
> {
    /** The name of the command (must be lowercase). */
    name: string;
    /** Localizations map for the command's name - only used in application commands */
    nameLocalizations?: LocalizationMap;
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
    /** Localizations map for the command's description - only used in slash commands */
    descriptionLocalizations?: LocalizationMap;
    /** The command usage format string - will be automatically generated if not specified, and `args` is specified. */
    format?: string;
    /** A detailed description of the command and its functionality. */
    detailedDescription?: string;
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
     * Whether the application commands will be registered in the test guild only.
     * @default false
     */
    testAppCommand?: boolean;
    /** Arguments for the command. */
    args?: Args;
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
     * Whether to hide the command from {@link Command.onBlock Command#onBlock} responses.
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
    /**
     * Whether to automatically generate a slash command. This may not always work as you intend.
     * It's recommended to manually specify options for the slash command.
     * - No options will be generated if you specified your own.
     * - Check {@link ArgumentTypeToSlashMap} for details on how each argument type
     * is parsed.
     * - Arguments without a type will be skipped.
     * - If an argument as multiple types, the parser will choose the first one.
     * @default false
     */
    autogenerateSlashCommand?: boolean;
    /** Types of context menu commands to register. */
    contextMenuCommandTypes?: ContextMenuCommandType[];
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

/** The context that ran the command */
export type CommandContext<InGuild extends boolean = boolean> =
    | CommandoInteraction<InGuild>
    | CommandoMessage<InGuild>;

/** The reason of {@link Command.onBlock Command#onBlock} */
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

type OmittedChatInputDataKeys =
    | 'defaultMemberPermissions'
    | 'description'
    | 'descriptionLocalizations'
    | 'dmPermission'
    | 'name'
    | 'nameLocalizations'
    | 'type';

export interface SlashCommandInfo extends Omit<ChatInputApplicationCommandData, OmittedChatInputDataKeys> {
    /** Whether the deferred reply should be ephemeral or not */
    deferEphemeral?: boolean;
}

export type APISlashCommand =
    & Require<RESTPostAPISlashCommand, 'type'>
    & Required<Pick<SlashCommandInfo, 'deferEphemeral'>>;

type BasicSlashCommandOptionData = Exclude<SlashCommandOptionData, {
    type: SlashCommandOptionType.Subcommand | SlashCommandOptionType.SubcommandGroup;
}>;

const argumentTypeToSlashMap/* : Record<ArgumentTypeString, SlashCommandOptionType> */ = {
    boolean: SlashCommandOptionType.Boolean,
    'category-channel': SlashCommandOptionType.Channel,
    channel: SlashCommandOptionType.Channel,
    command: SlashCommandOptionType.String,
    date: SlashCommandOptionType.String,
    'default-emoji': SlashCommandOptionType.String,
    duration: SlashCommandOptionType.String,
    float: SlashCommandOptionType.Number,
    group: SlashCommandOptionType.String,
    'guild-emoji': SlashCommandOptionType.String,
    integer: SlashCommandOptionType.Integer,
    invite: SlashCommandOptionType.String,
    member: SlashCommandOptionType.User,
    message: SlashCommandOptionType.String,
    role: SlashCommandOptionType.Role,
    'stage-channel': SlashCommandOptionType.Channel,
    string: SlashCommandOptionType.String,
    'text-channel': SlashCommandOptionType.Channel,
    'thread-channel': SlashCommandOptionType.Channel,
    time: SlashCommandOptionType.String,
    user: SlashCommandOptionType.User,
    'voice-channel': SlashCommandOptionType.Channel,
} as const;

export type ArgumentTypeToSlashMap = typeof argumentTypeToSlashMap;

type ChannelTypeMapKey = keyof {
    -readonly [P in keyof ArgumentTypeToSlashMap as ArgumentTypeToSlashMap[P] extends
    SlashCommandOptionType.Channel ? P : never
    ]: SlashCommandOptionType.Channel;
};

const channelTypeMap: Record<ChannelTypeMapKey, ChannelType[] | null[]> = {
    'category-channel': [ChannelType.GuildCategory],
    channel: [null],
    'stage-channel': [ChannelType.GuildStageVoice],
    'text-channel': [ChannelType.GuildText],
    'thread-channel': [
        ChannelType.AnnouncementThread,
        ChannelType.PrivateThread,
        ChannelType.PublicThread,
    ],
    'voice-channel': [ChannelType.GuildVoice],
};

/**
 * A command that can be run in a client
 * @example
 * import { ApplicationCommandOptionType } from 'discord.js';
 * import { CommandoClient, Command, CommandContext, ParseRawArguments } from 'pixoll-commando';
 * 
 * const args = [{
 *     key: 'first',
 *     prompt: 'First argument.',
 *     type: 'user',
 * }, {
 *     key: 'optional',
 *     prompt: 'Optional argument.',
 *     type: 'string',
 *     required: false,
 * }] as const;
 * 
 * type RawArgs = typeof args;
 * type ParsedArgs = ParseRawArguments<RawArgs>;
 * 
 * export default class TestCommand extends Command<boolean, RawArgs> {
 *     public constructor(client: CommandoClient) {
 *         super(client, {
 *             name: 'test',
 *             description: 'Test command.',
 *             group: 'commands',
 *             args,
 *         }, {
 *             options: [{
 *                 name: 'first',
 *                 description: 'First argument.',
 *                 type: ApplicationCommandOptionType.User,
 *                 required: true,
 *             }, {
 *                 name: 'optional',
 *                 description: 'Optional argument.',
 *                 type: ApplicationCommandOptionType.String,
 *             }],
 *         });
 *     }
 * 
 *     public async run(context: CommandContext, args: ParsedArgs): Promise<void> {
 *         const content = `\`${context.toString()}\`: ${args.first}, ${args.optional}`;
 *         if ('isEditable' in context && context.isEditable()) {
 *             await context.editReply(content);
 *             return;
 *         }
 *         await context.reply(content);
 *     }
 * }
 */
export default abstract class Command<
    InGuild extends boolean = boolean,
    Args extends CommandArgumentsResolvable = CommandArgumentsResolvable
> {
    /** Client that this command is for */
    declare public readonly client: CommandoClient;
    /** Name of this command */
    public name: string;
    /** Aliases for this command */
    public aliases: string[];
    /** ID of the group the command belongs to */
    public groupId: string;
    /** The group the command belongs to, assigned upon registration */
    declare public group: CommandGroup;
    /** Name of the command within the group */
    public memberName: string;
    /** Short description of the command */
    public description: string;
    /** Usage format string of the command */
    public format: string | null;
    /** Long description of the command */
    public details: string | null;
    /** Example usage strings */
    public examples: string[] | null;
    /** Whether the command can only be run in direct messages */
    public dmOnly: boolean;
    /** Whether the command can only be run in a guild channel */
    public guildOnly: InGuild;
    /** Whether the command can only be used by a server owner */
    public guildOwnerOnly: boolean;
    /** Whether the command can only be used by an owner */
    public ownerOnly: boolean;
    /** Permissions required by the client to use the command. */
    public clientPermissions: PermissionsString[] | null;
    /** Permissions required by the user to use the command. */
    public userPermissions: PermissionsString[] | null;
    /** Whether this command's user permissions are based on "moderator" permissions */
    public modPermissions: boolean;
    /** Whether the command can only be used in NSFW channels */
    public nsfw: boolean;
    /** Whether the default command handling is enabled for the command */
    public defaultHandling: boolean;
    /** Options for throttling command usages */
    public throttling: ThrottlingOptions | null;
    /** The argument collector for the command */
    public argsCollector: ArgumentCollector<Args> | null;
    /** How the arguments are split when passed to the command's run method */
    public argsType: 'multiple' | 'single';
    /** Maximum number of arguments that will be split */
    public argsCount: number;
    /** Whether single quotes are allowed to encapsulate an argument */
    public argsSingleQuotes: boolean;
    /** Regular expression triggers */
    public patterns: RegExp[] | null;
    /** Whether the command is protected from being disabled */
    public guarded: boolean;
    /** Whether the command should be hidden from the help command */
    public hidden: boolean;
    /** Whether the command will be run when an unknown command is used */
    public unknown: boolean;
    /** Whether the command is marked as deprecated */
    public deprecated: boolean;
    /** The name or alias of the command that is replacing the deprecated command. Required if `deprecated` is `true`. */
    public deprecatedReplacement: string | null;
    /** Whether the application commands will be registered in the test guild only */
    public testAppCommand: boolean;
    /** Data for the slash command */
    public slashCommand: APISlashCommand | null;
    /** Data for the context menu commands */
    public contextMenuCommands: APIContextMenuCommand[];
    /** Whether the command is enabled globally */
    protected _globalEnabled: boolean;
    /** Current throttle objects for the command, mapped by user ID */
    protected _throttles: Map<string, Throttle>;

    /**
     * @param client - The client the command is for
     * @param info - The command information
     * @param slashInfo - The slash command information
     */
    public constructor(client: CommandoClient, info: CommandInfo<InGuild, Args>, slashInfo?: SlashCommandInfo) {
        Command.validateInfo(client, info as CommandInfo);

        Object.defineProperty(this, 'client', { value: client });

        this.name = info.name;
        this.aliases = info.aliases ?? [];
        if (info.autoAliases) {
            if (this.name.includes('-')) this.aliases.push(this.name.replace(/-/g, ''));
            for (const alias of this.aliases) {
                if (alias.includes('-')) this.aliases.push(alias.replace(/-/g, ''));
            }
        }

        this.groupId = info.group;
        this.memberName = info.memberName ?? this.name;
        this.description = info.description;
        this.format = info.format ?? null;
        this.details = info.detailedDescription ?? null;
        this.examples = info.examples ?? null;
        this.dmOnly = !!info.dmOnly;
        this.guildOnly = !!info.guildOnly as InGuild;
        this.guildOwnerOnly = !!info.guildOwnerOnly;
        this.ownerOnly = !!info.ownerOnly;
        this.clientPermissions = info.clientPermissions ?? null;
        this.userPermissions = info.userPermissions ?? null;
        this.modPermissions = !!info.modPermissions;
        this.nsfw = !!info.nsfw;
        this.defaultHandling = info.defaultHandling ?? true;
        this.throttling = info.throttling ?? null;
        this.argsCollector = info.args?.length
            ? new ArgumentCollector<Args>(client, info.args, info.argsPromptLimit)
            : null;
        if (this.argsCollector && !info.format) {
            this.format = this.argsCollector.args.reduce((prev, arg) => {
                const wrapL = arg.required ? '[' : '<';
                const wrapR = arg.required ? ']' : '>';
                return `${prev}${prev ? ' ' : ''}${wrapL}${arg.label}${arg.infinite ? '...' : ''}${wrapR}`;
            }, '');
        }

        this.argsType = info.argsType ?? 'single';
        this.argsCount = info.argsCount ?? 0;
        this.argsSingleQuotes = info.argsSingleQuotes ?? true;
        this.patterns = info.patterns ?? null;
        this.guarded = !!info.guarded;
        this.hidden = !!info.hidden;
        this.unknown = !!info.unknown;
        this.deprecated = !!info.deprecated;
        this.deprecatedReplacement = info.deprecatedReplacement ?? null;
        this.testAppCommand = !!info.testAppCommand;
        this.slashCommand = Command.validateAndParseSlashInfo(info as CommandInfo, slashInfo);
        this.contextMenuCommands = Command.validateAndParseContextMenuInfo(info as CommandInfo);
        this._globalEnabled = true;
        this._throttles = new Map();
    }

    /**
     * Runs the command
     * @param context - The context of the command
     * @param args - The arguments for the command, or the matches from a pattern.
     * If args is specified on the command, this will be the argument values object. If argsType is single, then only
     * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
     * matches array from the pattern match (see
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec RegExp#exec}).
     * @param fromPattern - Whether or not the command is being run from a pattern match
     * @param result - Result from obtaining the arguments from the collector (if applicable)
     */
    public abstract run(
        context: CommandContext<InGuild>,
        args: ParseRawArguments<Args> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult | null
    ): Awaitable<Message | Message[] | null | void>;

    /**
     * Run the slash command auto-complete interaction logic.
     * @param interaction - The auto-complete interaction
     */
    public runAutocomplete?(interaction: CommandoAutocompleteInteraction): Awaitable<void>;

    /**
     * Run the slash command auto-complete interaction logic.
     * @param interaction - The auto-complete interaction
     */
    public runMessageContextMenu?(interaction: CommandoMessageContextMenuCommandInteraction): Awaitable<void>;

    /**
     * Run the slash command auto-complete interaction logic.
     * @param interaction - The auto-complete interaction
     */
    public runUserContextMenu?(interaction: CommandoUserContextMenuCommandInteraction): Awaitable<void>;

    /**
     * Checks whether the user has permission to use the command
     * @param context - The triggering command context
     * @param ownerOverride - Whether the bot owner(s) will always have permission
     * @return Whether the user has permission, or an error message to respond with if they don't
     */
    public hasPermission(
        context: CommandContext<InGuild>, ownerOverride = true
    ): CommandBlockReason | PermissionsString[] | true {
        const { guildOwnerOnly, ownerOnly, userPermissions, modPermissions, client } = this;
        const { channel, guild, member, author } = context;

        if (!guildOwnerOnly && !ownerOnly && !userPermissions && !modPermissions) return true;
        if (ownerOverride && client.isOwner(author)) return true;

        if (ownerOnly && !client.isOwner(author)) {
            return 'ownerOnly';
        }

        if (guildOwnerOnly && guild?.ownerId !== author.id) {
            return 'guildOwnerOnly';
        }

        if (channel && !channel.isDMBased()) {
            if (member && modPermissions && !isModerator(member)) {
                return 'modPermissions';
            }
            if (userPermissions) {
                const missing = channel.permissionsFor(author)?.missing(userPermissions, false) ?? [];
                if (missing.length > 0) return missing;
            }
        }

        return true;
    }

    /**
     * Called when the command is prevented from running
     * @param context - The context og the command
     * @param reason - Reason that the command was blocked
     * @param data - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Throttle}), `remaining` (number) time in seconds
     * - userPermissions & clientPermissions: `missing` (Array<string>) permission names
     */
    public async onBlock(
        context: CommandContext, reason: CommandBlockReason, data: CommandBlockData = {}
    ): Promise<Message | null> {
        const { name, hidden } = this;
        if (hidden) return null;

        const { missing, remaining } = data;
        const useCommandOnlyIf = (location: string): string => `The \`${name}\` command can only be used ${location}.`;

        switch (reason) {
            case 'dmOnly':
                return replyContext(context, embed(useCommandOnlyIf('in direct messages')));
            case 'guildOnly':
                return replyContext(context, embed(useCommandOnlyIf('in a server channel')));
            case 'guildOwnerOnly':
                return replyContext(context, embed(useCommandOnlyIf('by the server\'s owner')));
            case 'nsfw':
                return replyContext(context, embed(useCommandOnlyIf('in a NSFW channel')));
            case 'ownerOnly':
                return replyContext(context, embed(useCommandOnlyIf('by the bot\'s owner')));
            case 'userPermissions': {
                if (!missing) {
                    throw new Error('Missing permissions array must be specified for "userPermissions" case');
                }
                return replyContext(context, embed(
                    'You are missing the following permissions:',
                    missing.map(perm => `\`${Util.permissions[perm]}\``).join(', ')
                ));
            }
            case 'modPermissions':
                return replyContext(context, embed(
                    useCommandOnlyIf('by "moderators"'),
                    'For more information visit the `page 3` of the `help` command.'
                ));
            case 'clientPermissions': {
                if (!missing) {
                    throw new Error('Missing permissions array must be specified for "clientPermissions" case');
                }
                return replyContext(context, embed(
                    'The bot is missing the following permissions:',
                    missing.map(perm => `\`${Util.permissions[perm]}\``).join(', ')
                ));
            }
            case 'throttling': {
                if (!remaining) {
                    throw new Error('Remaining time value must be specified for "throttling" case');
                }
                return replyContext(context, embed(
                    `Please wait **${remaining.toFixed(1)} seconds** before using the \`${name}\` command again.`
                ));
            }
        }
    }

    /**
     * Called when the command produces an error while running
     * @param err - Error that was thrown
     * @param context - The context the command is being run for
     * @param args - Arguments for the command (see {@link Command.run Command#run})
     * @param fromPattern - Whether the args are pattern matches (see {@link Command.run Command#run})
     * @param result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command.run Command#run})
     */
    public async onError(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        err: Error, context: CommandContext, args: Record<string, unknown> | string[] | string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        fromPattern?: boolean, result?: ArgumentCollectorResult | null
    ): Promise<Message | Message[] | null> {
        return null;
    }

    /**
     * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
     * @param userId - ID of the user to throttle for
     */
    protected throttle(userId: string): Throttle | null {
        const { throttling, _throttles, client } = this;
        if (!throttling || client.isOwner(userId)) return null;

        let throttle = _throttles.get(userId);
        if (!throttle) {
            throttle = {
                start: Date.now(),
                usages: 0,
                timeout: setTimeout(() => {
                    _throttles.delete(userId);
                }, throttling.duration * 1000),
            };
            _throttles.set(userId, throttle);
        }

        return throttle;
    }

    /**
     * Enables or disables the command in a guild
     * @param guild - Guild to enable/disable the command in
     * @param enabled - Whether the command should be enabled or disabled
     */
    public setEnabledIn(guild: CommandoGuildResolvable | null, enabled: boolean): void {
        const { client, guarded } = this;
        if (typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        if (guarded) throw new Error('The command is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            client.emit('commandStatusChange', null, this as unknown as Command, enabled);
            return;
        }
        const commandoGuild = client.guilds.resolve(guild) as CommandoGuild;
        commandoGuild.setCommandEnabled(this as unknown as Command, enabled);
    }

    /**
     * Checks if the command is enabled in a guild
     * @param guild - Guild to check in
     * @param bypassGroup - Whether to bypass checking the group's status
     */
    public isEnabledIn(guild: CommandoGuildResolvable | null, bypassGroup?: boolean): boolean {
        const { client, group } = this;
        if (this.guarded) return true;
        if (!guild) return group.isEnabledIn(null) && this._globalEnabled;
        const commandoGuild = client.guilds.resolve(guild) as CommandoGuild;
        return (
            bypassGroup || commandoGuild.isGroupEnabled(group)
        ) && commandoGuild.isCommandEnabled(this as unknown as Command);
    }

    /**
     * Checks if the command is usable for a message
     * @param context - The command context
     */
    public isUsable(context?: CommandContext<InGuild>): boolean {
        if (!context) return this._globalEnabled;
        const { guild } = context;
        if (this.guildOnly && !context.inGuild()) return false;
        const hasPermission = this.hasPermission(context);
        return this.isEnabledIn(guild) && hasPermission === true;
    }

    /**
     * Creates a usage string for the command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    public usage(
        argString?: string, prefix: string | null | undefined = this.client.prefix, user: User | null = this.client.user
    ): string {
        return Command.usage(`${this.name}${argString ? ` ${argString}` : ''}`, prefix, user);
    }

    /** Reloads the command */
    public reload(): void {
        const { client, groupId, memberName } = this;
        const { registry } = client;

        let commandPath = '';
        let cached: NodeModule | undefined;
        let newCommand: Command;
        try {
            commandPath = registry.resolveCommandPath(groupId, memberName);
            cached = require.cache[commandPath];
            delete require.cache[commandPath];
            newCommand = require(commandPath);
        } catch (err) {
            if (cached) require.cache[commandPath] = cached;
            try {
                commandPath = path.join(__dirname, groupId, `${memberName}.js`);
                cached = require.cache[commandPath];
                delete require.cache[commandPath];
                newCommand = require(commandPath);
            } catch (err2) {
                if (cached) require.cache[commandPath] = cached;
                if ((err2 as Error).message.includes('Cannot find module')) {
                    throw err;
                }
                throw err2;
            }
        }

        registry.reregisterCommand(newCommand, this as unknown as Command);
    }

    /** Unloads the command */
    public unload(): void {
        const { client, groupId, memberName } = this;
        const { registry } = client;

        const cmdPath = registry.resolveCommandPath(groupId, memberName);
        if (!require.cache[cmdPath]) throw new Error('Command cannot be unloaded.');
        delete require.cache[cmdPath];
        registry.unregisterCommand(this as unknown as Command);
    }

    public toString(): string {
        return this.name;
    }

    /**
     * Creates a usage string for a command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    public static usage(command: string, prefix: string | null = null, user: User | null = null): string {
        const nbcmd = command.replace(/ /g, '\xa0');
        if (!prefix && !user) return `\`${nbcmd}\``;

        let prefixPart: string | undefined;
        if (prefix) {
            if (prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' ';
            prefix = prefix.replace(/ /g, '\xa0');
            prefixPart = `\`${prefix}${nbcmd}\``;
        }

        let mentionPart: string | undefined;
        if (user) mentionPart = `\`@${user.tag.replace(/ /g, '\xa0')}\xa0${nbcmd}\``;

        return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`;
    }

    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    protected static validateInfo(client: CommandoClient, info: CommandInfo): void {
        if (!client) throw new Error('A client must be specified.');
        if (typeof info !== 'object') throw new TypeError('Command info must be an object.');
        if (typeof info.name !== 'string') throw new TypeError('Command name must be a string.');
        if (info.name !== info.name.toLowerCase()) throw new Error('Command name must be lowercase.');
        if (info.name.replace(/ +/g, '') !== info.name) throw new Error('Command name must not include spaces.');
        if ('aliases' in info) {
            if (!Array.isArray(info.aliases) || info.aliases.some(alias => typeof alias !== 'string')) {
                throw new TypeError('Command aliases must be an Array of strings.');
            }
            if (info.aliases.some(alias => alias !== alias.toLowerCase())) {
                throw new RangeError('Command aliases must be lowercase.');
            }
        }
        if (typeof info.group !== 'string') throw new TypeError('Command group must be a string.');
        if (info.group !== info.group.toLowerCase()) throw new RangeError('Command group must be lowercase.');
        if (typeof info.name !== 'string' && typeof info.memberName !== 'string') {
            throw new TypeError('Command memberName must be a string.');
        }
        if (info.memberName !== info.memberName?.toLowerCase() && info.memberName === 'string') {
            throw new Error('Command memberName must be lowercase.');
        }
        if (typeof info.description !== 'string') throw new TypeError('Command description must be a string.');
        if ('format' in info && typeof info.format !== 'string') throw new TypeError('Command format must be a string.');
        if ('details' in info && typeof info.detailedDescription !== 'string') {
            throw new TypeError('Command details must be a string.');
        }
        if ('examples' in info && (!Array.isArray(info.examples) || info.examples.some(ex => typeof ex !== 'string'))) {
            throw new TypeError('Command examples must be an Array of strings.');
        }
        if ('clientPermissions' in info) {
            if (!Array.isArray(info.clientPermissions)) {
                throw new TypeError('Command clientPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.clientPermissions) {
                if (!Util.permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if ('userPermissions' in info) {
            if (!Array.isArray(info.userPermissions)) {
                throw new TypeError('Command userPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.userPermissions) {
                if (!Util.permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
            }
        }
        if ('throttling' in info) {
            if (typeof info.throttling !== 'object') throw new TypeError('Command throttling must be an object.');
            if (typeof info.throttling.usages !== 'number' || isNaN(info.throttling.usages)) {
                throw new TypeError('Command throttling usages must be a number.');
            }
            if (info.throttling.usages < 1) throw new RangeError('Command throttling usages must be at least 1.');
            if (typeof info.throttling.duration !== 'number' || isNaN(info.throttling.duration)) {
                throw new TypeError('Command throttling duration must be a number.');
            }
            if (info.throttling.duration < 1) throw new RangeError('Command throttling duration must be at least 1.');
        }
        if ('args' in info && !Array.isArray(info.args)) throw new TypeError('Command args must be an Array.');
        if ('argsPromptLimit' in info && typeof info.argsPromptLimit !== 'number') {
            throw new TypeError('Command argsPromptLimit must be a number.');
        }
        if ('argsPromptLimit' in info && info.argsPromptLimit && info.argsPromptLimit < 0) {
            throw new RangeError('Command argsPromptLimit must be at least 0.');
        }
        if ('argsType' in info && info.argsType && !Util.equals(info.argsType, ['single', 'multiple'])) {
            throw new RangeError('Command argsType must be one of "single" or "multiple".');
        }
        if (info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
            throw new RangeError('Command argsCount must be at least 2.');
        }
        if ('patterns' in info && (!Array.isArray(info.patterns) || info.patterns.some(pat => !(pat instanceof RegExp)))) {
            throw new TypeError('Command patterns must be an Array of regular expressions.');
        }
        if (info.deprecated) {
            if (typeof info.deprecatedReplacement !== 'string') {
                throw new TypeError('Command deprecatedReplacement must be a string.');
            }
            if (info.deprecatedReplacement !== info.deprecatedReplacement.toLowerCase()) {
                throw new TypeError('Command deprecatedReplacement must be lowercase.');
            }
        }
    }

    /**
     * Validates the slash command information
     * @param info - Info to validate
     * @param slashInfo - Slash info to validate
     */
    protected static validateAndParseSlashInfo(info: CommandInfo, slashInfo?: SlashCommandInfo): APISlashCommand | null {
        const {
            autogenerateSlashCommand,
            name,
            nameLocalizations = null,
            description,
            descriptionLocalizations = null,
            userPermissions,
            dmOnly,
            guildOnly,
            args,
            testAppCommand,
        } = info;
        if (!slashInfo && !autogenerateSlashCommand) return null;
        const slashOptions = (slashInfo ?? {}).options;
        const memberPermissions = dmOnly ? '0' : (userPermissions && PermissionsBitField.resolve(userPermissions));

        const slash = new SlashCommandBuilder()
            .setName(name)
            .setNameLocalizations(nameLocalizations)
            .setDescription(description)
            .setDescriptionLocalizations(descriptionLocalizations)
            .setDMPermission(!testAppCommand ? !guildOnly : null)
            .setDefaultMemberPermissions(memberPermissions);

        if (slashOptions || args) {
            const options = slashOptions ?? (autogenerateSlashCommand && args
                ? Util.filterNullishItems(args.map(parseMessageArgToSlashOption))
                : null
            );
            if (options) addSlashOptions(slash, options);
        }

        // Validate data
        const validatedData = slash.toJSON();
        removeEmptyOptions(validatedData.options);
        return {
            type: ApplicationCommandType.ChatInput,
            ...validatedData,
            deferEphemeral: !!slashInfo?.deferEphemeral,
        };
    }

    /**
     * Validates the slash command information
     * @param info - Info to validate
     * @param slashInfo - Slash info to validate
     */
    protected static validateAndParseContextMenuInfo(info: CommandInfo): APIContextMenuCommand[] {
        const {
            contextMenuCommandTypes,
            name,
            nameLocalizations = null,
            userPermissions,
            dmOnly,
            guildOnly,
            testAppCommand,
        } = info;
        if (!contextMenuCommandTypes || contextMenuCommandTypes.length === 0) return [];

        const memberPermissions = dmOnly ? '0' : (userPermissions && PermissionsBitField.resolve(userPermissions));
        const contextMenuCommands = contextMenuCommandTypes.map(type => new ContextMenuCommandBuilder()
            .setType(type)
            .setName(name)
            .setNameLocalizations(nameLocalizations)
            .setDMPermission(!testAppCommand ? !guildOnly : null)
            .setDefaultMemberPermissions(memberPermissions)
            .toJSON()
        );

        return contextMenuCommands;
    }
}

function removeEmptyOptions(options?: APIApplicationCommandOption[]): void {
    if (!options) return;
    for (const option of options) {
        if (!('options' in option) || !option.options) continue;
        if (option.options.length === 0) {
            delete option.options;
            continue;
        }
        removeEmptyOptions(option.options);
    }
}

function parseMessageArgToSlashOption(arg: ArgumentInfo): BasicSlashCommandOptionData | null {
    const { key: name, prompt: description, type: rawType, min, max, oneOf, autocomplete } = arg;
    if (!rawType) return null;

    const parsedOptionName = /[A-Z]/.test(name) ? name.replace(/([A-Z]+)/g, '-$1').toLowerCase() : name;
    const required = 'required' in arg ? !!arg.required : !('default' in arg);
    const defaultData: Required<Pick<BasicSlashCommandOptionData, 'description' | 'name' | 'required'>> = {
        name: parsedOptionName,
        description,
        required,
    };
    const argType = Array.isArray(rawType) ? rawType[0] : rawType;
    const type = argumentTypeToSlashMap[argType];

    if (Util.equals(type, [
        SlashCommandOptionType.Boolean, SlashCommandOptionType.User, SlashCommandOptionType.Role,
    ])) return { type, ...defaultData };

    if (type === SlashCommandOptionType.Channel && Util.equals(argType, [
        'category-channel', 'channel', 'text-channel', 'thread-channel', 'stage-channel', 'voice-channel',
    ])) return {
        type,
        ...defaultData,
        channelTypes: Util.filterNullishItems(channelTypeMap[argType]),
    };

    if (type === SlashCommandOptionType.Channel && Array.isArray(rawType) && rawType.every(type => Util.equals(type, [
        'category-channel', 'channel', 'text-channel', 'thread-channel', 'stage-channel', 'voice-channel',
    ]))) return {
        type,
        ...defaultData,
        channelTypes: Util.filterNullishItems(rawType.map(type => channelTypeMap[type as ChannelTypeMapKey]).flat()),
    };

    if (type === SlashCommandOptionType.String) return {
        type,
        ...defaultData,
        maxLength: max,
        minLength: min,
        ...autocomplete && { autocomplete },
        ...!autocomplete && oneOf && {
            choices: oneOf.filter((c): c is string => typeof c === 'string').map(choice => ({
                name: choice,
                value: choice,
            })),
        },
    };

    if (Util.equals(type, [SlashCommandOptionType.Integer, SlashCommandOptionType.Number])) return {
        type,
        ...defaultData,
        maxValue: max,
        minValue: min,
        ...autocomplete && { autocomplete },
        ...!autocomplete && oneOf && {
            choices: oneOf.filter((c): c is number => typeof c === 'number').map(choice => ({
                name: choice.toString(),
                value: choice,
            })),
        },
    };

    return null;
}

type SlashCommandOptionBase =
    | ApplicationCommandOptionBase
    | SharedNameAndDescription;

function createBaseSlashOption(option: SlashCommandOptionData): <T extends SlashCommandOptionBase>(builder: T) => T {
    return <T extends SlashCommandOptionBase>(builder: T): T => {
        builder.setName(option.name)
            .setNameLocalizations(option.nameLocalizations ?? null)
            .setDescription(option.description)
            .setDescriptionLocalizations(option.descriptionLocalizations ?? null);
        if (
            option.type !== SlashCommandOptionType.Subcommand
            && option.type !== SlashCommandOptionType.SubcommandGroup
            && 'setRequired' in builder
        ) builder.setRequired(option.required ?? false);
        return builder;
    };
}

function addSlashOptions<T extends SharedSlashCommandOptions<false> | SlashCommandBuilder>(
    builder: T, options: SlashCommandOptionData[]
): T {
    for (const option of options) {
        const { type: optionType } = option;

        if (optionType === SlashCommandOptionType.Attachment) {
            builder.addAttachmentOption(createBaseSlashOption(option));
        }
        if (optionType === SlashCommandOptionType.Boolean) {
            builder.addBooleanOption(createBaseSlashOption(option));
        }
        if (optionType === SlashCommandOptionType.Channel) {
            builder.addChannelOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                const channelTypes = option.channelTypes ?? option.channel_types;
                if (channelTypes) optBuilder.addChannelTypes(...channelTypes.map(t => t.valueOf()));
                return optBuilder;
            });
        }
        if (optionType === SlashCommandOptionType.Integer) {
            builder.addIntegerOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.autocomplete) optBuilder.setAutocomplete(option.autocomplete);

                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices as Array<APIApplicationCommandOptionChoice<number>>);
                }

                const maxValue = option.maxValue ?? option.max_value;
                if (!Util.isNullish(maxValue)) optBuilder.setMaxValue(maxValue);
                const minValue = option.minValue ?? option.min_value;
                if (!Util.isNullish(minValue)) optBuilder.setMinValue(minValue);

                return optBuilder;
            });
        }
        if (optionType === SlashCommandOptionType.Mentionable) {
            builder.addMentionableOption(createBaseSlashOption(option));
        }
        if (optionType === SlashCommandOptionType.Number) {
            builder.addNumberOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.autocomplete) optBuilder.setAutocomplete(option.autocomplete);

                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices as Array<APIApplicationCommandOptionChoice<number>>);
                }

                const maxValue = option.maxValue ?? option.max_value;
                if (!Util.isNullish(maxValue)) optBuilder.setMaxValue(maxValue);
                const minValue = option.minValue ?? option.min_value;
                if (!Util.isNullish(minValue)) optBuilder.setMinValue(minValue);

                return optBuilder;
            });
        }
        if (optionType === SlashCommandOptionType.Role) {
            builder.addRoleOption(createBaseSlashOption(option));
        }
        if (optionType === SlashCommandOptionType.String) {
            builder.addStringOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.autocomplete) optBuilder.setAutocomplete(option.autocomplete);

                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices as Array<APIApplicationCommandOptionChoice<string>>);
                }

                const maxLength = option.maxLength ?? option.max_length;
                if (!Util.isNullish(maxLength)) optBuilder.setMaxLength(maxLength);
                const minLength = option.minLength ?? option.min_length;
                if (!Util.isNullish(minLength)) optBuilder.setMinLength(minLength);

                return optBuilder;
            });
        }
        if (optionType === SlashCommandOptionType.User) {
            builder.addUserOption(createBaseSlashOption(option));
        }
        if (optionType === SlashCommandOptionType.Subcommand && 'addSubcommand' in builder) {
            builder.addSubcommand(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.options) addSlashOptions(optBuilder, option.options);
                return optBuilder;
            });
        }
        if (optionType === SlashCommandOptionType.SubcommandGroup && 'addSubcommandGroup' in builder) {
            builder.addSubcommandGroup(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (!option.options) return optBuilder;
                for (const subCommand of option.options) {
                    optBuilder.addSubcommand(subBuilder => {
                        createBaseSlashOption(subCommand)(subBuilder);
                        if (subCommand.options) addSlashOptions(subBuilder, subCommand.options);
                        return subBuilder;
                    });
                }
                return optBuilder;
            });
        }
    }

    return builder;
}

/**
 * Creates a basic embed.
 * @param name - The text to fill the embed with.
 * @param value - The value of the field.
 */
function embed(name: string, value?: string): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(Colors.Red);

    if (value) embed.addFields([{ name, value }]);
    else embed.setDescription(name);

    return embed;
}

async function replyContext(
    context: CommandContext, options: EmbedBuilder | Omit<MessageCreateOptions, 'flags'> | string
): Promise<Message | null> {
    if (options instanceof EmbedBuilder) options = { embeds: [options] };
    if (typeof options === 'string') options = { content: options };
    if ('isEditable' in context) {
        if (context.isEditable()) {
            return await context.editReply(options).catch(() => null);
        }
        await context.reply(options).catch(() => null);
        return null;
    }

    Object.assign(options, Util.noReplyPingInDMs(context));
    return await context.reply(options).catch(() => null);
}

const isModConditions: PermissionsString[] = [
    'BanMembers',
    'DeafenMembers',
    'KickMembers',
    'ManageChannels',
    'ManageEmojisAndStickers',
    'ManageGuild',
    'ManageMessages',
    'ManageNicknames',
    'ManageRoles',
    'ManageThreads',
    'ManageWebhooks',
    'MoveMembers',
    'MuteMembers',
];

function isModerator(member: CommandoGuildMember): boolean {
    if (!member) return false;
    const { permissions } = member;
    if (permissions.has('Administrator')) return true;

    const values: boolean[] = [];
    for (const condition of isModConditions) {
        values.push(permissions.has(condition));
    }

    return values.some(b => b === true);
}
