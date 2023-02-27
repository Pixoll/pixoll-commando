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
    validate(val, originalMsg, currentMsg = originalMsg) {
        let valid = this.validator?.(val, originalMsg, this, currentMsg);
        if (!this.type) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        valid = this.type.validate(val, originalMsg, this, currentMsg);
        if (!valid || typeof valid === 'string')
            return this.error || valid;
        if (util_1.default.isPromise(valid)) {
            return valid.then(vld => {
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
    parse(value, originalMessage, currentMessage = originalMessage) {
        if (this.parser)
            return this.parser(value, originalMessage, this, currentMessage);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvYXJndW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBbUQ7QUFDbkQsMkNBQXNGO0FBa0J0RiwyREFBK0M7QUFDL0MsbURBQTJCO0FBd0kzQix1QkFBdUI7QUFDdkIsTUFBcUIsUUFBUTtJQUN6QiwyQkFBMkI7SUFDcEIsR0FBRyxDQUFTO0lBQ25CLDZCQUE2QjtJQUN0QixLQUFLLENBQVM7SUFDckIsdUNBQXVDO0lBQ2hDLE1BQU0sQ0FBUztJQUN0Qjs7O09BR0c7SUFDSSxLQUFLLENBQWdCO0lBQzVCLDJCQUEyQjtJQUNwQixJQUFJLENBQXlCO0lBQ3BDOzs7O09BSUc7SUFDSSxHQUFHLENBQWdCO0lBQzFCOzs7O09BSUc7SUFDSSxHQUFHLENBQWdCO0lBQzFCLHlDQUF5QztJQUNsQyxPQUFPLENBQTRCO0lBQzFDLDhDQUE4QztJQUN2QyxRQUFRLENBQVU7SUFDekIsa0VBQWtFO0lBQzNELHVCQUF1QixDQUFVO0lBQ3hDOzs7O09BSUc7SUFDSSxLQUFLLENBQWdDO0lBQzVDLGdFQUFnRTtJQUN6RCxRQUFRLENBQVU7SUFDekI7OztPQUdHO0lBQ08sU0FBUyxDQUFxQztJQUN4RDs7O09BR0c7SUFDTyxNQUFNLENBQWtDO0lBQ2xEOzs7T0FHRztJQUNPLFlBQVksQ0FBb0M7SUFDMUQsOENBQThDO0lBQ3ZDLElBQUksQ0FBUztJQUVwQjs7O09BR0c7SUFDSCxZQUFzQixNQUFzQixFQUFFLElBQXFCO1FBQy9ELFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXBDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztRQUNoQyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQztRQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO1FBQzlELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzNGLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQW9CLEVBQUUsR0FBVyxFQUFFLFdBQVcsR0FBRyxRQUFRO1FBQ3pFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRWhDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN6QixPQUFPO2dCQUNILEtBQUssRUFBRSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTztnQkFDeEYsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsT0FBTyxFQUFFLEVBQUU7YUFDZCxDQUFDO1NBQ0w7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRXZFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQy9FLE1BQU0sT0FBTyxHQUF1QixFQUFFLENBQUM7UUFDdkMsTUFBTSxPQUFPLEdBQXVCLEVBQUUsQ0FBQztRQUN2QyxJQUFJLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRTNELHFDQUFxQztRQUNyQyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUN4QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksV0FBVyxFQUFFO2dCQUMvQixPQUFPO29CQUNILEtBQUssRUFBRSxJQUFJO29CQUNYLFNBQVMsRUFBRSxhQUFhO29CQUN4QixPQUFPO29CQUNQLE9BQU87aUJBQ1YsQ0FBQzthQUNMO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2lCQUM1QixRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG1CQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxtQkFBTSxDQUFDLEdBQUcsQ0FBQztpQkFDekQsU0FBUyxDQUFDO2dCQUNQLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGtEQUFrRCxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7YUFDM0YsQ0FBQztpQkFDRCxTQUFTLENBQUMsQ0FBQztvQkFDUixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ2pCLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7O21FQUU2QjtpQkFDbEQsQ0FBQyxDQUFDLENBQUM7WUFFUixJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNSLE1BQU0sQ0FBQyxjQUFjLENBQ2pCLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsMkJBQTJCLElBQUksQ0FBQyxLQUFLLHFCQUFxQixDQUN0RixDQUFDO2FBQ0w7WUFFRCxrQ0FBa0M7WUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFxQixDQUFDLENBQUM7WUFFL0QsMEJBQTBCO1lBQzFCLE1BQU0sU0FBUyxHQUFHLE1BQU0sT0FBTyxDQUFDLGFBQWEsQ0FBQztnQkFDMUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUU7Z0JBQzVDLEdBQUcsRUFBRSxDQUFDO2dCQUNOLElBQUksRUFBRSxJQUFJLElBQUksU0FBUzthQUMxQixDQUFDLENBQUM7WUFFSCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFpQyxDQUFDO1lBQ2xFLG1DQUFtQztZQUNuQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNYLE9BQU87b0JBQ0gsS0FBSyxFQUFFLElBQUk7b0JBQ1gsU0FBUyxFQUFFLE1BQU07b0JBQ2pCLE9BQU87b0JBQ1AsT0FBTztpQkFDVixDQUFDO2FBQ0w7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZCLEdBQUcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBRXZCLDZCQUE2QjtZQUM3QixJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLE9BQU87b0JBQ0gsS0FBSyxFQUFFLElBQUk7b0JBQ1gsU0FBUyxFQUFFLE1BQU07b0JBQ2pCLE9BQU87b0JBQ1AsT0FBTztpQkFDVixDQUFDO2FBQ0w7WUFFRCxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNuRDtRQUNELG9DQUFvQztRQUVwQyxPQUFPO1lBQ0gsS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBb0IsSUFBSSxHQUFHLENBQUM7WUFDeEYsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPO1lBQ1AsT0FBTztTQUNWLENBQUM7SUFDTixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDTyxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQW9CLEVBQUUsSUFBZSxFQUFFLFdBQVcsR0FBRyxRQUFRO1FBQ3hGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQy9FLE1BQU0sT0FBTyxHQUF1QixFQUFFLENBQUM7UUFDdkMsTUFBTSxPQUFPLEdBQXVCLEVBQUUsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FBdUIsRUFBRSxDQUFDO1FBQ3ZDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUVuQixxQ0FBcUM7UUFDckMsaURBQWlEO1FBQ2pELE9BQU8sSUFBSSxFQUFFO1lBQ1QsSUFBSSxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDN0QsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDeEQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBRWpCLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUN4QyxRQUFRLEVBQUUsQ0FBQztnQkFDWCxJQUFJLFFBQVEsR0FBRyxXQUFXLEVBQUU7b0JBQ3hCLE9BQU87d0JBQ0gsS0FBSyxFQUFFLElBQUk7d0JBQ1gsU0FBUyxFQUFFLGFBQWE7d0JBQ3hCLE9BQU87d0JBQ1AsT0FBTztxQkFDVixDQUFDO2lCQUNMO2dCQUVELGtDQUFrQztnQkFDbEMsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsTUFBTSxPQUFPLEdBQUcsSUFBQSwyQkFBYyxFQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBRTdELE1BQU0sTUFBTSxHQUFHLElBQUkseUJBQVksRUFBRTt5QkFDNUIsUUFBUSxDQUFDLG1CQUFNLENBQUMsR0FBRyxDQUFDO3lCQUNwQixjQUFjLENBQUMsS0FBSyxJQUFJLElBQUEscUJBQU8sRUFBQTtzREFDRixJQUFJLENBQUMsS0FBSzsrQkFDakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsb0JBQW9COzt5QkFFNUQsQ0FBQzt5QkFDRCxTQUFTLENBQUMsQ0FBQzs0QkFDUixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU07NEJBQ2pCLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzJIQUU2RTt5QkFDbEcsQ0FBQyxDQUFDO3lCQUNGLFNBQVMsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxrREFBa0QsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO3FCQUMzRixDQUFDLENBQUM7b0JBRVAsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFxQixDQUFDLENBQUM7aUJBQ2xFO3FCQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUkseUJBQVksRUFBRTt5QkFDNUIsUUFBUSxDQUFDLG1CQUFNLENBQUMsSUFBSSxDQUFDO3lCQUNyQixTQUFTLENBQUMsQ0FBQzs0QkFDUixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU07NEJBQ2pCLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzBHQUU0RDt5QkFDakYsQ0FBQyxDQUFDO3lCQUNGLFNBQVMsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsSUFBSTs0QkFDTixDQUFDLENBQUMsa0RBQWtELElBQUksQ0FBQyxJQUFJLCtCQUErQjs0QkFDNUYsQ0FBQyxDQUFDLEVBQUU7cUJBQ1gsQ0FBQyxDQUFDO29CQUVQLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBcUIsQ0FBQyxDQUFDO2lCQUNsRTtnQkFFRCwwQkFBMEI7Z0JBQzFCLE1BQU0sU0FBUyxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7b0JBQzlDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDaEQsR0FBRyxFQUFFLENBQUM7b0JBQ04sSUFBSSxFQUFFLElBQUksSUFBSSxTQUFTO2lCQUMxQixDQUFDLENBQUM7Z0JBRUgsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBaUMsQ0FBQztnQkFDbEUsbUNBQW1DO2dCQUNuQyxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNYLE9BQU87d0JBQ0gsS0FBSyxFQUFFLElBQUk7d0JBQ1gsU0FBUyxFQUFFLE1BQU07d0JBQ2pCLE9BQU87d0JBQ1AsT0FBTztxQkFDVixDQUFDO2lCQUNMO2dCQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZCLEdBQUcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUV2Qix1Q0FBdUM7Z0JBQ3ZDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxFQUFFLEtBQUssUUFBUSxFQUFFO29CQUNqQixPQUFPO3dCQUNILEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJO3dCQUMxQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNO3dCQUNuRSxPQUFPO3dCQUNQLE9BQU87cUJBQ1YsQ0FBQztpQkFDTDtnQkFDRCxJQUFJLEVBQUUsS0FBSyxRQUFRLEVBQUU7b0JBQ2pCLE9BQU87d0JBQ0gsS0FBSyxFQUFFLElBQUk7d0JBQ1gsU0FBUyxFQUFFLE1BQU07d0JBQ2pCLE9BQU87d0JBQ1AsT0FBTztxQkFDVixDQUFDO2lCQUNMO2dCQUVELEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNuRDtZQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUN6QixHQUFhLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBb0IsSUFBSSxHQUFHLENBQ3hELENBQUMsQ0FBQztZQUV2QixJQUFJLElBQUksRUFBRTtnQkFDTixVQUFVLEVBQUUsQ0FBQztnQkFDYixJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUM1QixPQUFPO3dCQUNILEtBQUssRUFBRSxPQUFPO3dCQUNkLFNBQVMsRUFBRSxJQUFJO3dCQUNmLE9BQU87d0JBQ1AsT0FBTztxQkFDVixDQUFDO2lCQUNMO2FBQ0o7U0FDSjtRQUNELG9DQUFvQztJQUN4QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxRQUFRLENBQ1gsR0FBVyxFQUFFLFdBQTRCLEVBQUUsYUFBOEIsV0FBVztRQUVwRixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7U0FDaEc7UUFDRCxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRO1lBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQztRQUNwRSxJQUFJLGNBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNwQixNQUFNLEdBQUcsR0FBRyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDN0QsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUM7d0JBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDO3dCQUFFLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2xEO2dCQUNELE9BQU8sQ0FBQyxHQUFHLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ3JFLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLENBQ1IsS0FBYSxFQUFFLGVBQWdDLEVBQUUsaUJBQWtDLGVBQWU7UUFFbEcsSUFBSSxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztTQUNoRztRQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksT0FBTyxDQUNWLEtBQXdCLEVBQUUsZUFBZ0MsRUFBRSxpQkFBa0MsZUFBZTtRQUU3RyxJQUFJLElBQUksQ0FBQyxZQUFZO1lBQUUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzlGLElBQUksSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxNQUFNLENBQUMsWUFBWSxDQUN6QixNQUFzQixFQUFFLElBQXFCO1FBRTdDLElBQUksQ0FBQyxNQUFNO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUTtZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUN0RixJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsS0FBSyxRQUFRO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3hGLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUTtZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUMxRyxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQzlGLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUTtZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUMxRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFNLENBQUM7UUFDbkUsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDNUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hGLE1BQU0sSUFBSSxVQUFVLENBQUMsa0JBQWtCLElBQUksQ0FBQyxJQUFJLHFCQUFxQixDQUFDLENBQUM7U0FDMUU7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxVQUFVLEVBQUU7WUFDdEQsTUFBTSxJQUFJLFNBQVMsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1NBQ2hFO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLEVBQUU7WUFDaEQsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1NBQzdEO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDL0MsTUFBTSxJQUFJLEtBQUssQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO1NBQ2hHO1FBQ0QsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDekYsTUFBTSxJQUFJLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1NBQzFEO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxNQUFNLENBQUMsV0FBVyxDQUN4QixNQUFzQixFQUFFLEVBQVk7UUFFcEMsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNyQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFNLENBQUM7UUFDOUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUErQixJQUFJLElBQUksQ0FBQztRQUVsRyxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQStCLENBQUM7UUFDeEYsSUFBSSxtQkFBbUI7WUFBRSxPQUFPLG1CQUFtQixDQUFDO1FBQ3BELE1BQU0sWUFBWSxHQUFHLElBQUksZUFBaUIsQ0FBSSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0MsT0FBTyxZQUEwQyxDQUFDO0lBQ3RELENBQUM7Q0FDSjtBQWpiRCwyQkFpYkMifQ==