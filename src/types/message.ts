import { Message } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';

export default class MessageArgumentType extends ArgumentType {
    protected msgRegex: RegExp;

    public constructor(client: CommandoClient) {
        super(client, 'message');
        // Match id or message URL
        this.msgRegex = /^(\d+)$|discord\.com\/channels\/\d+\/\d+\/(\d+)$/;
    }

    public async validate(val: string, msg: CommandoMessage): Promise<boolean | string> {
        const matches = val.match(this.msgRegex);
        if (!matches) return 'Please enter a valid message id or URL.';
        const message = await msg.channel.messages.fetch(matches[1] ?? matches[2]).catch(() => null);
        return !!message;
    }

    public parse(val: string, msg: CommandoMessage): Message | null {
        return msg.channel.messages.resolve(val);
    }
}
