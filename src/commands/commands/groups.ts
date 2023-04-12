import { stripIndents } from 'common-tags';
import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';

export default class GroupsCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'groups',
            aliases: ['list-groups', 'show-groups'],
            group: 'commands',
            description: 'Lists all command groups.',
            detailedDescription: 'Only administrators may use this command.',
            userPermissions: ['Administrator'],
            guarded: true,
        });
    }

    public run(context: CommandContext): void {
        const groups = this.client.registry.groups.map(grp =>
            `**${grp.name}:** ${grp.isEnabledIn(context.guild) ? 'Enabled' : 'Disabled'}`
        ).join('\n');

        context.reply(stripIndents`
			__**Groups**__
			${groups}
        `);
    }
}
