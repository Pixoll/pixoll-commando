import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
export default class GroupsCommand extends Command {
    constructor(client: CommandoClient);
    run(context: CommandContext): void;
}
