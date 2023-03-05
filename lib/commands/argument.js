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
     * @param message - Message that triggered the command
     * @param value - Pre-provided value for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    async obtain(message, value, promptLimit = Infinity) {
        const { channel, author } = message;
        let empty = this.isEmpty(value, message);
        if (empty && !this.required) {
            return {
                value: typeof this.default === 'function' ? await this.default(message, this) : this.default,
                cancelled: null,
                prompts: [],
                answers: [],
            };
        }
        if (this.infinite || Array.isArray(value))
            return this.obtainInfinite(message, value, promptLimit);
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const prompts = [];
        const answers = [];
        let valid = !empty ? await this.validate(value, message) : false;
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
            prompts.push(await message.replyEmbed(prompt));
            // Get the user's response
            const responses = await channel.awaitMessages({
                filter: msg => msg.author.id === author.id,
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
            value = response.content;
            // See if they want to cancel
            if (value.toLowerCase() === 'cancel') {
                return {
                    value: null,
                    cancelled: 'user',
                    prompts,
                    answers,
                };
            }
            empty = this.isEmpty(value, message, response);
            valid = await this.validate(value, message, response);
        }
        /* eslint-enable no-await-in-loop */
        return {
            value: await this.parse(value, message, answers[answers.length - 1] ?? message),
            cancelled: null,
            prompts,
            answers,
        };
    }
    /**
     * Prompts the user and obtains multiple values for the argument
     * @param message - Message that triggered the command
     * @param values - Pre-provided values for the argument
     * @param promptLimit - Maximum number of times to prompt for the argument
     */
    async obtainInfinite(message, values, promptLimit = Infinity) {
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : null;
        const results = [];
        const prompts = [];
        const answers = [];
        let currentVal = 0;
        /* eslint-disable no-await-in-loop */
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let value = values?.[currentVal] ?? null;
            let valid = value ? await this.validate(value, message) : false;
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
                if (value) {
                    const escaped = (0, discord_js_1.escapeMarkdown)(value).replace(/@/g, '@\u200b');
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
                    prompts.push(await message.replyEmbed(prompt));
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
                    prompts.push(await message.replyEmbed(prompt));
                }
                // Get the user's response
                const responses = await message.channel.awaitMessages({
                    filter: msg => msg.author.id === message.author.id,
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
                value = response.content;
                // See if they want to finish or cancel
                const lc = value.toLowerCase();
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
                valid = await this.validate(value, message, response);
            }
            results.push(await this.parse(value, message, answers[answers.length - 1] ?? message));
            if (values) {
                currentVal++;
                if (currentVal === values.length) {
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
     * @param value - Value to check
     * @param originalMessage - Message that triggered the command
     * @param currentMessage - Current response message
     */
    async validate(value, originalMessage, currentMessage = originalMessage) {
        if (!this.type || (!this.type && this.validator)) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        const validator = this.validator ?? this.type.validate;
        const valid = validator(value, originalMessage, this, currentMessage);
        if (!valid || typeof valid === 'string')
            return this.error || valid;
        if (util_1.default.isPromise(valid)) {
            return await valid.then(resolved => {
                const arr = typeof resolved === 'string' ? resolved.split('\n') : null;
                if (arr) {
                    if (arr.length === 1)
                        return arr[0];
                    if (arr.length > 1)
                        return arr[arr.length - 1];
                }
                return !resolved || typeof resolved === 'string' ? this.error || resolved : resolved;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvYXJndW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXNGO0FBa0J0RiwyREFBK0M7QUFDL0MsbURBQTJCO0FBdUkzQix1QkFBdUI7QUFDdkIsTUFBcUIsUUFBUTtJQUd6QiwyQkFBMkI7SUFDcEIsR0FBRyxDQUFTO0lBQ25CLDZCQUE2QjtJQUN0QixLQUFLLENBQVM7SUFDckIsdUNBQXVDO0lBQ2hDLE1BQU0sQ0FBUztJQUN0Qjs7O09BR0c7SUFDSSxLQUFLLENBQWdCO0lBQzVCLDJCQUEyQjtJQUNwQixJQUFJLENBQXlCO0lBQ3BDOzs7O09BSUc7SUFDSSxHQUFHLENBQWdCO0lBQzFCOzs7O09BSUc7SUFDSSxHQUFHLENBQWdCO0lBQzFCLHlDQUF5QztJQUNsQyxPQUFPLENBQTRCO0lBQzFDLDhDQUE4QztJQUN2QyxRQUFRLENBQVU7SUFDekIsa0VBQWtFO0lBQzNELHVCQUF1QixDQUFVO0lBQ3hDOzs7O09BSUc7SUFDSSxLQUFLLENBQWdDO0lBQzVDLGdFQUFnRTtJQUN6RCxRQUFRLENBQVU7SUFDekI7OztPQUdHO0lBQ08sU0FBUyxDQUFxQztJQUN4RDs7O09BR0c7SUFDTyxNQUFNLENBQWtDO0lBQ2xEOzs7T0FHRztJQUNPLFlBQVksQ0FBb0M7SUFDMUQsOENBQThDO0lBQ3ZDLElBQUksQ0FBUztJQUVwQjs7O09BR0c7SUFDSCxZQUFzQixNQUFzQixFQUFFLElBQXFCO1FBQy9ELFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXBDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNw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