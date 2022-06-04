"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const union_1 = __importDefault(require("../types/union"));
const util_1 = __importDefault(require("../util"));
/** A fancy argument */
class Argument {
    /** Key for the argument */
    key;
    /** Label for the argument */
    label;
    /** Question prompt for the argument */
    prompt;
    /**
     * Error message for when a value is invalid
     *  @see {@link ArgumentType#validate}
     */
    error;
    /** Type of the argument */
    type;
    /**
     * - If type is `integer` or `float`, this is the maximum value of the number.
     * - If type is `string`, this is the maximum length of the string.
     */
    max;
    /**
     * - If type is `integer` or `float`, this is the minimum value of the number.
     * - If type is `string`, this is the minimum length of the string.
     */
    min;
    /** The default value for the argument */
    default;
    /** Whether the argument is required or not */
    required;
    /** Whether the default argument's validation is skipped or not */
    skipValidation;
    /**
     * Values the user can choose from.
     * - If type is `string`, this will be case-insensitive.
     * - If type is `channel`, `member`, `role`, or `user`, this will be the IDs.
     */
    oneOf;
    /** Whether the argument accepts an infinite number of values */
    infinite;
    /**
     * Validator function for validating a value for the argument
     * @see {@link ArgumentType#validate}
     */
    validator;
    /**
     * Parser function for parsing a value for the argument
     *  @see {@link ArgumentType#parse}
     */
    parser;
    /**
     * Function to check whether a raw value is considered empty
     *  @see {@link ArgumentType#isEmpty}
     */
    emptyChecker;
    /** How long to wait for input (in seconds) */
    wait;
    /**
     * @param client - Client the argument is for
     * @param info - Information for the command argument
     */
    constructor(client, info) {
        Argument.validateInfo(client, info);
        this.key = info.key;
        this.label = info.label || info.key;
        this.prompt = info.prompt;
        this.error = info.error || null;
        this.type = Argument.determineType(client, info.type);
        this.max = info.max ?? null;
        this.min = info.min ?? null;
        this.default = info.default ?? null;
        this.required = 'required' in info ? !!info.required : !('default' in info);
        this.skipValidation = !!info.skipValidation;
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
    async obtain(msg, val, promptLimit = Infinity) {
        const { channel, author } = msg;
        let empty = this.isEmpty(val, msg);
        if (empty && !this.required) {
            return {
                value: typeof this.default === 'function' ? await this.default(msg, this) : this.default,
                cancelled: null,
                prompts: [],
                answers: []
            };
        }
        if (this.infinite)
            return this.obtainInfinite(msg, [val], promptLimit);
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const prompts = [];
        const answers = [];
        let valid = !empty ? await this.validate(val, msg) : false;
        while (!valid || typeof valid === 'string') {
            if (prompts.length >= promptLimit) {
                return {
                    value: null,
                    cancelled: 'promptLimit',
                    prompts,
                    answers
                };
            }
            const prompt = new discord_js_1.MessageEmbed()
                .setColor(empty && this.prompt ? 'BLUE' : 'RED')
                .setFooter({
                text: wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''
            })
                .addField(this.prompt, (0, common_tags_1.stripIndent) `
                    **Don't type the whole command again!** Only what I ask for.
                    Respond with \`cancel\` to cancel the command.
                `);
            if (!empty) {
                prompt.setDescription(valid ? `**${valid}**` : `You provided an invalid ${this.label}. Please try again.`);
            }
            // Prompt the user for a new value
            prompts.push(await msg.replyEmbed(prompt));
            // Get the user's response
            const responses = await channel.awaitMessages({
                filter: msg2 => msg2.author.id === author.id,
                max: 1,
                time: wait ?? undefined
            });
            // Make sure they actually answered
            if (responses?.size !== 1) {
                return {
                    value: null,
                    cancelled: 'time',
                    prompts,
                    answers
                };
            }
            answers.push(responses.first());
            val = answers[answers.length - 1].content;
            // See if they want to cancel
            if (val.toLowerCase() === 'cancel') {
                return {
                    value: null,
                    cancelled: 'user',
                    prompts,
                    answers
                };
            }
            const first = responses.first();
            // @ts-expect-error: Message<boolean> is not assignable to CommandoMessage
            empty = this.isEmpty(val, msg, first);
            // @ts-expect-error: Message<boolean> is not assignable to CommandoMessage
            valid = await this.validate(val, msg, first);
        }
        return {
            // @ts-expect-error: Message<boolean> is not assignable to CommandoMessage
            value: await this.parse(val, msg, (answers.length ? answers[answers.length - 1] : msg) ?? undefined),
            cancelled: null,
            prompts,
            answers
        };
    }
    /**
     * Prompts the user and obtains multiple values for the argument
     * @param msg - Message that triggered the command
     * @param vals - Pre-provided values for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    async obtainInfinite(msg, vals, promptLimit = Infinity) {
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const results = [];
        const prompts = [];
        const answers = [];
        let currentVal = 0;
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
                        answers
                    };
                }
                // Prompt the user for a new value
                if (val) {
                    const escaped = discord_js_1.Util.escapeMarkdown(val).replace(/@/g, '@\u200b');
                    const prompt = new discord_js_1.MessageEmbed()
                        .setColor('RED')
                        .setDescription(valid || (0, common_tags_1.oneLine) `
                            You provided an invalid ${this.label},
                            "${escaped.length < 1850 ? escaped : '[too long to show]'}".
                            Please try again.
                        `)
                        .addField(this.prompt, (0, common_tags_1.stripIndent) `
                            **Don't type the whole command again!** Only what I ask for.
                            Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.
                        `)
                        .setFooter({
                        text: wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''
                    });
                    prompts.push(await msg.replyEmbed(prompt));
                }
                else if (results.length === 0) {
                    const prompt = new discord_js_1.MessageEmbed()
                        .setColor('BLUE')
                        .addField(this.prompt, (0, common_tags_1.stripIndent) `
                                **Don't type the whole command again!** Only what I ask for.
                                Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.
                            `)
                        .setFooter({
                        text: wait ?
                            `The command will automatically be cancelled in ${this.wait} seconds, unless you respond.` :
                            ''
                    });
                    prompts.push(await msg.replyEmbed(prompt));
                }
                // Get the user's response
                const responses = await msg.channel.awaitMessages({
                    filter: msg2 => msg2.author.id === msg.author.id,
                    max: 1,
                    time: wait ?? undefined
                });
                // Make sure they actually answered
                if (responses?.size !== 1) {
                    return {
                        value: null,
                        cancelled: 'time',
                        prompts,
                        answers
                    };
                }
                answers.push(responses.first());
                val = answers[answers.length - 1].content;
                // See if they want to finish or cancel
                const lc = val.toLowerCase();
                if (lc === 'finish') {
                    return {
                        value: results.length > 0 ? results : null,
                        cancelled: this.default ? null : results.length > 0 ? null : 'user',
                        prompts,
                        answers
                    };
                }
                if (lc === 'cancel') {
                    return {
                        value: null,
                        cancelled: 'user',
                        prompts,
                        answers
                    };
                }
                // @ts-expect-error: Message<boolean> is not assignable to CommandoMessage
                valid = await this.validate(val, msg, responses.first());
            }
            results.push(await this.parse(
            // @ts-expect-error: Message<boolean> is not assignable to CommandoMessage
            val, msg, (answers.length ? answers[answers.length - 1] : msg) ?? undefined));
            if (vals) {
                currentVal++;
                if (currentVal === vals.length) {
                    return {
                        value: results,
                        cancelled: null,
                        prompts,
                        answers
                    };
                }
            }
        }
    }
    /**
     * Checks if a value is valid for the argument
     * @param val - Value to check
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    validate(val, originalMsg, currentMsg = originalMsg) {
        const valid = this.validator ?
            this.validator(val, originalMsg, this, currentMsg) :
            this.type.validate(val, originalMsg, this, currentMsg);
        if (!valid || typeof valid === 'string')
            return this.error || valid;
        if (util_1.default.isPromise(valid)) {
            return valid.then(vld => {
                const arr = typeof vld === 'string' ? vld.split('\n') : null;
                if (arr) {
                    if (arr.length === 1)
                        return arr[0];
                    if (arr.length > 1)
                        return arr.pop();
                }
                return !vld || typeof vld === 'string' ? this.error || vld : vld;
            });
        }
        return valid;
    }
    /**
     * Parses a value string into a proper value for the argument
     * @param val - Value to parse
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    parse(val, originalMsg, currentMsg = originalMsg) {
        if (this.parser)
            return this.parser(val, originalMsg, this, currentMsg);
        return this.type.parse(val, originalMsg, this, currentMsg);
    }
    /**
     * Checks whether a value for the argument is considered to be empty
     * @param val - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    isEmpty(val, originalMsg, currentMsg = originalMsg) {
        if (this.emptyChecker)
            return this.emptyChecker(val, originalMsg, this, currentMsg);
        if (this.type)
            return this.type.isEmpty(val, originalMsg, this, currentMsg);
        if (Array.isArray(val))
            return val.length === 0;
        return !val;
    }
    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    static validateInfo(client, info) {
        if (!client)
            throw new Error('The argument client must be specified.');
        if (typeof info !== 'object')
            throw new TypeError('Argument info must be an Object.');
        if (typeof info.key !== 'string')
            throw new TypeError('Argument key must be a string.');
        if (info.label && typeof info.label !== 'string')
            throw new TypeError('Argument label must be a string.');
        if (typeof info.prompt !== 'string')
            throw new TypeError('Argument prompt must be a string.');
        if (info.error && typeof info.error !== 'string')
            throw new TypeError('Argument error must be a string.');
        // @ts-expect-error: Type 'string' is not assignable to type 'ArgumentTypes'
        if (Array.isArray(info.type))
            info.type = info.type.join('|');
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
    static determineType(client, id) {
        if (!id)
            return null;
        if (Array.isArray(id))
            id = id.join('|');
        if (!id.includes('|'))
            return client.registry.types.get(id);
        let type = client.registry.types.get(id);
        if (type)
            return type;
        type = new union_1.default(client, id);
        client.registry.registerType(type);
        return type;
    }
}
exports.default = Argument;
//# sourceMappingURL=argument.js.map