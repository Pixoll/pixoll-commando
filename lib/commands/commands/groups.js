"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../base"));
class GroupsCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'groups',
            aliases: ['list-groups', 'show-groups'],
            group: 'commands',
            description: 'Lists all command groups.',
            detailedDescription: 'Only administrators may use this command.',
            userPermissions: ['Administrator'],
            guarded: true,
        });
    }
    run(context) {
        const groups = this.client.registry.groups.map(grp => `**${grp.name}:** ${grp.isEnabledIn(context.guild) ? 'Enabled' : 'Disabled'}`).join('\n');
        context.reply((0, common_tags_1.stripIndents) `
			__**Groups**__
			${groups}
        `);
    }
}
exports.default = GroupsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL2dyb3Vwcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUEyQztBQUUzQyxtREFBa0Q7QUFFbEQsTUFBcUIsYUFBYyxTQUFRLGNBQU87SUFDOUMsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQztZQUN2QyxLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsMkJBQTJCO1lBQ3hDLG1CQUFtQixFQUFFLDJDQUEyQztZQUNoRSxlQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDbEMsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEdBQUcsQ0FBQyxPQUF1QjtRQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQ2pELEtBQUssR0FBRyxDQUFDLElBQUksT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FDaEYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFYixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUEsMEJBQVksRUFBQTs7S0FFN0IsTUFBTTtTQUNGLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXZCRCxnQ0F1QkMifQ==