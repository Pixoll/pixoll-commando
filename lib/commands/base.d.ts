/// <reference types="node" />
import { APIMessage } from 'discord-api-types/payloads/v9/channel';
import { RESTPostAPIChatInputApplicationCommandsJSONBody as RestAPIApplicationCommand } from 'discord-api-types/rest/v9';
import { GuildResolvable, Message, PermissionString, User } from 'discord.js';
import ArgumentCollector, { ArgumentCollectorResult } from './collector';
import CommandoClient from '../client';
import CommandGroup from './group';
import { CommandoInteraction } from '../dispatcher';
import { ArgumentInfo } from './argument';
import CommandoMessage from '../extensions/message';
import CommandoGuild from '../extensions/guild';
/** Options for throttling usages of the command. */
interface ThrottlingOptions {
    /** Maximum number of usages of the command allowed in the time frame. */
    usages: number;
    /** Amount of time to count the usages of the command within (in seconds). */
    duration: number;
}
/** The command information */
interface CommandInfo {
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
    guildOnly?: boolean;
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
    clientPermissions?: PermissionString[];
    /** Permissions required by the user to use the command. */
    userPermissions?: PermissionString[];
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
     * The data for the slash command, or `true` to use the same information as the message command.
     * @default false
     */
    slash?: SlashCommandInfo | boolean;
    /**
     * Whether the slash command will be registered in the test guild only or not.
     * @default false
     */
    test?: boolean;
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
    argsType?: 'single' | 'multiple';
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
    replacing?: string;
}
/** Throttling object of the command. */
interface Throttle {
    /** Time when the throttle started */
    start: number;
    /** Amount usages of the command */
    usages: number;
    /** Timeout function for this throttle */
    timeout: NodeJS.Timeout;
}
/** The instances the command is being run for */
export interface CommandInstances {
    /** The message the command is being run for */
    message?: CommandoMessage | null;
    /** The interaction the command is being run for */
    interaction?: CommandoInteraction | null;
}
/** The reason of {@link Command#onBlock} */
export declare type CommandBlockReason = 'guildOnly' | 'nsfw' | 'dmOnly' | 'guildOwnerOnly' | 'ownerOnly' | 'userPermissions' | 'modPermissions' | 'clientPermissions' | 'throttling';
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
    missing?: PermissionString[];
}
/** The slash command information */
interface SlashCommandInfo {
    /** The name of the command (must be lowercase, 1-32 characters) - defaults to {@link CommandInfo}'s `name` */
    name?: string;
    /** A short description of the command (1-100 characters) - defaults to {@link CommandInfo}'s `description` */
    description?: string;
    /** Options for the command */
    options?: SlashCommandOptionInfo[];
    /**
     * Whether the reply of the slash command should be ephemeral or not
     * @default false
     */
    ephemeral?: boolean;
}
interface SlashCommandOptionInfo {
    /** The type of the option */
    type: SlashCommandOptionType;
    /** The name of the option */
    name: string;
    /** The description of the option - required if `type` is `subcommand` or `subcommand-group` */
    description: string;
    /**
     * Whether the option is required or not
     * @default false
     */
    required?: boolean;
    /** The minimum value permitted - only usable if `type` is `integer` or `number` */
    minValue?: number;
    /** The maximum value permitted - only usable if `type` is `integer` or `number` */
    maxValue?: number;
    /** The choices options for the option - only usable if `type` is `string`, `integer` or `number` */
    choices?: {
        name: string;
        value: string | number;
    }[];
    /** The type options for the option - only usable if `type` is `channel` */
    channelTypes?: SlashCommandChannelType[];
    /** The options for the sub-command - only usable if `type` is `subcommand` */
    options?: SlashCommandOptionInfo[];
    /** Enable autocomplete interactions for this option - may not be set to true if `choices` are present */
    autocomplete?: boolean;
}
declare type SlashCommandOptionType = 'subcommand' | 'subcommand-group' | 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' | 'mentionable' | 'number';
declare type SlashCommandChannelType = 'guild-text' | 'guild-voice' | 'guild-category' | 'guild-news' | 'guild-news-thread' | 'guild-public-thread' | 'guild-private-thread' | 'guild-stage-voice';
/** A command that can be run in a client */
export default abstract class Command {
    /** Client that this command is for */
    readonly client: CommandoClient;
    /** Name of this command */
    name: string;
    /** Aliases for this command */
    aliases: string[];
    /** ID of the group the command belongs to */
    groupId: string;
    /** The group the command belongs to, assigned upon registration */
    group: CommandGroup | null;
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
    guildOnly: boolean;
    /** Whether the command can only be used by a server owner */
    guildOwnerOnly: boolean;
    /** Whether the command can only be used by an owner */
    ownerOnly: boolean;
    /** Permissions required by the client to use the command. */
    clientPermissions: PermissionString[] | null;
    /** Permissions required by the user to use the command. */
    userPermissions: PermissionString[] | null;
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
    argsType: 'single' | 'multiple';
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
    /**
     * The name or alias of the command that is replacing the deprecated command. Required if `deprecated` is `true`.
     */
    replacing: string | null;
    /** Whether this command will be registered in the test guild only or not */
    test: boolean;
    /** The data for the slash command */
    slash: SlashCommandInfo | boolean;
    /** Whether the command is enabled globally */
    protected _globalEnabled: boolean;
    /** The slash command data to send to the API */
    protected _slashToAPI: RestAPIApplicationCommand | null;
    /** Current throttle objects for the command, mapped by user ID */
    protected _throttles: Map<string, Throttle>;
    /**
     * @param client - The client the command is for
     * @param info - The command information
     */
    constructor(client: CommandoClient, info: CommandInfo);
    /**
     * Checks whether the user has permission to use the command
     * @param instances - The triggering command instances
     * @param ownerOverride - Whether the bot owner(s) will always have permission
     * @return Whether the user has permission, or an error message to respond with if they don't
     */
    hasPermission(instances: CommandInstances, ownerOverride?: boolean): true | CommandBlockReason | PermissionString[];
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
     * @return {Promise<?Message|?Array<Message>>}
     */
    run(instances: CommandInstances, args: Record<string, unknown> | string | string[], fromPattern?: boolean, result?: ArgumentCollectorResult | null): Promise<Message | Array<Message> | null>;
    /**
     * Called when the command is prevented from running
     * @param instances - The instances the command is being run for
     * @param reason - Reason that the command was blocked
     * @param data - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
     * - userPermissions & clientPermissions: `missing` ({@link Array}<{@link string}>) permission names
     */
    onBlock(instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData): Promise<Message | APIMessage | null>;
    /**
     * Called when the command produces an error while running
     * @param err - Error that was thrown
     * @param instances - The instances the command is being run for
     * @param args - Arguments for the command (see {@link Command#run})
     * @param fromPattern - Whether the args are pattern matches (see {@link Command#run})
     * @param result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command#run})
     */
    onError(err: Error, instances: CommandInstances, args: Record<string, unknown> | string | string[], fromPattern?: boolean, result?: ArgumentCollectorResult | null): Promise<Message | Message[] | null>;
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
    setEnabledIn(guild: GuildResolvable | null, enabled: boolean): void;
    /**
     * Checks if the command is enabled in a guild
     * @param guild - Guild to check in
     * @param bypassGroup - Whether to bypass checking the group's status
     */
    isEnabledIn(guild: CommandoGuild | GuildResolvable | null, bypassGroup?: boolean): boolean;
    /**
     * Checks if the command is usable for a message
     * @param instances - The instances
     */
    isUsable(instances?: CommandInstances): boolean;
    /**
     * Creates a usage string for the command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    usage(argString?: string, prefix?: string | undefined | null, user?: User | null): string;
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
    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    protected static validateInfo(client: CommandoClient, info: CommandInfo): void;
    /**
     * Parses the slash command information, so it's usable by the API
     * @param info - Info to parse
     */
    protected static parseSlash(info: SlashCommandInfo | SlashCommandOptionInfo[]): RestAPIApplicationCommand;
}
export {};
