import { oneLine } from 'common-tags';
import CommandoClient from '../../client';
import { ReadonlyArgumentInfo } from '../argument';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';

const args = [{
    key: 'cmdOrGrp',
    label: 'command/group',
    prompt: 'Which command or group would you like to disable?',
    type: ['group', 'command'],
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class DisableCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'disable',
            aliases: ['disable-command', 'cmd-off', 'command-off'],
            group: 'commands',
            description: 'Disables a command or command group.',
            detailedDescription: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
            examples: ['disable util', 'disable Utility', 'disable prefix'],
            userPermissions: ['Administrator'],
            guarded: true,
            args,
        });
    }

    public async run(context: CommandContext, { cmdOrGrp }: ParsedArgs): Promise<void> {
        const type = 'group' in cmdOrGrp ? 'command' : 'group';

        if (!cmdOrGrp.isEnabledIn(context.guild, true)) {
            await context.reply(`The \`${cmdOrGrp.name}\` ${type} is already disabled.`);
            return;
        }

        if (cmdOrGrp.guarded) {
            await context.reply(`You cannot disable the \`${cmdOrGrp.name}\` ${type}.`);
            return;
        }

        cmdOrGrp.setEnabledIn(context.guild, false);
        await context.reply(`Disabled the \`${cmdOrGrp.name}\` ${type}.`);
    }
}
