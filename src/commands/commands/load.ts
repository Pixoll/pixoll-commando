import { access, constants } from 'fs';
import { oneLine } from 'common-tags';
import Command, { CommandContext } from '../base';
import CommandoClient from '../../client';
import CommandoMessage from '../../extensions/message';
import { ParseRawArguments } from '../collector';
import { ReadonlyArgumentInfo } from '../argument';

declare const require: NodeRequire;

const args = [{
    key: 'command',
    prompt: 'Which command would you like to load?',
    async validate(value: string | undefined, message: CommandoMessage): Promise<boolean | string> {
        if (!value) return false;
        const split = value.split(':');
        if (split.length !== 2) return false;
        const { registry } = message.client;
        if (registry.findCommands(value).length > 0) {
            return 'That command is already registered.';
        }
        const cmdPath = registry.resolveCommandPath(split[0], split[1]);
        let valid = true;
        access(cmdPath, constants.R_OK, err => valid = !!err);
        return valid;
    },
    parse(value: string, message: CommandoMessage): Command {
        const split = value.split(':');
        const cmdPath = message.client.registry.resolveCommandPath(split[0], split[1]);
        delete require.cache[cmdPath];
        return require(cmdPath);
    },
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class LoadCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'load',
            aliases: ['load-command'],
            group: 'commands',
            description: 'Loads a new command.',
            detailedDescription: oneLine`
				The argument must be full name of the command in the format of \`group:memberName\`.
				Only the bot owner(s) may use this command.
			`,
            examples: ['load some-command'],
            ownerOnly: true,
            guarded: true,
            args,
        });
    }

    public async run(context: CommandContext, args: ParsedArgs): Promise<void> {
        const { client } = this;
        const { registry, shard } = client;
        registry.registerCommand(args.command);
        const command = registry.commands.last();

        if (shard) {
            try {
                const { ids } = shard;
                await shard.broadcastEval(() => {
                    if (!shard.ids.some(id => ids.includes(id))) {
                        const cmdPath = registry.resolveCommandPath('${command?.groupID}', '${command?.name}');
                        delete require.cache[cmdPath];
                        registry.registerCommand(require(cmdPath));
                    }
                });
            } catch (error) {
                client.emit('warn', 'Error when broadcasting command load to other shards');
                client.emit('error', error as Error);
                await context.reply(`Loaded \`${command?.name}\` command, but failed to load on other shards.`);
                return;
            }
        }

        await context.reply(`Loaded \`${command?.name}\` command${shard ? ' on all shards' : ''}.`);
    }
}
