"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../base"));
const args = [{
        key: 'cmdOrGrp',
        label: 'command/group',
        prompt: 'Which command or group would you like to enable?',
        type: ['group', 'command'],
    }];
class EnableCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'enable',
            aliases: ['enable-command', 'cmd-on', 'command-on'],
            group: 'commands',
            description: 'Enables a command or command group.',
            detailedDescription: (0, common_tags_1.oneLine) `
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
            examples: ['enable util', 'enable Utility', 'enable prefix'],
            userPermissions: ['Administrator'],
            guarded: true,
            args,
        });
    }
    async run(context, { cmdOrGrp }) {
        const isCommand = 'group' in cmdOrGrp;
        const type = isCommand ? 'command' : 'group';
        const commandException = isCommand && !cmdOrGrp.group.isEnabledIn(context.guild)
            ? `, but the \`${cmdOrGrp.group.name}\` group is disabled, so it still can't be used`
            : '';
        if (cmdOrGrp.isEnabledIn(context.guild, true)) {
            await context.reply(`The \`${cmdOrGrp.name}\` ${type} is already enabled${commandException}.`);
            return;
        }
        cmdOrGrp.setEnabledIn(context.guild, true);
        await context.reply(`Enabled the \`${cmdOrGrp.name}\` ${type}${commandException}.`);
    }
}
exports.default = EnableCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5hYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL2VuYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUd0QyxtREFBa0Q7QUFHbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxVQUFVO1FBQ2YsS0FBSyxFQUFFLGVBQWU7UUFDdEIsTUFBTSxFQUFFLGtEQUFrRDtRQUMxRCxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0tBQzdCLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsYUFBYyxTQUFRLGNBQXlCO0lBQ2hFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUM7WUFDbkQsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLHFDQUFxQztZQUNsRCxtQkFBbUIsRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztJQUdwQztZQUNRLFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7WUFDNUQsZUFBZSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQ2xDLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxRQUFRLEVBQWM7UUFDOUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxJQUFJLFFBQVEsQ0FBQztRQUN0QyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzdDLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUM1RSxDQUFDLENBQUMsZUFBZSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksaURBQWlEO1lBQ3JGLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFVCxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtZQUMzQyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxRQUFRLENBQUMsSUFBSSxNQUFNLElBQUksc0JBQXNCLGdCQUFnQixHQUFHLENBQUMsQ0FBQztZQUMvRixPQUFPO1NBQ1Y7UUFFRCxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixRQUFRLENBQUMsSUFBSSxNQUFNLElBQUksR0FBRyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7SUFDeEYsQ0FBQztDQUNKO0FBakNELGdDQWlDQyJ9