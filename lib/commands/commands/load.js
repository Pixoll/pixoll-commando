"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../base"));
const args = [{
        key: 'command',
        prompt: 'Which command would you like to load?',
        async validate(value, message) {
            if (!value)
                return false;
            const split = value.split(':');
            if (split.length !== 2)
                return false;
            const { registry } = message.client;
            if (registry.findCommands(value).length > 0) {
                return 'That command is already registered.';
            }
            const cmdPath = registry.resolveCommandPath(split[0], split[1]);
            let valid = true;
            (0, fs_1.access)(cmdPath, fs_1.constants.R_OK, err => valid = !!err);
            return valid;
        },
        parse(value, message) {
            const split = value.split(':');
            const cmdPath = message.client.registry.resolveCommandPath(split[0], split[1]);
            delete require.cache[cmdPath];
            return require(cmdPath);
        },
    }];
class LoadCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'load',
            aliases: ['load-command'],
            group: 'commands',
            description: 'Loads a new command.',
            detailedDescription: (0, common_tags_1.oneLine) `
				The argument must be full name of the command in the format of \`group:memberName\`.
				Only the bot owner(s) may use this command.
			`,
            examples: ['load some-command'],
            ownerOnly: true,
            guarded: true,
            args,
        });
    }
    async run(context, args) {
        const { client } = this;
        const { registry, shard } = client;
        registry.registerCommand(args.command);
        const command = registry.commands.last();
        if (shard) {
            try {
                const { ids } = shard;
                await shard.broadcastEval(() => {
                    if (!shard.ids.some(id => ids.includes(id))) {
                        const cmdPath = registry.resolveCommandPath('${command?.groupID}', '${command?.name}');
                        delete require.cache[cmdPath];
                        registry.registerCommand(require(cmdPath));
                    }
                });
            }
            catch (error) {
                client.emit('warn', 'Error when broadcasting command load to other shards');
                client.emit('error', error);
                await context.reply(`Loaded \`${command?.name}\` command, but failed to load on other shards.`);
                return;
            }
        }
        await context.reply(`Loaded \`${command?.name}\` command${shard ? ' on all shards' : ''}.`);
    }
}
exports.default = LoadCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9jb21tYW5kcy9sb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQXVDO0FBQ3ZDLDZDQUFzQztBQUN0QyxtREFBa0Q7QUFPbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxTQUFTO1FBQ2QsTUFBTSxFQUFFLHVDQUF1QztRQUMvQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0I7WUFDOUQsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDekIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUNyQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNwQyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDekMsT0FBTyxxQ0FBcUMsQ0FBQzthQUNoRDtZQUNELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUEsV0FBTSxFQUFDLE9BQU8sRUFBRSxjQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0RCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBQ0QsS0FBSyxDQUFDLEtBQWEsRUFBRSxPQUF3QjtZQUN6QyxNQUFNLEtBQUssR0FBRyxLQUFL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