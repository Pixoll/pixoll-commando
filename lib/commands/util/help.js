"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../base"));
const util_1 = __importDefault(require("../../util"));
const args = [{
        key: 'command',
        prompt: 'Which command would you like to view the help for?',
        type: 'string',
        default: '',
    }];
class HelpCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'util',
            aliases: ['commands'],
            description: 'Displays a list of available commands, or detailed information for a specified command.',
            detailedDescription: (0, common_tags_1.oneLine) `
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
            examples: ['help', 'help prefix'],
            guarded: true,
            args,
        });
    }
    async run(context, { command }) {
        const { author, client, channel, guild } = context;
        const { registry } = client;
        const groups = registry.groups;
        const commands = registry.findCommands(command, false, context);
        const showAll = command.toLowerCase() === 'all';
        if (command && !showAll) {
            if (commands.length === 0) {
                const prefix = channel?.isDMBased() ? null : undefined;
                await context.reply(`Unable to identify command. Use ${base_1.default.usage(this.name, prefix, prefix)} to view the list of all commands.`);
                return;
            }
            if (commands.length > 15) {
                await context.reply('Multiple commands found. Please be more specific.');
                return;
            }
            if (commands.length > 1) {
                await context.reply(util_1.default.disambiguation(commands, 'commands'));
                return;
            }
            const help = mapCommandHelp(commands[0]);
            await sendDM(context, author, help);
            return;
        }
        const commandUsage = base_1.default.usage('command', guild ? guild.prefix : null, client.user);
        const exampleCommand = base_1.default.usage('prefix', guild ? guild.prefix : null, client.user);
        const dmCommand = base_1.default.usage('command', null, null);
        const commandsList = createCommandsList(context, groups, showAll);
        const help = (0, common_tags_1.stripIndents) `
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
exports.default = HelpCommand;
async function sendDM(context, user, message) {
    const messages = util_1.default.splitMessage(message);
    try {
        for (const chunk of messages) {
            // eslint-disable-next-line no-await-in-loop
            await user.send(chunk);
        }
        if (!context.channel?.isDMBased()) {
            await context.reply('Sent you a DM with information.');
        }
    }
    catch (err) {
        await context.reply('Unable to send you the help DM. You probably have DMs disabled.');
    }
}
function createCommandsList(context, groups, showAll) {
    return groups
        .filter(group => group.commands.some(command => !command.hidden && (showAll || command.isUsable(context))))
        .map(group => {
        const groupCommands = group.commands
            .filter(command => !command.hidden && (showAll || command.isUsable(context)))
            .map(command => `**${command.name}:** ${command.description}${command.nsfw ? ' (NSFW)' : ''}`)
            .join('\n');
        return (0, common_tags_1.stripIndents) `
            __${group.name}__
            ${groupCommands}
            `;
    })
        .join('\n\n');
}
function mapCommandHelp(command) {
    let help = (0, common_tags_1.stripIndents) `
    ${(0, common_tags_1.oneLine) `
        __Command **${command.name}**:__ ${command.description}
        ${command.guildOnly ? ' (Usable only in servers)' : ''}
        ${command.nsfw ? ' (NSFW)' : ''}
    `}

    **Format:** ${base_1.default.usage(command.format ? ` ${command.format}` : '')}
    `;
    if (command.aliases.length > 0)
        help += `\n**Aliases:** ${command.aliases.join(', ')}`;
    help += `\n**Group:** ${command.group.name} (\`${command.groupId}:${command.memberName}\`)`;
    if (command.details)
        help += `\n**Details:** ${command.details}`;
    if (command.examples)
        help += `\n**Examples:**\n${command.examples.join('\n')}`;
    return help;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsL2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBb0Q7QUFFcEQsbURBQWtEO0FBQ2xELHNEQUE4QjtBQU05QixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFNBQVM7UUFDZCxNQUFNLEVBQUUsb0RBQW9EO1FBQzVELElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7S0FDZCxDQUFvRCxDQUFDO0FBS3RELE1BQXFCLFdBQVksU0FBUSxjQUF5QjtJQUM5RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsTUFBTTtZQUNiLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUNyQixXQUFXLEVBQUUseUZBQXlGO1lBQ3RHLG1CQUFtQixFQUFFLElBQUEscUJBQU8sRUFBQTs7O0lBR3BDO1lBQ1EsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQztZQUNqQyxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsT0FBTyxFQUFjO1FBQzdELE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbkQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUM1QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQy9CLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMs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