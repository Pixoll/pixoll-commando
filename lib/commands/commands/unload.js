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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5sb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2NvbW1hbmRzL3VubG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUd0QyxtREFBa0Q7QUFHbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxTQUFTO1FBQ2QsTUFBTSxFQUFFLHlDQUF5QztRQUNqRCxJQUFJLEVBQUUsU0FBUztLQUNsQixDQUFvRCxDQUFDO0FBS3RELE1BQXFCLG9CQUFxQixTQUFRLGNBQXlCO0lBQ3ZFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzNCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFdBQVcsRUFBRSxvQkFBb0I7WUFDakMsbUJBQW1CLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7SUFHcEM7WUFDUSxRQUFRLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUNqQyxTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxPQUFPLEVBQWM7UUFDN0QsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUN4QixNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNuQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFakIsSUFBSSxLQUFLLEVBQUU7WUFDUCxJQUFJO2dCQUNBLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ3RCLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFDekMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDO3FCQUNqRDtnQkFDTCxDQUFDLENBQUMsQ0FBQzthQUNOO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsd0RBQXdELENBQUMsQ0FBQztnQkFDOUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBYyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLE9BQU8sQ0FBQyxJQUFJLG1EQUFtRCxDQUFDLENBQUM7Z0JBQ25HLE9BQU87YUFDVjtTQUNKO1FBRUQsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsT0FBTyxDQUFDLElBQUksYUFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDN0csQ0FBQztDQUNKO0FBekNELHVDQXlDQyJ9