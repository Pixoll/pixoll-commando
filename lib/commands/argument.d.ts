import { Message } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import ArgumentType from '../types/base';
type ArgumentCheckerParams = [
    val: string[] | string,
    originalMsg: CommandoMessage,
    arg: Argument,
    currentMsg?: CommandoMessage
];
type ArgumentTypes = 'boolean' | 'category-channel' | 'channel' | 'command' | 'custom-emoji' | 'date' | 'default-emoji' | 'duration' | 'float' | 'group' | 'integer' | 'invite' | 'member' | 'message' | 'role' | 'stage-channel' | 'string' | 'text-channel' | 'thread-channel' | 'time' | 'user' | 'voice-channel';
/** Either a value or a function that returns a value. The function is passed the CommandoMessage and the Argument. */
type ArgumentDefault = (msg: CommandoMessage, arg: Argument) => Promise<unknown>;
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
export type ArgumentResponse = CommandoMessage | Message | null;
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
/** A fancy argument */
export default class Argument {
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
    /** How long to wait for input (in seconds) */
    wait: number;
    /**
     * @param client - Client the argument is for
     * @param info - Information for the command argument
     */
    protected constructor(client: CommandoClient, info: ArgumentInfo);
    /**
     * Prompts the user and obtains the value for the argument
     * @param msg - Message that triggered the command
     * @param val - Pre-provided value for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    obtain(msg: CommandoMessage, val: string, promptLimit?: number): Promise<ArgumentResult>;
    /**
     * Prompts the user and obtains multiple values for the argument
     * @param msg - Message that triggered the command
     * @param vals - Pre-provided values for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    protected obtainInfinite(msg: CommandoMessage, vals?: string[], promptLimit?: number): Promise<ArgumentResult>;
    /**
     * Checks if a value is valid for the argument
     * @param val - Value to check
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    validate(val: string, originalMsg: CommandoMessage, currentMsg?: CommandoMessage): Promise<boolean | string> | boolean | string;
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
}
export {};
