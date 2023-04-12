import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';
declare const args: readonly [{
    readonly key: "cmdOrGrp";
    readonly label: "command/group";
    readonly prompt: "Which command or group would you like to reload?";
    readonly type: readonly ["group", "command"];
}];
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
export default class ReloadCommand extends Command<boolean, RawArgs> {
    constructor(client: CommandoClient);
    run(context: CommandContext, { cmdOrGrp }: ParsedArgs): Promise<void>;
}
export {};
