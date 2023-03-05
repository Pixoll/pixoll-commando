import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument, {
    ArgumentInfo,
    ArgumentResponse,
    ArgumentResult,
    ArgumentTypeString,
    ArgumentTypeStringMap,
} from './argument';
import { CommandArgumentsResolvable } from './base';

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

export type ParseRawArguments<Args extends CommandArgumentsResolvable = ArgumentInfo[]> = {
    // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
    [A in Args[number]as A['key']]: (
        A['default'] extends unknown
        ? (A['required'] extends false ? null : never)
        : A['default']
    ) | (
        A['oneOf'] extends Array<infer U> | ReadonlyArray<infer U>
        ? U
        : A['type'] extends ArgumentTypeString
        ? ArgumentTypeStringMap[A['type']]
        : (
            A['type'] extends ArgumentTypeString[] | readonly ArgumentTypeString[]
            ? ArgumentTypeStringMap[A['type'][number]]
            : unknown
        )
    );
};

export type ArgumentCollectorArgs<Args extends CommandArgumentsResolvable> = Array<Argument<keyof {
    [Type in Args[number]['type']as Type extends undefined ? ArgumentTypeString
    : Type extends Array<infer U> | ReadonlyArray<infer U> ? U : Type]: null;
}>>;

/** Obtains, validates, and prompts for argument values */
export default class ArgumentCollector<Args extends CommandArgumentsResolvable> {
    /** Client this collector is for */
    declare public readonly client: CommandoClient;
    /** Arguments the collector handles */
    public args: ArgumentCollectorArgs<Args>;
    /** Maximum number of times to prompt for a single argument */
    public promptLimit: number;

    /**
     * @param client - Client the collector will use
     * @param args - Arguments for the collector
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    public constructor(client: CommandoClient, args: Args, promptLimit = Infinity) {
        if (!client) throw new TypeError('Collector client must be specified.');
        if (!args || !Array.isArray(args)) throw new TypeError('Collector args must be an array.');
        if (promptLimit === null) promptLimit = Infinity;

        Object.defineProperty(this, 'client', { value: client });
        this.args = new Array(args.length);
        this.promptLimit = promptLimit;

        let hasInfinite = false;
        let hasOptional = false;
        for (let i = 0; i < args.length; i++) {
            if (hasInfinite) throw new Error('No other argument may come after an infinite argument.');
            if (args[i].default !== null) hasOptional = true;
            else if (hasOptional) throw new Error('Required arguments may not come after optional arguments.');
            // @ts-expect-error: Argument's constructor is set as protected
            this.args[i] = new Argument(this.client, args[i]);
            if (this.args[i].infinite) hasInfinite = true;
        }
    }

    /**
     * Obtains values for the arguments, prompting if necessary.
     * @param message - Message that the collector is being triggered by
     * @param provided - Values that are already available
     * @param promptLimit - Maximum number of times to prompt for a single argument
     */
    public async obtain(
        message: CommandoMessage, provided: string[] = [], promptLimit = this.promptLimit
    ): Promise<ArgumentCollectorResult<ParseRawArguments<Args>>> {
        const { author, channelId } = message;
        // @ts-expect-error: _awaiting should not be used outside of class CommandDispatcher
        const { _awaiting } = this.client.dispatcher;
        const { args } = this;
        const id = author.id + channelId;

        _awaiting.add(id);
        const values: Record<string, unknown> = {};
        const results: ArgumentResult[] = [];

        try {
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                // eslint-disable-next-line no-await-in-loop
                const result = await arg.obtain(
                    message, (arg.infinite ? provided.slice(i) : provided[i]) ?? '', promptLimit
                );
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
        } catch (err) {
            _awaiting.delete(id);
            throw err;
        }

        _awaiting.delete(id);
        return {
            values: values as ParseRawArguments<Args>,
            cancelled: null,
            prompts: results.map(res => res.prompts).flat(),
            answers: results.map(res => res.answers).flat(),
        };
    }
}
