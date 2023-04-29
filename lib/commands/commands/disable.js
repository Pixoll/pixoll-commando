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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb21tYW5kcy9kaXNhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQXNDO0FBR3RDLG1EQUFrRDtBQUdsRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFVBQVU7UUFDZixLQUFLLEVBQUUsZUFBZTtRQUN0QixNQUFNLEVBQUUsbURBQW1EO1FBQzNELElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7S0FDN0IsQ0FBb0QsQ0FBQztBQUt0RCxNQUFxQixjQUFlLFNBQVEsY0FBeUI7SUFDakUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsT0FBTyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQztZQUN0RCxLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELG1CQUFtQixFQUFFLElBQUEscUJBQU8sRUFBQTs7O0lBR3BDO1lBQ1EsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDO1lBQy9ELGVBQWUsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUNsQyxPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsUUFBUSxFQUFjO1FBQzlELE1BQU0sSUFBSSxHQUFHLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBRXZELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDNUMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsUUFBUSxDQUFDLElBQUksTUFBTSxJQUFJLHVCQUF1QixDQUFDLENBQUM7WUFDN0UsT0FBTztTQUNWO1FBRUQsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ2xCLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsUUFBUSxDQUFDLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQzVFLE9BQU87U0FDVjtRQUVELFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLFFBQVEsQ0FBQyxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQztJQUN0RSxDQUFDO0NBQ0o7QUFsQ0QsaUNBa0NDIn0=