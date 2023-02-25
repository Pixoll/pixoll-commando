import CommandoClient from '../client';
import { CommandoifiedMessage } from '../discord.overrides';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';

export default class MessageArgumentType extends ArgumentType<'message'> {
    protected msgRegex: RegExp;

    public constructor(client: CommandoClient) {
        super(client, 'message');
        // Match id or message URL
        this.msgRegex = /^(\d+)$|discord\.com\/channels\/\d+\/\d+\/(\d+)$/;
    }

    public async validate(value: string, message: CommandoMessage): Promise<boolean | string> {
        const matches = value.match(this.msgRegex);
        if (!matches) return 'Please enter a valid message id or URL.';
        const msg = await message.channel.messages.fetch(matches[1] ?? matches[2]).catch(() => null);
        return !!msg;
    }

    public parse(value: string, message: CommandoMessage): CommandoifiedMessage | null {
        return message.channel.messages.resolve(value) as CommandoifiedMessage | null;
    }
}
