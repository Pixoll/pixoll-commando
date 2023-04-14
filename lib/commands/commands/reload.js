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
        prompt: 'Which command or group would you like to reload?',
        type: ['group', 'command'],
    }];
class ReloadCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'reload',
            aliases: ['reload-command'],
            group: 'commands',
            description: 'Reloads a command or command group.',
            detailedDescription: (0, common_tags_1.oneLine) `
				The argument must be the name/ID (partial or whole) of a command or command group.
				Providing a command group will reload all of the commands in that group.
				Only the bot owner(s) may use this command.
			`,
            examples: ['reload some-command'],
            ownerOnly: true,
            guarded: true,
            args,
        });
    }
    async run(context, { cmdOrGrp }) {
        const { client } = this;
        const { shard, registry } = client;
        const isCommand = 'group' in cmdOrGrp;
        const type = isCommand ? 'commands' : 'groups';
        cmdOrGrp.reload();
        if (shard) {
            try {
                const { ids } = shard;
                await shard.broadcastEval(() => {
                    if (!shard.ids.some(id => ids.includes(id))) {
                        registry[type].get(isCommand ? cmdOrGrp.name : cmdOrGrp.id)?.reload();
                    }
                });
            }
            catch (error) {
                client.emit('warn', 'Error when broadcasting command reload to other shards');
                client.emit('error', error);
                if (isCommand) {
                    await context.reply(`Reloaded \`${cmdOrGrp.name}\` command, but failed to reload on other shards.`);
                    return;
                }
                await context.reply(`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group, but failed to reload on other shards.`);
                return;
            }
        }
        if (isCommand) {
            await context.reply(`Reloaded \`${cmdOrGrp.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
            return;
        }
        await context.reply(`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group${this.client.shard ? ' on all shards' : ''}.`);
    }
}
exports.default = ReloadCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL3JlbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUV0QyxtREFBa0Q7QUFHbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxVQUFVO1FBQ2YsS0FBSyxFQUFFLGVBQWU7UUFDdEIsTUFBTSxFQUFFLGtEQUFrRDtRQUMxRCxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0tBQzdCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSxjQUFPO0lBQzlDLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzNCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFdBQVcsRUFBRSxxQ0FBcUM7WUFDbEQsbUJBQW1CLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7O0lBSXBDO1lBQ1EsUUFBUSxFQUFFLENBQUMscUJBQXFCLENBQUM7WUFDakMsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsUUFBUSxFQUFjO1FBQzlELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDeEIsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDbkMsTUFBTSxTQUFTLEdBQUcsT0FBTyxJQUFJLFFBQVEsQ0FBQztRQUN0QyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQy9DLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVsQixJQUFJLEtBQUssRUFBRTtZQUNQLElBQUk7Z0JBQ0EsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsTUFBTSxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO3dCQUN6QyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDO3FCQUN6RTtnQkFDTCxDQUFDLENBQUMsQ0FBQzthQUNOO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsd0RBQXdELENBQUMsQ0FBQztnQkFDOUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBYyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksU0FBUyxFQUFFO29CQUNYLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLFFBQVEsQ0FBQyxJQUFJLG1EQUFtRCxDQUFDLENBQUM7b0JBQ3BHLE9BQU87aUJBQ1Y7Z0JBRUQsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUNmLHlDQUF5QyxRQUFRLENBQUMsSUFBSSxpREFBaUQsQ0FDMUcsQ0FBQztnQkFDRixPQUFPO2FBQ1Y7U0FDSjtRQUVELElBQUksU0FBUyxFQUFFO1lBQ1gsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsUUFBUSxDQUFDLElBQUksYUFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDMUcsT0FBTztTQUNWO1FBRUQsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUNmLHlDQUF5QyxRQUFRLENBQUMsSUFBSSxXQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQ2hILENBQUM7SUFDTixDQUFDO0NBQ0o7QUExREQsZ0NBMERDIn0=