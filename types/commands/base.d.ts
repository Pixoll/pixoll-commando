/// <reference types="node" />
import { Message, PermissionsString, User, ChatInputApplicationCommandData, RESTPostAPIChatInputApplicationCommandsJSONBody as RESTPostAPISlashCommand, Awaitable } from 'discord.js';
import ArgumentCollector, { ArgumentCollectorResult, ParseRawArguments } from './collector';
import CommandoClient from '../client';
import CommandGroup from './group';
import { ArgumentInfo, ArgumentInfoResolvable } from './argument';
import CommandoMessage from '../extensions/message';
import CommandoInteraction from '../extensions/interaction';
import { CommandoAutocompleteInteraction, CommandoGuildResolvable } from '../discord.overrides';
/** Options for throttling usages of the command. */
export interface ThrottlingOptions {
    /** Maximum number of usages of the command allowed in the time frame. */
    usages: number;
    /** Amount of time to count the usages of the command within (in seconds). */
    duration: number;
}
export type CommandArgumentsResolvable = ArgumentInfoResolvable[] | readonly ArgumentInfoResolvable[];
/** The command information */
export interface CommandInfo<InGuild extends boolean = boolean, Args extends CommandArgumentsResolvable = ArgumentInfo[]> {
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
    /**
     * Whether to automatically generate a slash command. This may not always work as you intend.
     * It's recommended to manually specify options for the slash command.
     * - No options will be generated if you specified your own.
     * - Check {@link argumentTypeMap ArgumentTypeMap} for details on how each argument type
     * is parsed.
     * - Arguments without a type will be skipped.
     * - If an argument as multiple types, the parser will choose the first one.
     * @default false
     */
    autogenerateSlashCommand?: boolean;
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
export type CommandContext<InGuild extends boolean = boolean> = CommandoInteraction<InGuild> | CommandoMessage<InGuild>;
/** The reason of {@link Command#onBlock} */
export type CommandBlockReason = 'clientPermissions' | 'dmOnly' | 'guildOnly' | 'guildOwnerOnly' | 'modPermissions' | 'nsfw' | 'ownerOnly' | 'throttling' | 'userPermissions';
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
export interface SlashCommandInfo extends Omit<ChatInputApplicationCommandData, 'defaultMemberPermissions' | 'description' | 'dmPermission' | 'name' | 'type'> {
    /** Whether the deferred reply should be ephemeral or not */
    deferEphemeral?: boolean;
}
export type APISlashCommand = Required<Pick<SlashCommandInfo, 'deferEphemeral'>> & RESTPostAPISlashCommand;
/**
 * A command that can be run in a client
 * @example
 * ```ts
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
 * ```
 */
export default abstract class Command<InGuild extends boolean = boolean, Args extends CommandArgumentsResolvable = ArgumentInfo[]> {
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
    argsCollector: ArgumentCollector<Args> | null;
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
    slashInfo: APISlashCommand | null;
    /** Whether the command is enabled globally */
    protected _globalEnabled: boolean;
    /** Current throttle objects for the command, mapped by user ID */
    protected _throttles: Map<string, Throttle>;
    /**
     * @param client - The client the command is for
     * @param info - The command information
     * @param slashInfo - The slash command information
     */
    constructor(client: CommandoClient, info: CommandInfo<InGuild, Args>, slashInfo?: SlashCommandInfo);
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
    abstract run(context: CommandContext<InGuild>, args: ParseRawArguments<Args> | string[] | string, fromPattern?: boolean, result?: ArgumentCollectorResult | null): Awaitable<Message | Message[] | null | void>;
    /**
     * Run the slash command auto-complete interaction logic.
     * @param interaction - The auto-complete interaction
     */
    runAutocomplete?(interaction: CommandoAutocompleteInteraction): Awaitable<unknown>;
    /**
     * Checks whether the user has permission to use the command
     * @param context - The triggering command context
     * @param ownerOverride - Whether the bot owner(s) will always have permission
     * @return Whether the user has permission, or an error message to respond with if they don't
     */
    hasPermission(context: CommandContext<InGuild>, ownerOverride?: boolean): CommandBlockReason | PermissionsString[] | true;
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
    onBlock(context: CommandContext, reason: CommandBlockReason, data?: CommandBlockData): Promise<Message | null>;
    /**
     * Called when the command produces an error while running
     * @param err - Error that was thrown
     * @param context - The context the command is being run for
     * @param args - Arguments for the command (see {@link Command#run})
     * @param fromPattern - Whether the args are pattern matches (see {@link Command#run})
     * @param result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command#run})
     */
    onError(err: Error, context: CommandContext, args: Record<string, unknown> | string[] | string, fromPattern?: boolean, result?: ArgumentCollectorResult | null): Promise<Message | Message[] | null>;
    /**
     * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
     * @param userId - ID of the user to throttle for
     */
    protected throttle(userId: string): Throttle | null;
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
     * @param context - The command context
     */
    isUsable(context?: CommandContext<InGuild>): boolean;
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
    toString(): string;
    /**
     * Creates a usage string for a command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    static usage(command: string, prefix?: string | null, user?: User | null): string;
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
}
