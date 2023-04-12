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
        prompt: 'Which command or group would you like to disable?',
        type: ['group', 'command'],
    }];
class DisableCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'disable',
            aliases: ['disable-command', 'cmd-off', 'command-off'],
            group: 'commands',
            description: 'Disables a command or command group.',
            detailedDescription: (0, common_tags_1.oneLine) `
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
            examples: ['disable util', 'disable Utility', 'disable prefix'],
            userPermissions: ['Administrator'],
            guarded: true,
            args,
        });
    }
    async run(context, { cmdOrGrp }) {
        const type = 'group' in cmdOrGrp ? 'command' : 'group';
        if (!cmdOrGrp.isEnabledIn(context.guild, true)) {
            await context.reply(`The \`${cmdOrGrp.name}\` ${type} is already disabled.`);
            return;
        }
        if (cmdOrGrp.guarded) {
            await context.reply(`You cannot disable the \`${cmdOrGrp.name}\` ${type}.`);
            return;
        }
        cmdOrGrp.setEnabledIn(context.guild, false);
        await context.reply(`Disabled the \`${cmdOrGrp.name}\` ${type}.`);
    }
}
exports.default = DisableCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb21tYW5kcy9kaXNhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQXNDO0FBRXRDLG1EQUFrRDtBQUdsRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFVBQVU7UUFDZixLQUFLLEVBQUUsZUFBZTtRQUN0QixNQUFNLEVBQUUsbURBQW1EO1FBQzNELElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7S0FDN0IsQ0FBVSxDQUFDO0FBS1osTUFBcUIsY0FBZSxTQUFRLGNBQXlCO0lBQ2pFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUM7WUFDdEQsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxtQkFBbUIsRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztJQUdwQztZQUNRLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQztZQUMvRCxlQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDbEMsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLFFBQVEsRUFBYztRQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUV2RCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQzVDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLFFBQVEsQ0FBQyxJQUFJLE1BQU0sSUFBSSx1QkFBdUIsQ0FBQyxDQUFDO1lBQzdFLE9BQU87U0FDVjtRQUVELElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUNsQixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLFFBQVEsQ0FBQyxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQztZQUM1RSxPQUFPO1NBQ1Y7UUFFRCxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixRQUFRLENBQUMsSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUM7SUFDdEUsQ0FBQztDQUNKO0FBbENELGlDQWtDQyJ9