import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';
declare const args: readonly [{
    readonly key: "command";
    readonly prompt: "Which command would you like to unload?";
    readonly type: "command";
}];
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
export default class UnloadCommandCommand extends Command<boolean, RawArgs> {
    constructor(client: CommandoClient);
    run(context: CommandContext, { command }: ParsedArgs): Promise<void>;
}
export {};
