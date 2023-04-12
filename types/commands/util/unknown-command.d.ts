import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
export default class UnknownCommand extends Command {
    constructor(client: CommandoClient);
    run(context: CommandContext): void;
}
