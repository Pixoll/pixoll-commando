"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../base"));
class PingCommand extends base_1.default {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'util',
            description: 'Checks the bot\'s ping to the Discord server.',
            throttling: {
                usages: 5,
                duration: 10,
            },
        });
    }
    async run(context) {
        const { client } = context;
        const heartbeat = client.ws.ping;
        const pingMessage = await context.reply('Pinging...');
        const originalTimestamp = getMessageTimestamp(context);
        const pingTimestamp = getMessageTimestamp(pingMessage);
        const roundtrip = pingTimestamp - originalTimestamp;
        await pingMessage.edit((0, common_tags_1.oneLine) `
			Pong! The message round-trip took ${roundtrip}ms.
			${heartbeat ? `The heartbeat ping is ${Math.round(heartbeat)}ms.` : ''}
		`);
    }
}
exports.default = PingCommand;
function getMessageTimestamp(message) {
    return 'editedTimestamp' in message
        ? message.editedTimestamp || message.createdTimestamp
        : message.createdTimestamp;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsL3BpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBc0M7QUFFdEMsbURBQWtEO0FBRWxELE1BQXFCLFdBQVksU0FBUSxjQUFPO0lBQzVDLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLCtDQUErQztZQUM1RCxVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsUUFBUSxFQUFFLEVBQUU7YUFDZjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDM0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDakMsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELE1BQU0saUJBQWlCLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkQsTUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkQsTUFBTSxTQUFTLEdBQUcsYUFBYSxHQUFHLGlCQUFpQixDQUFDO1FBRXBELE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFBLHFCQUFPLEVBQUE7dUNBQ0MsU0FBUztLQUMzQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7R0FDdEUsQ0FBQyxDQUFDO0lBQ0QsQ0FBQztDQUNKO0FBMUJELDhCQTBCQztBQVNELFNBQVMsbUJBQW1CLENBQThCLE9BQVU7SUFDaEUsT0FBTyxpQkFBaUIsSUFBSSxPQUFPO1FBQy9CLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0I7UUFDckQsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztBQUNuQyxDQUFDIn0=