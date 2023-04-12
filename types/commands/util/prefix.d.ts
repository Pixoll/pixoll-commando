import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';
declare const args: readonly [{
    readonly key: "prefix";
    readonly prompt: "What would you like to set the bot's prefix to?";
    readonly type: "string";
    readonly max: 15;
    readonly default: "";
}];
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
export default class PrefixCommand extends Command<boolean, RawArgs> {
    constructor(client: CommandoClient);
    run(context: CommandContext, { prefix: passedPrefix }: ParsedArgs): Promise<void>;
}
export {};
