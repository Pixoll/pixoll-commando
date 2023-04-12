import Command, { CommandContext } from '../base';
import CommandoClient from '../../client';
import CommandoMessage from '../../extensions/message';
import { ParseRawArguments } from '../collector';
declare const args: readonly [{
    readonly key: "command";
    readonly prompt: "Which command would you like to load?";
    readonly validate: (value: string | undefined, message: CommandoMessage) => Promise<boolean | string>;
    readonly parse: (value: string, message: CommandoMessage) => Command;
}];
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
export default class LoadCommand extends Command<boolean, RawArgs> {
    constructor(client: CommandoClient);
    run(context: CommandContext, args: ParsedArgs): Promise<void>;
}
export {};
