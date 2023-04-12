import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';

export default class UnknownCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'unknown-command',
            group: 'util',
            description: 'Displays help information for when an unknown command is used.',
            examples: ['unknown-command kickeverybodyever'],
            unknown: true,
            hidden: true,
        });
    }

    public run(context: CommandContext): void {
        const usage = Command.usage(
            'help',
            context.guild ? undefined : null,
            context.guild ? undefined : null
        );
        context.reply(`Unknown command. Use ${usage} to view the command list.`);
    }
}
