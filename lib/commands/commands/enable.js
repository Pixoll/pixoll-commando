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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5hYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL2VuYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUV0QyxtREFBa0Q7QUFHbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxVQUFVO1FBQ2YsS0FBSyxFQUFFLGVBQWU7UUFDdEIsTUFBTSxFQUFFLGtEQUFrRDtRQUMxRCxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0tBQzdCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSxjQUF5QjtJQUNoRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDO1lBQ25ELEtBQUssRUFBRSxVQUFVO1lBQ2pCLFdBQVcsRUFBRSxxQ0FBcUM7WUFDbEQsbUJBQW1CLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7SUFHcEM7WUFDUSxRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDO1lBQzVELGVBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUNsQyxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsUUFBUSxFQUFjO1FBQzlELE1BQU0sU0FBUyxHQUFHLE9BQU8sSUFBSSxRQUFRLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUM3QyxNQUFNLGdCQUFnQixHQUFHLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDNUUsQ0FBQyxDQUFDLGVBQWUsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlEQUFpRDtZQUNyRixDQUFDLENBQUMsRUFBRSxDQUFDO1FBRVQsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDM0MsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsUUFBUSxDQUFDLElBQUksTUFBTSxJQUFJLHNCQUFzQixnQkFBZ0IsR0FBRyxDQUFDLENBQUM7WUFDL0YsT0FBTztTQUNWO1FBRUQsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsUUFBUSxDQUFDLElBQUksTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7Q0FDSjtBQWpDRCxnQ0FpQ0MifQ==