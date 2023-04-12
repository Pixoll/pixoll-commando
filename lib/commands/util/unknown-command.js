"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("../base"));
class UnknownCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'unknown-command',
            group: 'util',
            description: 'Displays help information for when an unknown command is used.',
            examples: ['unknown-command kickeverybodyever'],
            unknown: true,
            hidden: true,
        });
    }
    run(context) {
        const usage = base_1.default.usage('help', context.guild ? undefined : null, context.guild ? undefined : null);
        context.reply(`Unknown command. Use ${usage} to view the command list.`);
    }
}
exports.default = UnknownCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5rbm93bi1jb21tYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWwvdW5rbm93bi1jb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsbURBQWtEO0FBRWxELE1BQXFCLGNBQWUsU0FBUSxjQUFPO0lBQy9DLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsaUJBQWlCO1lBQ3ZCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLGdFQUFnRTtZQUM3RSxRQUFRLEVBQUUsQ0FBQyxtQ0FBbUMsQ0FBQztZQUMvQyxPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEdBQUcsQ0FBQyxPQUF1QjtRQUM5QixNQUFNLEtBQUssR0FBRyxjQUFPLENBQUMsS0FBSyxDQUN2QixNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQ2hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNuQyxDQUFDO1FBQ0YsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsS0FBSyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzdFLENBQUM7Q0FDSjtBQXBCRCxpQ0FvQkMifQ==