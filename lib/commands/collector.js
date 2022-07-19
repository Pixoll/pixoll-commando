"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argument_1 = __importDefault(require("./argument"));
/** Obtains, validates, and prompts for argument values */
class ArgumentCollector {
    /** Client this collector is for */
    client;
    /** Arguments the collector handles */
    args;
    /** Maximum number of times to prompt for a single argument */
    promptLimit;
    /**
     * @param client - Client the collector will use
     * @param args - Arguments for the collector
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    constructor(client, args, promptLimit = Infinity) {
        if (!client)
            throw new TypeError('Collector client must be specified.');
        if (!args || !Array.isArray(args))
            throw new TypeError('Collector args must be an Array.');
        if (promptLimit === null)
            promptLimit = Infinity;
        Object.defineProperty(this, 'client', { value: client });
        this.args = new Array(args.length);
        this.promptLimit = promptLimit;
        let hasInfinite = false;
        let hasOptional = false;
        for (let i = 0; i < args.length; i++) {
            if (hasInfinite)
                throw new Error('No other argument may come after an infinite argument.');
            if (args[i].default !== null)
                hasOptional = true;
            else if (hasOptional)
                throw new Error('Required arguments may not come after optional arguments.');
            // @ts-expect-error: Argument's constructor is set as protected
            this.args[i] = new argument_1.default(this.client, args[i]);
            if (this.args[i].infinite)
                hasInfinite = true;
        }
    }
    /**
     * Obtains values for the arguments, prompting if necessary.
     * @param msg - Message that the collector is being triggered by
     * @param provided - Values that are already available
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    async obtain(msg, provided = [], promptLimit = this.promptLimit) {
        const { author, channelId } = msg;
        const { dispatcher } = this.client;
        const { args } = this;
        const id = author.id + channelId;
        // @ts-expect-error: _awaiting should not be used outside of class CommandDispatcher
        dispatcher._awaiting.add(id);
        const values = {};
        const results = [];
        try {
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                const result = await arg.obtain(msg, (arg.infinite ? provided.slice(i) : provided[i]), promptLimit);
                results.push(result);
                if (result.cancelled) {
                    // @ts-expect-error: _awaiting should not be used outside of class CommandDispatcher
                    dispatcher._awaiting.delete(id);
                    return {
                        values: null,
                        cancelled: result.cancelled,
                        prompts: results.map(res => res.prompts).flat(),
                        answers: results.map(res => res.answers).flat(),
                    };
                }
                values[arg.key] = result.value;
            }
        }
        catch (err) {
            // @ts-expect-error: _awaiting should not be used outside of class CommandDispatcher
            dispatcher._awaiting.delete(id);
            throw err;
        }
        // @ts-expect-error: _awaiting should not be used outside of class CommandDispatcher
        dispatcher._awaiting.delete(id);
        return {
            values,
            cancelled: null,
            prompts: results.map(res => res.prompts).flat(),
            answers: results.map(res => res.answers).flat(),
        };
    }
}
exports.default = ArgumentCollector;
//# sourceMappingURL=collector.js.map