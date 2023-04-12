import { oneLine } from 'common-tags';
import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';

const args = [{
    key: 'cmdOrGrp',
    label: 'command/group',
    prompt: 'Which command or group would you like to enable?',
    type: ['group', 'command'],
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class EnableCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'enable',
            aliases: ['enable-command', 'cmd-on', 'command-on'],
            group: 'commands',
            description: 'Enables a command or command group.',
            detailedDescription: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
            examples: ['enable util', 'enable Utility', 'enable prefix'],
            userPermissions: ['Administrator'],
            guarded: true,
            args,
        });
    }

    public async run(context: CommandContext, { cmdOrGrp }: ParsedArgs): Promise<void> {
        const isCommand = 'group' in cmdOrGrp;
        const type = isCommand ? 'command' : 'group';
        const commandException = isCommand && !cmdOrGrp.group.isEnabledIn(context.guild)
            ? `, but the \`${cmdOrGrp.group.name}\` group is disabled, so it still can't be used`
            : '';

        if (cmdOrGrp.isEnabledIn(context.guild, true)) {
            await context.reply(`The \`${cmdOrGrp.name}\` ${type} is already enabled${commandException}.`);
            return;
        }

        cmdOrGrp.setEnabledIn(context.guild, true);
        await context.reply(`Enabled the \`${cmdOrGrp.name}\` ${type}${commandException}.`);
    }
}
