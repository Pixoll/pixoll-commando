"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../base"));
const args = [{
        key: 'command',
        prompt: 'Which command would you like to unload?',
        type: 'command',
    }];
class UnloadCommandCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'unload',
            aliases: ['unload-command'],
            group: 'commands',
            description: 'Unloads a command.',
            detailedDescription: (0, common_tags_1.oneLine) `
				The argument must be the name/ID (partial or whole) of a command.
				Only the bot owner(s) may use this command.
			`,
            examples: ['unload some-command'],
            ownerOnly: true,
            guarded: true,
            args,
        });
    }
    async run(context, { command }) {
        const { client } = this;
        const { shard, registry } = client;
        command.unload();
        if (shard) {
            try {
                const { ids } = shard;
                await shard.broadcastEval(() => {
                    if (!shard.ids.some(id => ids.includes(id))) {
                        registry.commands.get(command.name)?.unload();
                    }
                });
            }
            catch (error) {
                client.emit('warn', 'Error when broadcasting command unload to other shards');
                client.emit('error', error);
                await context.reply(`Unloaded \`${command.name}\` command, but failed to unload on other shards.`);
                return;
            }
        }
        await context.reply(`Unloaded \`${command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
    }
}
exports.default = UnloadCommandCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5sb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL3VubG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUV0QyxtREFBa0Q7QUFHbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxTQUFTO1FBQ2QsTUFBTSxFQUFFLHlDQUF5QztRQUNqRCxJQUFJLEVBQUUsU0FBUztLQUNsQixDQUFVLENBQUM7QUFLWixNQUFxQixvQkFBcUIsU0FBUSxjQUF5QjtJQUN2RSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsb0JBQW9CO1lBQ2pDLG1CQUFtQixFQUFFLElBQUEscUJBQU8sRUFBQTs7O0lBR3BDO1lBQ1EsUUFBUSxFQUFFLENBQUMscUJBQXFCLENBQUM7WUFDakMsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsT0FBTyxFQUFjO1FBQzdELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDeEIsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDbkMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWpCLElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSTtnQkFDQSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUN0QixNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFO29CQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7d0JBQ3pDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQztxQkFDakQ7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLHdEQUF3RCxDQUFDLENBQUM7Z0JBQzlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQWMsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxPQUFPLENBQUMsSUFBSSxtREFBbUQsQ0FBQyxDQUFDO2dCQUNuRyxPQUFPO2FBQ1Y7U0FDSjtRQUVELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLE9BQU8sQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzdHLENBQUM7Q0FDSjtBQXpDRCx1Q0F5Q0MifQ==