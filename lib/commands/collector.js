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
     * @param msg - Message that the collector is being triggered by
     * @param provided - Values that are already available
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    async obtain(msg, provided = [], promptLimit = this.promptLimit) {
        const { author, channelId } = msg;
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
                const result = await arg.obtain(msg, (arg.infinite ? provided.slice(i) : provided[i]), promptLimit);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL2NvbGxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLDBEQU1vQjtBQTRCcEIsMERBQTBEO0FBQzFELE1BQXFCLGlCQUFpQjtJQUdsQyxzQ0FBc0M7SUFDL0IsSUFBSSxDQUFhO0lBQ3hCLDhEQUE4RDtJQUN2RCxXQUFXLENBQVM7SUFFM0I7Ozs7T0FJRztJQUNILFlBQW1CLE1BQXNCLEVBQUUsSUFBVSxFQUFFLFdBQVcsR0FBRyxRQUFRO1FBQ3pFLElBQUksQ0FBQyxNQUFNO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUMzRixJQUFJLFdBQVcsS0FBSyxJQUFJO1lBQUUsV0FBVyxHQUFHLFFBQVEsQ0FBQztRQUVqRCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUUvQixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xDLElBQUksV0FBVztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7WUFDM0YsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUk7Z0JBQUUsV0FBVyxHQUFHLElBQUksQ0FBQztpQkFDNUMsSUFBSSxXQUFXO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztZQUNuRywrREFBK0Q7WUFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUTtnQkFBRSxXQUFXLEdBQUcsSUFBSSxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksS0FBSyxDQUFDLE1BQU0sQ0FDZixHQUFvQixFQUFFLFdBQXNCLEVBQUUsRUFBRSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVc7UUFFOUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDbEMsb0ZBQW9GO1FBQ3BGLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUM3QyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBRWpDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEIsTUFBTSxNQUFNLEdBQTRCLEVBQUUsQ0FBQztRQUMzQyxNQUFNLE9BQU8sR0FBcUIsRUFBRSxDQUFDO1FBRXJDLElBQUk7WUFDQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQiw0Q0FBNEM7Z0JBQzVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FDM0IsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFXLEVBQUUsV0FBVyxDQUMvRSxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXJCLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRTtvQkFDbEIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDckIsT0FBTzt3QkFDSCxNQUFNLEVBQUUsSUFBSTt3QkFDWixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7d0JBQzNCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRTt3QkFDL0MsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFO3FCQUNsRCxDQUFDO2lCQUNMO2dCQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQzthQUNsQztTQUNKO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sR0FBRyxDQUFDO1NBQ2I7UUFFRCxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLE9BQU87WUFDSCxNQUFNLEVBQUUsTUFBNEI7WUFDcEMsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDL0MsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFO1NBQ2xELENBQUM7SUFDTixDQUFDO0NBQ0o7QUF2RkQsb0NBdUZDIn0=