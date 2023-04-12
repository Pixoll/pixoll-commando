import { stripIndents, oneLine } from 'common-tags';
import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';
import { ParseRawArguments } from '../collector';

const args = [{
    key: 'prefix',
    prompt: 'What would you like to set the bot\'s prefix to?',
    type: 'string',
    max: 15,
    default: '',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class PrefixCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'prefix',
            group: 'util',
            description: 'Shows or sets the command prefix.',
            format: 'prefix <prefix>',
            detailedDescription: oneLine`
				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
				Only administrators may change the prefix.
			`,
            examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],
            args,
        });
    }

    public async run(context: CommandContext, { prefix: passedPrefix }: ParsedArgs): Promise<void> {
        const { author, guild, client, member } = context;

        // Just output the prefix
        if (!passedPrefix) {
            const currentPrefix = guild?.prefix || client.prefix;
            await context.reply(stripIndents`
				${currentPrefix ? `The command prefix is \`${currentPrefix}\`.` : 'There is no command prefix.'}
				To run commands, use ${Command.usage('command')}.
			`);
            return;
        }

        // Check the user's permission before changing anything
        if (guild) {
            if (!member?.permissions.has('Administrator') && !client.isOwner(context.author)) {
                await context.reply('Only administrators may change the command prefix.');
                return;
            }
        } else if (!client.isOwner(author)) {
            await context.reply('Only the bot owner(s) may change the global command prefix.');
            return;
        }

        // Save the prefix
        const lowercase = passedPrefix.toLowerCase();
        const prefix = lowercase === 'none' ? '' : passedPrefix;
        const newPrefix = lowercase === 'default' ? null : prefix;

        if (guild) guild.prefix = newPrefix;
        else client.prefix = newPrefix;

        const response = lowercase === 'default'
            ? `Reset the command prefix to the default (currently ${client.prefix ? `\`${client.prefix}\`` : 'no prefix'})`
            : prefix
                ? `Set the command prefix to \`${passedPrefix}\``
                : 'Removed the command prefix entirely';

        await context.reply(`${response}. To run commands, use ${Command.usage('command')}.`);
    }
}
