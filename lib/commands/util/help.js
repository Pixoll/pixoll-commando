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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsL2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBb0Q7QUFFcEQsbURBQWtEO0FBQ2xELHNEQUE4QjtBQUs5QixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFNBQVM7UUFDZCxNQUFNLEVBQUUsb0RBQW9EO1FBQzVELElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7S0FDZCxDQUFVLENBQUM7QUFLWixNQUFxQixXQUFZLFNBQVEsY0FBeUI7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLE1BQU07WUFDYixPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDckIsV0FBVyxFQUFFLHlGQUF5RjtZQUN0RyxtQkFBbUIsRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztJQUdwQztZQUNRLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUM7WUFDakMsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLE9BQU8sRUFBYztRQUM3RCxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ25ELE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUMvQixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssQ0FBQztRQUVoRCxJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNyQixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixNQUFNLE1BQU0sR0FBRyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUN2RCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQ2YsbUNBQW1DLGNBQU8sQ0FBQyxLQUFLLENBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FDNUIsb0NBQW9DLENBQ3hDLENBQUM7Z0JBQ0YsT0FBTzthQUNWO1lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRTtnQkFDdEIsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JBQ3pFLE9BQU87YUFDVjtZQUVELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxPQUFPO2FBQ1Y7WUFFRCxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLFlBQVksR0FBRyxjQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEYsTUFBTSxjQUFjLEdBQUcsY0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sU0FBUyxHQUFHLGNBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RCxNQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxFLE1BQU0sSUFBSSxHQUFHLElBQUEsMEJBQVksRUFBQTtrQ0FDQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksU0FBUyxZQUFZLGtCQUFrQixjQUFjO3NEQUNsRSxTQUFTOztrQkFFN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztrQkFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzs7a0JBRWpDLE9BQU8sQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsS0FBSyxJQUFJLFNBQVMsRUFBRTs7Y0FFNUUsWUFBWTtTQUNqQixDQUFDO1FBRUYsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0NBQ0o7QUFyRUQsOEJBcUVDO0FBRUQsS0FBSyxVQUFVLE1BQU0sQ0FBQyxPQUF1QixFQUFFLElBQVUsRUFBRSxPQUFlO0lBQ3RFLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUMsSUFBSTtRQUNBLEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFO1lBQzFCLDRDQUE0QztZQUM1QyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDMUI7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRTtZQUMvQixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztTQUMxRDtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUVBQWlFLENBQUMsQ0FBQztLQUMxRjtBQUNMLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLE9BQXVCLEVBQUUsTUFBd0MsRUFBRSxPQUFnQjtJQUMzRyxPQUFPLE1BQU07U0FDUixNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUMzQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUM1RCxDQUFDO1NBQ0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ1QsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVE7YUFDL0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUM1RSxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxJQUFJLE9BQU8sT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQzdGLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoQixPQUFPLElBQUEsMEJBQVksRUFBQTtnQkFDZixLQUFLLENBQUMsSUFBSTtjQUNaLGFBQWE7YUFDZCxDQUFDO0lBQ04sQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxPQUFnQjtJQUNwQyxJQUFJLElBQUksR0FBRyxJQUFBLDBCQUFZLEVBQUE7TUFDckIsSUFBQSxxQkFBTyxFQUFBO3NCQUNTLE9BQU8sQ0FBQyxJQUFJLFNBQVMsT0FBTyxDQUFDLFdBQVc7VUFDcEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUU7VUFDcEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0tBQ2xDOztrQkFFYSxjQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDdEUsQ0FBQztJQUVGLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLElBQUksSUFBSSxrQkFBa0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUV2RixJQUFJLElBQUksZ0JBQWdCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsS0FBSyxDQUFDO0lBRTVGLElBQUksT0FBTyxDQUFDLE9BQU87UUFBRSxJQUFJLElBQUksa0JBQWtCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqRSxJQUFJLE9BQU8sQ0FBQyxRQUFRO1FBQUUsSUFBSSxJQUFJLG9CQUFvQixPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBRWhGLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMifQ==