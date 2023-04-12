import Command, { CommandContext } from '../base';
import CommandoClient from '../../client';
import { ParseRawArguments } from '../collector';
declare const args: readonly [{
    readonly key: "command";
    readonly prompt: "Which command would you like to view the help for?";
    readonly type: "string";
    readonly default: "";
}];
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
export default class HelpCommand extends Command<boolean, RawArgs> {
    constructor(client: CommandoClient);
    run(context: CommandContext, { command }: ParsedArgs): Promise<void>;
}
export {};
