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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWwvcHJlZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQW9EO0FBRXBELG1EQUFrRDtBQUdsRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsa0RBQWtEO1FBQzFELElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEVBQUU7UUFDUCxPQUFPLEVBQUUsRUFBRTtLQUNkLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSxjQUF5QjtJQUNoRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsTUFBTSxFQUFFLGlCQUFpQjtZQUN6QixtQkFBbUIsRUFBRSxJQUFBLHFCQUFPLEVBQUE7Ozs7O0lBS3BDO1lBQ1EsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDO1lBQ2hGLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBYztRQUMxRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRWxELHlCQUF5QjtRQUN6QixJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3JELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFBLDBCQUFZLEVBQUE7TUFDdEMsYUFBYSxDQUFDLENBQUMsQ0FBQywyQkFBMkIsYUFBYSxLQUFLLENBQUMsQ0FBQyxDQUFDLDZCQUE2QjsyQkFDeEUsY0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7SUFDL0MsQ0FBQyxDQUFDO1lBQ00sT0FBTztTQUNWO1FBRUQsdURBQXVEO1FBQ3ZELElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzlFLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO2dCQUMxRSxPQUFPO2FBQ1Y7U0FDSjthQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1lBQ25GLE9BQU87U0FDVjtRQUVELGtCQUFrQjtRQUNsQixNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0MsTUFBTSxNQUFNLEdBQUcsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDeEQsTUFBTSxTQUFTLEdBQUcsU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFFMUQsSUFBSSxLQUFLO1lBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7O1lBQy9CLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBRS9CLE1BQU0sUUFBUSxHQUFHLFNBQVMsS0FBSyxTQUFTO1lBQ3BDLENBQUMsQ0FBQyxzREFBc0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRztZQUMvRyxDQUFDLENBQUMsTUFBTTtnQkFDSixDQUFDLENBQUMsK0JBQStCLFlBQVksSUFBSTtnQkFDakQsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDO1FBRWhELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsMEJBQTBCLGNBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFGLENBQUM7Q0FDSjtBQTFERCxnQ0EwREMifQ==