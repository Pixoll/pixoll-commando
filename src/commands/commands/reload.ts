import { oneLine } from 'common-tags';
import CommandoClient from '../../client';
import { ReadonlyArgumentInfo } from '../argument';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';

const args = [{
    key: 'cmdOrGrp',
    label: 'command/group',
    prompt: 'Which command or group would you like to reload?',
    type: ['group', 'command'],
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ReloadCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'reload',
            aliases: ['reload-command'],
            group: 'commands',
            description: 'Reloads a command or command group.',
            detailedDescription: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Providing a command group will reload all of the commands in that group.
				Only the bot owner(s) may use this command.
			`,
            examples: ['reload some-command'],
            ownerOnly: true,
            guarded: true,
            args,
        });
    }

    public async run(context: CommandContext, { cmdOrGrp }: ParsedArgs): Promise<void> {
        const { client } = this;
        const { shard, registry } = client;
        const isCommand = 'group' in cmdOrGrp;
        const type = isCommand ? 'commands' : 'groups';
        cmdOrGrp.reload();

        if (shard) {
            try {
                const { ids } = shard;
                await shard.broadcastEval(() => {
                    if (!shard.ids.some(id => ids.includes(id))) {
                        registry[type].get(isCommand ? cmdOrGrp.name : cmdOrGrp.id)?.reload();
                    }
                });
            } catch (error) {
                client.emit('warn', 'Error when broadcasting command reload to other shards');
                client.emit('error', error as Error);
                if (isCommand) {
                    await context.reply(`Reloaded \`${cmdOrGrp.name}\` command, but failed to reload on other shards.`);
                    return;
                }

                await context.reply(
                    `Reloaded all of the commands in the \`${cmdOrGrp.name}\` group, but failed to reload on other shards.`
                );
                return;
            }
        }

        if (isCommand) {
            await context.reply(`Reloaded \`${cmdOrGrp.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
            return;
        }

        await context.reply(
            `Reloaded all of the commands in the \`${cmdOrGrp.name}\` group${this.client.shard ? ' on all shards' : ''}.`
        );
    }
}
