"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argument_1 = __importDefault(require("./argument"));
/** Obtains, validates, and prompts for argument values */
class ArgumentCollector {
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
            throw new TypeError('Collector args must be an array.');
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
     * @param message - Message that the collector is being triggered by
     * @param provided - Values that are already available
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    async obtain(message, provided = [], promptLimit = this.promptLimit) {
        const { author, channelId } = message;
        const awaiting = this.client.dispatcher['_awaiting'];
        const { args } = this;
        const id = author.id + channelId;
        awaiting.add(id);
        const values = {};
        const results = [];
        try {
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                // eslint-disable-next-line no-await-in-loop
                const result = await arg.obtain(message, arg.infinite ? provided.slice(i) : provided[i], promptLimit);
                results.push(result);
                if (result.cancelled) {
                    awaiting.delete(id);
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
            awaiting.delete(id);
            throw err;
        }
        awaiting.delete(id);
        return {
            values: values,
            cancelled: null,
            prompts: results.map(res => res.prompts).flat(),
            answers: results.map(res => res.answers).flat(),
        };
    }
}
exports.default = ArgumentCollector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL2NvbGxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLDBEQU1vQjtBQTREcEIsMERBQTBEO0FBQzFELE1BQXFCLGlCQUFpQjtJQUdsQyxzQ0FBc0M7SUFDL0IsSUFBSSxDQUE4QjtJQUN6Qyw4REFBOEQ7SUFDdkQsV0FBVyxDQUFTO0lBRTNCOzs7O09BSUc7SUFDSCxZQUFtQixNQUFzQixFQUFFLElBQVUsRUFBRSxXQUFXLEdBQUcsUUFBUTtRQUN6RSxJQUFJLENBQUMsTUFBTTtZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxXQUFXLEtBQUssSUFBSTtZQUFFLFdBQVcsR0FBRyxRQUFRLENBQUM7UUFFakQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFL0IsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxJQUFJLFdBQVc7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1lBQzNGLElB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