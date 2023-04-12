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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL3JlbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUV0QyxtREFBa0Q7QUFHbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxVQUFVO1FBQ2YsS0FBSyxFQUFFLGVBQWU7UUFDdEIsTUFBTSxFQUFFLGtEQUFrRDtRQUMxRCxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0tBQzdCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSxjQUF5QjtJQUNoRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUscUNBQXFDO1lBQ2xELG1CQUFtQixFQUFFLElBQUEscUJBQU8sRUFBQTs7OztJQUlwQztZQUNRLFFBQVEsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1lBQ2pDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLFFBQVEsRUFBYztRQUM5RCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ25DLE1BQU0sU0FBUyxHQUFHLE9BQU8sSUFBSSxRQUFRLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUMvQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFbEIsSUFBSSxLQUFLLEVBQUU7WUFDUCxJQUFJO2dCQUNBLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ3RCLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFDekMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQztxQkFDekU7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLHdEQUF3RCxDQUFDLENBQUM7Z0JBQzlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQWMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLFNBQVMsRUFBRTtvQkFDWCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxRQUFRLENBQUMsSUFBSSxtREFBbUQsQ0FBQyxDQUFDO29CQUNwRyxPQUFPO2lCQUNWO2dCQUVELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FDZix5Q0FBeUMsUUFBUSxDQUFDLElBQUksaURBQWlELENBQzFHLENBQUM7Z0JBQ0YsT0FBTzthQUNWO1NBQ0o7UUFFRCxJQUFJLFNBQVMsRUFBRTtZQUNYLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLFFBQVEsQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFHLE9BQU87U0FDVjtRQUVELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FDZix5Q0FBeUMsUUFBUSxDQUFDLElBQUksV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUNoSCxDQUFDO0lBQ04sQ0FBQztDQUNKO0FBMURELGdDQTBEQyJ9