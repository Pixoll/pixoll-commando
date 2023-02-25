import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument, { ArgumentInfo, ArgumentResponse, ArgumentTypeString, ArgumentTypeStringMap } from './argument';
/** Result object from obtaining argument values from an {@link ArgumentCollector} */
export interface ArgumentCollectorResult<T = Record<string, unknown>> {
    /** Final values for the arguments, mapped by their keys */
    values: T | null;
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
export type MapArguments<Args extends ArgumentInfo[] = ArgumentInfo[]> = {
    [A in Args[number] as A['key']]: (A['required'] extends false ? null : never) | (A['type'] extends ArgumentTypeString ? ArgumentTypeStringMap[A['type']] : (A['type'] extends ArgumentTypeString[] ? ArgumentTypeStringMap[A['type'][number]] : unknown));
};
/** Obtains, validates, and prompts for argument values */
export default class ArgumentCollector<Args extends ArgumentInfo[]> {
    /** Client this collector is for */
    readonly client: CommandoClient;
    /** Arguments the collector handles */
    args: Argument[];
    /** Maximum number of times to prompt for a single argument */
    promptLimit: number;
    /**
     * @param client - Client the collector will use
     * @param args - Arguments for the collector
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    constructor(client: CommandoClient, args: Args, promptLimit?: number);
    /**
     * Obtains values for the arguments, prompting if necessary.
     * @param msg - Message that the collector is being triggered by
     * @param provided - Values that are already available
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    obtain(msg: CommandoMessage, provided?: unknown[], promptLimit?: number): Promise<ArgumentCollectorResult<MapArguments<Args>>>;
}
