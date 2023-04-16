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
        // @ts-expect-error: _awaiting should not be used outside of class CommandDispatcher
        const { _awaiting } = this.client.dispatcher;
        const { args } = this;
        const id = author.id + channelId;
        _awaiting.add(id);
        const values = {};
        const results = [];
        try {
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                // eslint-disable-next-line no-await-in-loop
                const result = await arg.obtain(message, arg.infinite ? provided.slice(i) : provided[i], promptLimit);
                results.push(result);
                if (result.cancelled) {
                    _awaiting.delete(id);
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
            _awaiting.delete(id);
            throw err;
        }
        _awaiting.delete(id);
        return {
            values: values,
            cancelled: null,
            prompts: results.map(res => res.prompts).flat(),
            answers: results.map(res => res.answers).flat(),
        };
    }
}
exports.default = ArgumentCollector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL2NvbGxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLDBEQU1vQjtBQTREcEIsMERBQTBEO0FBQzFELE1BQXFCLGlCQUFpQjtJQUdsQyxzQ0FBc0M7SUFDL0IsSUFBSSxDQUE4QjtJQUN6Qyw4REFBOEQ7SUFDdkQsV0FBVyxDQUFTO0lBRTNCOzs7O09BSUc7SUFDSCxZQUFtQixNQUFzQixFQUFFLElBQVUsRUFBRSxXQUFXLEdBQUcsUUFBUTtRQUN6RSxJQUFJLENBQUMsTUFBTTtZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxXQUFXLEtBQUssSUFBSTtZQUFFLFdBQVcsR0FBRyxRQUFRLENBQUM7UUFFakQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFL0IsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxJQUFJLFdBQVc7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1lBQzNGLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJO2dCQUFFLFdBQVcsR0FBRyxJQUFJLENBQUM7aUJBQzVDLElBQUksV0FBVztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7WUFDbkcsK0RBQStEO1lBQy9ELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxrQkFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0JBQUUsV0FBVyxHQUFHLElBQUksQ0FBQztTQUNqRDtJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxNQUFNLENBQ2YsT0FBd0IsRUFBRSxXQUFxQixFQUFFLEVBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXO1FBRWpGLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ3RDLG9GQUFvRjtRQUNwRixNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDN0MsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUN0QixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUVqQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sTUFBTSxHQUE0QixFQUFFLENBQUM7UUFDM0MsTUFBTSxPQUFPLEdBQXFCLEVBQUUsQ0FBQztRQUVyQyxJQUFJO1lBQ0EsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsNENBQTRDO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQzNCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUN2RSxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXJCLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRTtvQkFDbEIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDckIsT0FBTzt3QkFDSCxNQUFNLEVBQUUsSUFBSTt3QkFDWixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7d0JBQzNCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRTt3QkFDL0MsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFO3FCQUNsRCxDQUFDO2lCQUNMO2dCQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQzthQUNsQztTQUNKO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sR0FBRyxDQUFDO1NBQ2I7UUFFRCxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLE9BQU87WUFDSCxNQUFNLEVBQUUsTUFBaUM7WUFDekMsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDL0MsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFO1NBQ2xELENBQUM7SUFDTixDQUFDO0NBQ0o7QUF2RkQsb0NBdUZDIn0=