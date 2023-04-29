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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL3JlbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUd0QyxtREFBa0Q7QUFHbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxVQUFVO1FBQ2YsS0FBSyxFQUFFLGVBQWU7UUFDdEIsTUFBTSxFQUFFLGtEQUFrRDtRQUMxRCxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO0tBQzdCLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsYUFBYyxTQUFRLGNBQU87SUFDOUMsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDM0IsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLHFDQUFxQztZQUNsRCxtQkFBbUIsRUFBRSxJQUFBLHFCQUFPLEVBQUE7Ozs7SUFJcEM7WUFDUSxRQUFRLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUNqQyxTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxRQUFRLEVBQWM7UUFDOUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUN4QixNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNuQyxNQUFNLFNBQVMsR0FBRyxPQUFPLElBQUksUUFBUSxDQUFDO1FBQ3RDLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDL0MsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWxCLElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSTtnQkFDQSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUN0QixNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFO29CQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7d0JBQ3pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUM7cUJBQ3pFO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2FBQ047WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSx3REFBd0QsQ0FBQyxDQUFDO2dCQUM5RSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFjLENBQUMsQ0FBQztnQkFDckMsSUFBSSxTQUFTLEVBQUU7b0JBQ1gsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsUUFBUSxDQUFDLElBQUksbURBQW1ELENBQUMsQ0FBQztvQkFDcEcsT0FBTztpQkFDVjtnQkFFRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQ2YseUNBQXlDLFFBQVEsQ0FBQyxJQUFJLGlEQUFpRCxDQUMxRyxDQUFDO2dCQUNGLE9BQU87YUFDVjtTQUNKO1FBRUQsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxRQUFRLENBQUMsSUFBSSxhQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMxRyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQ2YseUNBQXlDLFFBQVEsQ0FBQyxJQUFJLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FDaEgsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQTFERCxnQ0EwREMifQ==