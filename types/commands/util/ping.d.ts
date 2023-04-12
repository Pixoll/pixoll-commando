import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
export default class PingCommand extends Command {
    constructor(client: CommandoClient);
    run(context: CommandContext): Promise<void>;
}
