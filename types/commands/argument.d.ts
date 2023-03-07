import { Message, Awaitable } from 'discord.js';
import CommandoClient from '../client';
import { CommandoCategoryChannel, CommandoChannel, CommandoGuildEmoji, CommandoGuildMember, CommandoifiedMessage, CommandoInvite, CommandoRole, CommandoStageChannel, CommandoTextChannel, CommandoThreadChannel, CommandoUser, CommandoVoiceChannel } from '../discord.overrides';
import CommandoMessage from '../extensions/message';
import ArgumentType from '../types/base';
import Command from './base';
import CommandGroup from './group';
type ArgumentCheckerParams<T extends ArgumentTypeString = ArgumentTypeString> = [
    originalMessage: CommandoMessage,
    argument: Argument<T>,
    currentMessage?: CommandoMessage
];
export interface ArgumentTypeStringMap {
    boolean: boolean;
    'category-channel': CommandoCategoryChannel;
    channel: CommandoChannel;
    command: Command;
    date: Date;
    'default-emoji': string;
    duration: number;
    float: number;
    group: CommandGroup;
    'guild-emoji': CommandoGuildEmoji;
    integer: number;
    invite: CommandoInvite;
    member: CommandoGuildMember;
    message: CommandoifiedMessage;
    role: CommandoRole;
    'stage-channel': CommandoStageChannel;
    string: string;
    'text-channel': CommandoTextChannel;
    'thread-channel': CommandoThreadChannel;
    time: Date;
    user: CommandoUser;
    'voice-channel': CommandoVoiceChannel;
}
export type ArgumentTypeString = keyof ArgumentTypeStringMap;
/** Either a value or a function that returns a value. The function is passed the CommandoMessage and the Argument. */
export type ArgumentDefault<T extends ArgumentTypeString = ArgumentTypeString> = ArgumentTypeStringMap[T] | ((msg: CommandoMessage, arg: Argument<T>) => Promise<ArgumentTypeStringMap[T]>);
/** Information for the command argument */
export interface ArgumentInfo<T extends ArgumentTypeString = ArgumentTypeString> {
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
     * in an array for a union type - see {@link CommandoRegistry.registerDefaultTypes registerDefaultTypes} for the
     * built-in types)
     */
    type?: T | T[];
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
    default?: ArgumentDefault<T>;
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
    /** Validator function for the argument (see {@link ArgumentType.validate validate}) */
    validate?: (value: string | undefined, ...args: ArgumentCheckerParams<T>) => Awaitable<boolean | string>;
    /** Parser function for the argument (see {@link ArgumentType.parse parse}) */
    parse?: (value: string, ...args: ArgumentCheckerParams<T>) => Awaitable<ArgumentTypeStringMap[T] | null>;
    /** Empty checker for the argument (see {@link ArgumentType.isEmpty isEmpty}) */
    isEmpty?: (value: string[] | string | undefined, ...args: ArgumentCheckerParams<T>) => boolean;
    /**
     * How long to wait for input (in seconds)
     * @default 30
     */
    wait?: number;
    /**
     * Whether the automatically generated slash option will be flagged as `autocomplete`.
     * This will only work for types {@link ArgumentTypeStringMap.string string},
     * {@link ArgumentTypeStringMap.integer integer} and {@link ArgumentTypeStringMap.float float}.
     * Will only be used if {@link CommandInfo.autogenerateSlashCommand autogenerateSlashCommand} is set to `true` and
     * {@link ArgumentInfo.oneOf oneOf} is not defined.
     */
    autocomplete?: boolean;
}
type ReadonlyArgumentInfo = Readonly<Omit<ArgumentInfo, 'oneOf' | 'type'> & {
    [P in keyof Pick<ArgumentInfo, 'oneOf' | 'type'>]: Pick<ArgumentInfo, 'oneOf' | 'type'>[P] extends Array<infer U> | infer S ? S | readonly U[] : Pick<ArgumentInfo, 'oneOf' | 'type'>[P];
}>;
export type ArgumentInfoResolvable = ArgumentInfo | ReadonlyArgumentInfo;
export type ArgumentResponse = CommandoMessage | Message | null;
/** Result object from obtaining a single {@link Argument}'s value(s) */
export interface ArgumentResult<T extends ArgumentTypeString = ArgumentTypeString> {
    /** Final value(s) for the argument */
    value: ArgumentTypeStringMap[T] | null;
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
/** A fancy argument */
export default class Argument<T extends ArgumentTypeString = ArgumentTypeString> {
    /** Client that this argument is for */
    readonly client: CommandoClient;
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
    type: ArgumentType<T> | null;
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
    default: ArgumentDefault<T> | null;
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
    /**
     * Validator function for validating a value for the argument
     * @see ArgumentType#validate
     */
    protected validator: ArgumentInfo<T>['validate'] | null;
    /**
     * Parser function for parsing a value for the argument
     * @see ArgumentType#parse
     */
    protected parser: ArgumentInfo<T>['parse'] | null;
    /**
     * Function to check whether a raw value is considered empty
     * @see ArgumentType#isEmpty
     */
    protected emptyChecker: ArgumentInfo<T>['isEmpty'] | null;
    /** How long to wait for input (in seconds) */
    wait: number;
    /**
     * @param client - Client the argument is for
     * @param info - Information for the command argument
     */
    protected constructor(client: CommandoClient, info: ArgumentInfo<T>);
    /**
     * Prompts the user and obtains the value for the argument
     * @param message - Message that triggered the command
     * @param value - Pre-provided value for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    obtain(message: CommandoMessage, value?: string[] | string, promptLimit?: number): Promise<ArgumentResult>;
    /**
     * Prompts the user and obtains multiple values for the argument
     * @param message - Message that triggered the command
     * @param values - Pre-provided values for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    protected obtainInfinite(message: CommandoMessage, values?: string[], promptLimit?: number): Promise<ArgumentResult<T>>;
    /**
     * Checks if a value is valid for the argument
     * @param value - Value to check
     * @param originalMessage - Message that triggered the command
     * @param currentMessage - Current response message
     */
    validate(value: string | undefined, originalMessage: CommandoMessage, currentMessage?: CommandoMessage): Promise<boolean | string>;
    /**
     * Parses a value string into a proper value for the argument
     * @param value - Value to parse
     * @param originalMessage - Message that triggered the command
     * @param currentMessage - Current response message
     */
    parse(value: string, originalMessage: CommandoMessage, currentMessage?: CommandoMessage): Promise<ArgumentTypeStringMap[T] | null>;
    /**
     * Checks whether a value for the argument is considered to be empty
     * @param value - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    isEmpty(value: string[] | string | undefined, originalMessage: CommandoMessage, currentMessage?: CommandoMessage): boolean;
    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    protected static validateInfo<T extends ArgumentTypeString = ArgumentTypeString>(client: CommandoClient, info: ArgumentInfo<T>): void;
    /**
     * Gets the argument type to use from an ID
     * @param client - Client to use the registry of
     * @param id - ID of the type to use
     */
    protected static resolveType<T extends ArgumentTypeString = ArgumentTypeString>(client: CommandoClient, id?: T | T[]): ArgumentType<T> | null;
}
export {};
