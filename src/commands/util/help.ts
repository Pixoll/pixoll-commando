import { stripIndents, oneLine } from 'common-tags';
import { Collection, User } from 'discord.js';
import Command, { CommandContext } from '../base';
import Util from '../../util';
import CommandoClient from '../../client';
import { ParseRawArguments } from '../collector';
import CommandGroup from '../group';

const args = [{
    key: 'command',
    prompt: 'Which command would you like to view the help for?',
    type: 'string',
    default: '',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class HelpCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'help',
            group: 'util',
            aliases: ['commands'],
            description: 'Displays a list of available commands, or detailed information for a specified command.',
            detailedDescription: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
            examples: ['help', 'help prefix'],
            guarded: true,
            args,
        });
    }

    public async run(context: CommandContext, { command }: ParsedArgs): Promise<void> {
        const { author, client, channel, guild } = context;
        const { registry } = client;
        const groups = registry.groups;
        const commands = registry.findCommands(command, false, context);
        const showAll = command.toLowerCase() === 'all';

        if (command && !showAll) {
            if (commands.length === 0) {
                const prefix = channel?.isDMBased() ? null : undefined;
                await context.reply(
                    `Unable to identify command. Use ${Command.usage(
                        this.name, prefix, prefix
                    )} to view the list of all commands.`
                );
                return;
            }

            if (commands.length > 15) {
                await context.reply('Multiple commands found. Please be more specific.');
                return;
            }

            if (commands.length > 1) {
                await context.reply(Util.disambiguation(commands, 'commands'));
                return;
            }

            const help = mapCommandHelp(commands[0]);
            await sendDM(context, author, help);
            return;
        }

        const commandUsage = Command.usage('command', guild ? guild.prefix : null, client.user);
        const exampleCommand = Command.usage('prefix', guild ? guild.prefix : null, client.user);
        const dmCommand = Command.usage('command', null, null);
        const commandsList = createCommandsList(context, groups, showAll);

        const help = stripIndents`
            To run a command in ${guild ? guild.name : 'any server'}, use ${commandUsage}. For example, ${exampleCommand}.
            To run a command in this DM, simply use ${dmCommand} with no prefix.

            Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
            Use ${this.usage(undefined, null, null)} to view a list of *all* commands, not just available ones.

            __**${showAll ? 'All commands' : `Available commands in ${guild || 'this DM'}`}**__

            ${commandsList}
        `;

        await sendDM(context, author, help);
    }
}

async function sendDM(context: CommandContext, user: User, message: string): Promise<void> {
    const messages = Util.splitMessage(message);
    try {
        for (const chunk of messages) {
            // eslint-disable-next-line no-await-in-loop
            await user.send(chunk);
        }

        if (!context.channel?.isDMBased()) {
            await context.reply('Sent you a DM with information.');
        }
    } catch (err) {
        await context.reply('Unable to send you the help DM. You probably have DMs disabled.');
    }
}

function createCommandsList(context: CommandContext, groups: Collection<string, CommandGroup>, showAll: boolean): string {
    return groups
        .filter(group => group.commands.some(command =>
            !command.hidden && (showAll || command.isUsable(context))
        ))
        .map(group => {
            const groupCommands = group.commands
                .filter(command => !command.hidden && (showAll || command.isUsable(context)))
                .map(command => `**${command.name}:** ${command.description}${command.nsfw ? ' (NSFW)' : ''}`)
                .join('\n');

            return stripIndents`
            __${group.name}__
            ${groupCommands}
            `;
        })
        .join('\n\n');
}

function mapCommandHelp(command: Command): string {
    let help = stripIndents`
    ${oneLine`
        __Command **${command.name}**:__ ${command.description}
        ${command.guildOnly ? ' (Usable only in servers)' : ''}
        ${command.nsfw ? ' (NSFW)' : ''}
    `}

    **Format:** ${Command.usage(command.format ? ` ${command.format}` : '')}
    `;

    if (command.aliases.length > 0) help += `\n**Aliases:** ${command.aliases.join(', ')}`;

    help += `\n**Group:** ${command.group.name} (\`${command.groupId}:${command.memberName}\`)`;

    if (command.details) help += `\n**Details:** ${command.details}`;
    if (command.examples) help += `\n**Examples:**\n${command.examples.join('\n')}`;

    return help;
}
