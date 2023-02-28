import { oneLine, stripIndent } from 'common-tags';
import { escapeMarkdown, EmbedBuilder, Message, Colors, Awaitable } from 'discord.js';
import CommandoClient from '../client';
import {
    CommandoCategoryChannel,
    CommandoChannel,
    CommandoGuildEmoji,
    CommandoGuildMember,
    CommandoifiedMessage,
    CommandoInvite,
    CommandoRole,
    CommandoStageChannel,
    CommandoTextChannel,
    CommandoThreadChannel,
    CommandoUser,
    CommandoVoiceChannel,
} from '../discord.overrides';
import CommandoMessage from '../extensions/message';
import ArgumentType from '../types/base';
import ArgumentUnionType from '../types/union';
import Util from '../util';
import Command from './base';
import CommandGroup from './group';

type ArgumentCheckerParams<T extends ArgumentTypeString = ArgumentTypeString> = [
    value: string[] | string,
    originalMessage: CommandoMessage,
    argument: Argument<T>,
    currentMessage?: CommandoMessage,
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
export type ArgumentDefault<T extends ArgumentTypeString = ArgumentTypeString> =
    | ArgumentTypeStringMap[T]
    | ((msg: CommandoMessage, arg: Argument<T>) => Promise<ArgumentTypeStringMap[T]>);

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
     * in an array for a union type - see {@link CommandoRegistry#registerDefaultTypes} for the built-in types)
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
    /** Validator function for the argument (see {@link ArgumentType#validate}) */
    validate?: (...args: ArgumentCheckerParams<T>) => Awaitable<boolean | string>;
    /** Parser function for the argument (see {@link ArgumentType#parse}) */
    parse?: (...args: ArgumentCheckerParams<T>) => ArgumentTypeStringMap[T];
    /** Empty checker for the argument (see {@link ArgumentType#isEmpty}) */
    isEmpty?: (...args: ArgumentCheckerParams<T>) => boolean;
    /**
     * How long to wait for input (in seconds)
     * @default 30
     */
    wait?: number;
}

type ReadonlyArgumentInfo = Readonly<Omit<ArgumentInfo, 'oneOf' | 'type'> & {
    [P in keyof Pick<ArgumentInfo, 'oneOf' | 'type'>]:
    Pick<ArgumentInfo, 'oneOf' | 'type'>[P] extends Array<infer U> | infer S
    ? S | readonly U[]
    : Pick<ArgumentInfo, 'oneOf' | 'type'>[P];
}>;

export type ArgumentInfoResolvable = ArgumentInfo | ReadonlyArgumentInfo;

export type ArgumentResponse =
    | CommandoMessage
    | Message
    | null;

/** Result object from obtaining a single {@link Argument}'s value(s) */
export interface ArgumentResult<T extends ArgumentTypeString = ArgumentTypeString> {
    /** Final value(s) for the argument */
    value: ArgumentTypeStringMap[T] |null;
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
    /** Key for the argument */
    public key: string;
    /** Label for the argument */
    public label: string;
    /** Question prompt for the argument */
    public prompt: string;
    /**
     * Error message for when a value is invalid
     * @see ArgumentType#validate
     */
    public error: string | null;
    /** Type of the argument */
    public type: ArgumentType<T> | null;
    /**
     * - If type is `integer` or `float`, this is the maximum value of the number.
     * - If type is `string`, this is the maximum length of the string.
     * - If type is `duration`, this is the maximum duration.
     */
    public max: number | null;
    /**
     * - If type is `integer` or `float`, this is the minimum value of the number.
     * - If type is `string`, this is the minimum length of the string.
     * - If type is `duration`, this is the minimum duration.
     */
    public min: number | null;
    /** The default value for the argument */
    public default: ArgumentDefault<T> | null;
    /** Whether the argument is required or not */
    public required: boolean;
    /** Whether the default argument's validation is skipped or not */
    public skipExtraDateValidation: boolean;
    /**
     * Values the user can choose from.
     * - If type is `string`, this will be case-insensitive.
     * - If type is `channel`, `member`, `role`, or `user`, this will be the IDs.
     */
    public oneOf: Array<number | string> | null;
    /** Whether the argument accepts an infinite number of values */
    public infinite: boolean;
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
    public wait: number;

    /**
     * @param client - Client the argument is for
     * @param info - Information for the command argument
     */
    protected constructor(client: CommandoClient, info: ArgumentInfo<T>) {
        Argument.validateInfo(client, info);

        this.key = info.key;
        this.label = info.label || info.key;
        this.prompt = info.prompt;
        this.error = info.error || null;
        this.type = Argument.resolveType(client, info.type);
        this.max = info.max ?? null;
        this.min = info.min ?? null;
        this.default = info.default ?? null;
        this.required = 'required' in info ? !!info.required : !('default' in info);
        this.skipExtraDateValidation = !!info.skipExtraDateValidation;
        this.oneOf = info.oneOf?.map(el => typeof el === 'string' ? el.toLowerCase() : el) ?? null;
        this.infinite = !!info.infinite;
        this.validator = info.validate ?? null;
        this.parser = info.parse ?? null;
        this.emptyChecker = info.isEmpty ?? null;
        this.wait = info.wait ?? 30;
    }

    /**
     * Prompts the user and obtains the value for the argument
     * @param msg - Message that triggered the command
     * @param val - Pre-provided value for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    public async obtain(msg: CommandoMessage, val: string, promptLimit = Infinity): Promise<ArgumentResult> {
        const { channel, author } = msg;

        let empty = this.isEmpty(val, msg);
        if (empty && !this.required) {
            return {
                value: typeof this.default === 'function' ? await this.default(msg, this) : this.default,
                cancelled: null,
                prompts: [],
                answers: [],
            };
        }
        if (this.infinite) return this.obtainInfinite(msg, [val], promptLimit);

        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const prompts: ArgumentResponse[] = [];
        const answers: ArgumentResponse[] = [];
        let valid = !empty ? await this.validate(val, msg) : false;

        /* eslint-disable no-await-in-loop */
        while (!valid || typeof valid === 'string') {
            if (prompts.length >= promptLimit) {
                return {
                    value: null,
                    cancelled: 'promptLimit',
                    prompts,
                    answers,
                };
            }

            const prompt = new EmbedBuilder()
                .setColor(empty && this.prompt ? Colors.Blue : Colors.Red)
                .setFooter({
                    text: wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : '',
                })
                .addFields([{
                    name: this.prompt,
                    value: stripIndent`
                    **Don't type the whole command again!** Only what I ask for.
                    Respond with \`cancel\` to cancel the command.`,
                }]);

            if (!empty) {
                prompt.setDescription(
                    valid ? `**${valid}**` : `You provided an invalid ${this.label}. Please try again.`
                );
            }

            // Prompt the user for a new value
            prompts.push(await msg.replyEmbed(prompt) as ArgumentResponse);

            // Get the user's response
            const responses = await channel.awaitMessages({
                filter: msg2 => msg2.author.id === author.id,
                max: 1,
                time: wait ?? undefined,
            });

            const response = responses.first() as CommandoMessage | undefined;
            // Make sure they actually answered
            if (!response) {
                return {
                    value: null,
                    cancelled: 'time',
                    prompts,
                    answers,
                };
            }

            answers.push(response);
            val = response.content;

            // See if they want to cancel
            if (val.toLowerCase() === 'cancel') {
                return {
                    value: null,
                    cancelled: 'user',
                    prompts,
                    answers,
                };
            }

            empty = this.isEmpty(val, msg, response);
            valid = await this.validate(val, msg, response);
        }
        /* eslint-enable no-await-in-loop */

        return {
            value: await this.parse(
                val, msg, answers[answers.length - 1] as CommandoMessage ?? msg
            ) as ArgumentTypeStringMap[T],
            cancelled: null,
            prompts,
            answers,
        };
    }

    /**
     * Prompts the user and obtains multiple values for the argument
     * @param msg - Message that triggered the command
     * @param vals - Pre-provided values for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    protected async obtainInfinite(
        msg: CommandoMessage, vals?: string[], promptLimit = Infinity
    ): Promise<ArgumentResult<T>> {
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const results: Array<ArgumentTypeStringMap[T]> = [];
        const prompts: ArgumentResponse[] = [];
        const answers: ArgumentResponse[] = [];
        let currentVal = 0;

        /* eslint-disable no-await-in-loop */
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let val = vals && vals[currentVal] ? vals[currentVal] : null;
            let valid = val ? await this.validate(val, msg) : false;
            let attempts = 0;

            while (!valid || typeof valid === 'string') {
                attempts++;
                if (attempts > promptLimit) {
                    return {
                        value: null,
                        cancelled: 'promptLimit',
                        prompts,
                        answers,
                    };
                }

                // Prompt the user for a new value
                if (val) {
                    const escaped = escapeMarkdown(val).replace(/@/g, '@\u200b');

                    const prompt = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(valid || oneLine`
                            You provided an invalid ${this.label},
                            "${escaped.length < 1850 ? escaped : '[too long to show]'}".
                            Please try again.
                        `)
                        .addFields([{
                            name: this.prompt,
                            value: stripIndent`
                            **Don't type the whole command again!** Only what I ask for.
                            Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.`,
                        }])
                        .setFooter({
                            text: wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : '',
                        });

                    prompts.push(await msg.replyEmbed(prompt) as ArgumentResponse);
                } else if (results.length === 0) {
                    const prompt = new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .addFields([{
                            name: this.prompt,
                            value: stripIndent`
                            **Don't type the whole command again!** Only what I ask for.
                            Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.`,
                        }])
                        .setFooter({
                            text: wait
                                ? `The command will automatically be cancelled in ${this.wait} seconds, unless you respond.`
                                : '',
                        });

                    prompts.push(await msg.replyEmbed(prompt) as ArgumentResponse);
                }

                // Get the user's response
                const responses = await msg.channel.awaitMessages({
                    filter: msg2 => msg2.author.id === msg.author.id,
                    max: 1,
                    time: wait ?? undefined,
                });

                const response = responses.first() as CommandoMessage | undefined;
                // Make sure they actually answered
                if (!response) {
                    return {
                        value: null,
                        cancelled: 'time',
                        prompts,
                        answers,
                    };
                }

                answers.push(response);
                val = response.content;

                // See if they want to finish or cancel
                const lc = val.toLowerCase();
                if (lc === 'finish') {
                    return {
                        value: results.length > 0 ? results as unknown as ArgumentTypeStringMap[T] : null,
                        cancelled: this.default ? null : results.length > 0 ? null : 'user',
                        prompts,
                        answers,
                    };
                }
                if (lc === 'cancel') {
                    return {
                        value: null,
                        cancelled: 'user',
                        prompts,
                        answers,
                    };
                }

                valid = await this.validate(val, msg, response);
            }

            results.push(await this.parse(
                val as string, msg, answers[answers.length - 1] as CommandoMessage ?? msg
            ) as ArgumentTypeStringMap[T]);

            if (vals) {
                currentVal++;
                if (currentVal === vals.length) {
                    return {
                        value: results as unknown as ArgumentTypeStringMap[T],
                        cancelled: null,
                        prompts,
                        answers,
                    };
                }
            }
        }
        /* eslint-enable no-await-in-loop */
    }

    /**
     * Checks if a value is valid for the argument
     * @param val - Value to check
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    public validate(
        val: string, originalMsg: CommandoMessage, currentMsg: CommandoMessage = originalMsg
    ): Awaitable<boolean | string> {
        let valid = this.validator?.(val, originalMsg, this, currentMsg);
        if (!this.type) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        valid = this.type.validate(val, originalMsg, this, currentMsg);

        if (!valid || typeof valid === 'string') return this.error || valid;
        if (Util.isPromise(valid)) {
            return valid.then(vld => {
                const arr = typeof vld === 'string' ? vld.split('\n') : null;
                if (arr) {
                    if (arr.length === 1) return arr[0];
                    if (arr.length > 1) return arr[arr.length - 1];
                }
                return !vld || typeof vld === 'string' ? this.error || vld : vld;
            });
        }
        return valid;
    }

    /**
     * Parses a value string into a proper value for the argument
     * @param value - Value to parse
     * @param originalMessage - Message that triggered the command
     * @param currentMessage - Current response message
     */
    public parse(
        value: string, originalMessage: CommandoMessage, currentMessage: CommandoMessage = originalMessage
    ): unknown {
        if (this.parser) return this.parser(value, originalMessage, this, currentMessage);
        if (!this.type) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        return this.type.parse(value, originalMessage, this, currentMessage);
    }

    /**
     * Checks whether a value for the argument is considered to be empty
     * @param value - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    public isEmpty(
        value: string[] | string, originalMessage: CommandoMessage, currentMessage: CommandoMessage = originalMessage
    ): boolean {
        if (this.emptyChecker) return this.emptyChecker(value, originalMessage, this, currentMessage);
        if (this.type) return this.type.isEmpty(value, originalMessage, this, currentMessage);
        if (Array.isArray(value)) return value.length === 0;
        return !value;
    }

    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    protected static validateInfo<T extends ArgumentTypeString = ArgumentTypeString>(
        client: CommandoClient, info: ArgumentInfo<T>
    ): void {
        if (!client) throw new Error('The argument client must be specified.');
        if (typeof info !== 'object') throw new TypeError('Argument info must be an Object.');
        if (typeof info.key !== 'string') throw new TypeError('Argument key must be a string.');
        if (info.label && typeof info.label !== 'string') throw new TypeError('Argument label must be a string.');
        if (typeof info.prompt !== 'string') throw new TypeError('Argument prompt must be a string.');
        if (info.error && typeof info.error !== 'string') throw new TypeError('Argument error must be a string.');
        if (Array.isArray(info.type)) info.type = info.type.join('|') as T;
        if (info.type && typeof info.type !== 'string') {
            throw new TypeError('Argument type must be a string or an Array of strings.');
        }
        if (info.type && !info.type.includes('|') && !client.registry.types.has(info.type)) {
            throw new RangeError(`Argument type "${info.type}" isn't registered.`);
        }
        if (!info.type && !info.validate) {
            throw new Error('Argument must have either "type" or "validate" specified.');
        }
        if (info.validate && typeof info.validate !== 'function') {
            throw new TypeError('Argument validate must be a function.');
        }
        if (info.parse && typeof info.parse !== 'function') {
            throw new TypeError('Argument parse must be a function.');
        }
        if (!info.type && (!info.validate || !info.parse)) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        if (typeof info.wait !== 'undefined' && (typeof info.wait !== 'number' || isNaN(info.wait))) {
            throw new TypeError('Argument wait must be a number.');
        }
    }

    /**
     * Gets the argument type to use from an ID
     * @param client - Client to use the registry of
     * @param id - ID of the type to use
     */
    protected static resolveType<T extends ArgumentTypeString = ArgumentTypeString>(
        client: CommandoClient, id?: T | T[]
    ): ArgumentType<T> | null {
        if (!id) return null;
        if (Array.isArray(id)) id = id.join('|') as T;
        if (!id.includes('|')) return client.registry.types.get(id) as unknown as ArgumentType<T> ?? null;

        const registeredUnionType = client.registry.types.get(id) as unknown as ArgumentType<T>;
        if (registeredUnionType) return registeredUnionType;
        const newUnionType = new ArgumentUnionType<T>(client, id);
        client.registry.registerType(newUnionType);
        return newUnionType as unknown as ArgumentType<T>;
    }
}
