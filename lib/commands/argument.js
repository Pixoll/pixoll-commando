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
     * @see ArgumentType#validate
     */
    error;
    /** Type of the argument */
    type;
    /**
     * - If type is `integer` or `float`, this is the maximum value of the number.
     * - If type is `string`, this is the maximum length of the string.
     * - If type is `duration`, this is the maximum duration.
     */
    max;
    /**
     * - If type is `integer` or `float`, this is the minimum value of the number.
     * - If type is `string`, this is the minimum length of the string.
     * - If type is `duration`, this is the minimum duration.
     */
    min;
    /** The default value for the argument */
    default;
    /** Whether the argument is required or not */
    required;
    /** Whether the default argument's validation is skipped or not */
    skipExtraDateValidation;
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
     * @see ArgumentType#validate
     */
    validator;
    /**
     * Parser function for parsing a value for the argument
     * @see ArgumentType#parse
     */
    parser;
    /**
     * Function to check whether a raw value is considered empty
     * @see ArgumentType#isEmpty
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
        Object.defineProperty(this, 'client', { value: client });
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
    async obtain(msg, val, promptLimit = Infinity) {
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
        if (this.infinite)
            return this.obtainInfinite(msg, [val], promptLimit);
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const prompts = [];
        const answers = [];
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
            const prompt = new discord_js_1.EmbedBuilder()
                .setColor(empty && this.prompt ? discord_js_1.Colors.Blue : discord_js_1.Colors.Red)
                .setFooter({
                text: wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : '',
            })
                .addFields([{
                    name: this.prompt,
                    value: (0, common_tags_1.stripIndent) `
                    **Don't type the whole command again!** Only what I ask for.
                    Respond with \`cancel\` to cancel the command.`,
                }]);
            if (!empty) {
                prompt.setDescription(valid ? `**${valid}**` : `You provided an invalid ${this.label}. Please try again.`);
            }
            // Prompt the user for a new value
            prompts.push(await msg.replyEmbed(prompt));
            // Get the user's response
            const responses = await channel.awaitMessages({
                filter: msg2 => msg2.author.id === author.id,
                max: 1,
                time: wait ?? undefined,
            });
            const response = responses.first();
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
            value: await this.parse(val, msg, answers[answers.length - 1] ?? msg),
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
    async obtainInfinite(msg, vals, promptLimit = Infinity) {
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const results = [];
        const prompts = [];
        const answers = [];
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
                    const escaped = (0, discord_js_1.escapeMarkdown)(val).replace(/@/g, '@\u200b');
                    const prompt = new discord_js_1.EmbedBuilder()
                        .setColor(discord_js_1.Colors.Red)
                        .setDescription(valid || (0, common_tags_1.oneLine) `
                            You provided an invalid ${this.label},
                            "${escaped.length < 1850 ? escaped : '[too long to show]'}".
                            Please try again.
                        `)
                        .addFields([{
                            name: this.prompt,
                            value: (0, common_tags_1.stripIndent) `
                            **Don't type the whole command again!** Only what I ask for.
                            Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.`,
                        }])
                        .setFooter({
                        text: wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : '',
                    });
                    prompts.push(await msg.replyEmbed(prompt));
                }
                else if (results.length === 0) {
                    const prompt = new discord_js_1.EmbedBuilder()
                        .setColor(discord_js_1.Colors.Blue)
                        .addFields([{
                            name: this.prompt,
                            value: (0, common_tags_1.stripIndent) `
                            **Don't type the whole command again!** Only what I ask for.
                            Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.`,
                        }])
                        .setFooter({
                        text: wait
                            ? `The command will automatically be cancelled in ${this.wait} seconds, unless you respond.`
                            : '',
                    });
                    prompts.push(await msg.replyEmbed(prompt));
                }
                // Get the user's response
                const responses = await msg.channel.awaitMessages({
                    filter: msg2 => msg2.author.id === msg.author.id,
                    max: 1,
                    time: wait ?? undefined,
                });
                const response = responses.first();
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
                        value: results.length > 0 ? results : null,
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
            results.push(await this.parse(val, msg, answers[answers.length - 1] ?? msg));
            if (vals) {
                currentVal++;
                if (currentVal === vals.length) {
                    return {
                        value: results,
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
    async validate(val, originalMsg, currentMsg = originalMsg) {
        if (!this.type || (!this.type && this.validator)) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        const validator = this.validator ?? this.type.validate;
        const valid = validator(val, originalMsg, this, currentMsg);
        if (!valid || typeof valid === 'string')
            return this.error || valid;
        if (util_1.default.isPromise(valid)) {
            return await valid.then(vld => {
                const arr = typeof vld === 'string' ? vld.split('\n') : null;
                if (arr) {
                    if (arr.length === 1)
                        return arr[0];
                    if (arr.length > 1)
                        return arr[arr.length - 1];
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
    async parse(value, originalMessage, currentMessage = originalMessage) {
        if (this.parser)
            return await this.parser(value, originalMessage, this, currentMessage);
        if (!this.type) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        return await this.type.parse(value, originalMessage, this, currentMessage);
    }
    /**
     * Checks whether a value for the argument is considered to be empty
     * @param value - Value to check for emptiness
     * @param originalMsg - Message that triggered the command
     * @param currentMsg - Current response message
     */
    isEmpty(value, originalMessage, currentMessage = originalMessage) {
        if (this.emptyChecker)
            return this.emptyChecker(value, originalMessage, this, currentMessage);
        if (this.type)
            return this.type.isEmpty(value, originalMessage, this, currentMessage);
        if (Array.isArray(value))
            return value.length === 0;
        return !value;
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
    static resolveType(client, id) {
        if (!id)
            return null;
        if (Array.isArray(id))
            id = id.join('|');
        if (!id.includes('|'))
            return client.registry.types.get(id) ?? null;
        const registeredUnionType = client.registry.types.get(id);
        if (registeredUnionType)
            return registeredUnionType;
        const newUnionType = new union_1.default(client, id);
        client.registry.registerType(newUnionType);
        return newUnionType;
    }
}
exports.default = Argument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvYXJndW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXNGO0FBa0J0RiwyREFBK0M7QUFDL0MsbURBQTJCO0FBd0kzQix1QkFBdUI7QUFDdkIsTUFBcUIsUUFBUTtJQUd6QiwyQkFBMkI7SUFDcEIsR0FBRyxDQUFTO0lBQ25CLDZCQUE2QjtJQUN0QixLQUFLLENBQVM7SUFDckIsdUNBQXVDO0lBQ2hDLE1BQU0sQ0FBUztJQUN0Qjs7O09BR0c7SUFDSSxLQUFLLENBQWdCO0lBQzVCLDJCQUEyQjtJQUNwQixJQUFJLENBQXlCO0lBQ3BDOzs7O09BSUc7SUFDSSxHQUFHLENBQWdCO0lBQzFCOzs7O09BSUc7SUFDSSxHQUFHLENBQWdCO0lBQzFCLHlDQUF5QztJQUNsQyxPQUFPLENBQTRCO0lBQzFDLDhDQUE4QztJQUN2QyxRQUFRLENBQVU7SUFDekIsa0VBQWtFO0lBQzNELHVCQUF1QixDQUFVO0lBQ3hDOzs7O09BSUc7SUFDSSxLQUFLLENBQWdDO0lBQzVDLGdFQUFnRTtJQUN6RCxRQUFRLENBQVU7SUFDekI7OztPQUdHO0lBQ08sU0FBUyxDQUFxQztJQUN4RDs7O09BR0c7SUFDTyxNQUFNLENBQWtDO0lBQ2xEOzs7T0FHRztJQUNPLFlBQVksQ0FBb0M7SUFDMUQsOENBQThDO0lBQ3ZDLElBQUksQ0FBUztJQUVwQjs7O09BR0c7SUFDSCxZQUFzQixNQUFzQixFQUFFLElBQXFCO1FBQy9ELFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXBDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNw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