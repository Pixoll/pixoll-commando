import { oneLine } from 'common-tags';
import CommandoClient from '../../client';
import Command, { CommandContext } from '../base';

export default class PingCommand extends Command {
    public constructor(client: CommandoClient) {
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

    public async run(context: CommandContext): Promise<void> {
        const { client } = context;
        const heartbeat = client.ws.ping;
        const pingMessage = await context.reply('Pinging...');
        const originalTimestamp = getMessageTimestamp(context);
        const pingTimestamp = getMessageTimestamp(pingMessage);
        const roundtrip = pingTimestamp - originalTimestamp;

        await pingMessage.edit(oneLine`
			Pong! The message round-trip took ${roundtrip}ms.
			${heartbeat ? `The heartbeat ping is ${Math.round(heartbeat)}ms.` : ''}
		`);
    }
}

type MessageResolvable = {
    createdTimestamp: number;
    editedTimestamp: number | null;
} | {
    createdTimestamp: number;
};

function getMessageTimestamp<T extends MessageResolvable>(message: T): number {
    return 'editedTimestamp' in message
        ? message.editedTimestamp || message.createdTimestamp
        : message.createdTimestamp;
}
