import Command, { CommandContext } from '../base';
import CommandoClient from '../../client';
import { ParseRawArguments } from '../collector';
declare const args: readonly [{
    readonly key: "script";
    readonly prompt: "What code would you like to evaluate?";
    readonly type: "string";
}];
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
export default class EvalCommand extends Command<boolean, RawArgs> {
    protected lastResult: unknown;
    protected _sensitivePattern: RegExp | null;
    constructor(client: CommandoClient);
    run(context: CommandContext, { script }: ParsedArgs): Promise<void>;
    protected makeResultMessages(result: unknown, hrDiff: [number, number], input?: string | null): string[];
    protected get sensitivePattern(): RegExp;
}
export {};
