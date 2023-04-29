"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../base"));
const args = [{
        key: 'prefix',
        prompt: 'What would you like to set the bot\'s prefix to?',
        type: 'string',
        max: 15,
        default: '',
    }];
class PrefixCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'prefix',
            group: 'util',
            description: 'Shows or sets the command prefix.',
            format: 'prefix <prefix>',
            detailedDescription: (0, common_tags_1.oneLine) `
				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
				Only administrators may change the prefix.
			`,
            examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],
            args,
        });
    }
    async run(context, { prefix: passedPrefix }) {
        const { author, guild, client, member } = context;
        // Just output the prefix
        if (!passedPrefix) {
            const currentPrefix = guild?.prefix || client.prefix;
            await context.reply((0, common_tags_1.stripIndents) `
				${currentPrefix ? `The command prefix is \`${currentPrefix}\`.` : 'There is no command prefix.'}
				To run commands, use ${base_1.default.usage('command')}.
			`);
            return;
        }
        // Check the user's permission before changing anything
        if (guild) {
            if (!member?.permissions.has('Administrator') && !client.isOwner(context.author)) {
                await context.reply('Only administrators may change the command prefix.');
                return;
            }
        }
        else if (!client.isOwner(author)) {
            await context.reply('Only the bot owner(s) may change the global command prefix.');
            return;
        }
        // Save the prefix
        const lowercase = passedPrefix.toLowerCase();
        const prefix = lowercase === 'none' ? '' : passedPrefix;
        const newPrefix = lowercase === 'default' ? null : prefix;
        if (guild)
            guild.prefix = newPrefix;
        else
            client.prefix = newPrefix;
        const response = lowercase === 'default'
            ? `Reset the command prefix to the default (currently ${client.prefix ? `\`${client.prefix}\`` : 'no prefix'})`
            : prefix
                ? `Set the command prefix to \`${passedPrefix}\``
                : 'Removed the command prefix entirely';
        await context.reply(`${response}. To run commands, use ${base_1.default.usage('command')}.`);
    }
}
exports.default = PrefixCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWwvcHJlZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQW9EO0FBR3BELG1EQUFrRDtBQUdsRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsa0RBQWtEO1FBQzFELElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEVBQUU7UUFDUCxPQUFPLEVBQUUsRUFBRTtLQUNkLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsYUFBYyxTQUFRLGNBQXlCO0lBQ2hFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLG1CQUFtQixFQUFFLElBQUEscUJBQU8sRUFBQTs7Ozs7SUFLcEM7WUFDUSxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUM7WUFDaEYsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFjO1FBQzFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFbEQseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDckQsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUEsMEJBQVksRUFBQTtNQUN0QyxhQUFhLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixhQUFhLEtBQUssQ0FBQyxDQUFDLENBQUMsNkJBQTZCOzJCQUN4RSxjQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztJQUMvQyxDQUFDLENBQUM7WUFDTSxPQUFPO1NBQ1Y7UUFFRCx1REFBdUQ7UUFDdkQsSUFBSSxLQUFLLEVBQUU7WUFDUCxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUUsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7Z0JBQzFFLE9BQU87YUFDVjtTQUNKO2FBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDaEMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7WUFDbkYsT0FBTztTQUNWO1FBRUQsa0JBQWtCO1FBQ2xCLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM3QyxNQUFNLE1BQU0sR0FBRyxTQUFTLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUN4RCxNQUFNLFNBQVMsR0FBRyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUUxRCxJQUFJLEtBQUs7WUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQzs7WUFDL0IsTUFBTSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFFL0IsTUFBTSxRQUFRLEdBQUcsU0FBUyxLQUFLLFNBQVM7WUFDcEMsQ0FBQyxDQUFDLHNEQUFzRCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHO1lBQy9HLENBQUMsQ0FBQyxNQUFNO2dCQUNKLENBQUMsQ0FBQywrQkFBK0IsWUFBWSxJQUFJO2dCQUNqRCxDQUFDLENBQUMscUNBQXFDLENBQUM7UUFFaEQsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSwwQkFBMEIsY0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUNKO0FBMURELGdDQTBEQyJ9