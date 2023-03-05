import CommandoClient from '../client';
import { CommandoifiedMessage } from '../discord.overrides';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';

// Match id or message URL
const messageRegex = /^(\d+)$|discord\.com\/channels\/\d+\/\d+\/(\d+)$/;

export default class MessageArgumentType extends ArgumentType<'message'> {
    public constructor(client: CommandoClient) {
        super(client, 'message');
    }

    public get messageRegex(): RegExp {
        return messageRegex;
    }

    public async validate(value: string | undefined, message: CommandoMessage): Promise<boolean | string> {
        if (typeof value === 'undefined') return false;
        const matches = value.match(this.messageRegex);
        if (!matches) return 'Please enter a valid message id or URL.';
        const msg = await message.channel.messages.fetch(matches[1] ?? matches[2]).catch(() => null);
        return !!msg;
    }

    public parse(value: string, message: CommandoMessage): CommandoifiedMessage | null {
        return message.channel.messages.resolve(value) as CommandoifiedMessage | null;
    }
}
