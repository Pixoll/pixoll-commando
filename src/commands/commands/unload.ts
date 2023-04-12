import { oneLine } from 'common-tags';
import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';

const args = [{
    key: 'command',
    prompt: 'Which command would you like to unload?',
    type: 'command',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class UnloadCommandCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'unload',
            aliases: ['unload-command'],
            group: 'commands',
            description: 'Unloads a command.',
            detailedDescription: oneLine`
				The argument must be the name/ID (partial or whole) of a command.
				Only the bot owner(s) may use this command.
			`,
            examples: ['unload some-command'],
            ownerOnly: true,
            guarded: true,
            args,
        });
    }

    public async run(context: CommandContext, { command }: ParsedArgs): Promise<void> {
        const { client } = this;
        const { shard, registry } = client;
        command.unload();

        if (shard) {
            try {
                const { ids } = shard;
                await shard.broadcastEval(() => {
                    if (!shard.ids.some(id => ids.includes(id))) {
                        registry.commands.get(command.name)?.unload();
                    }
                });
            } catch (error) {
                client.emit('warn', 'Error when broadcasting command unload to other shards');
                client.emit('error', error as Error);
                await context.reply(`Unloaded \`${command.name}\` command, but failed to unload on other shards.`);
                return;
            }
        }

        await context.reply(`Unloaded \`${command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
    }
}
