import { Message } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import ArgumentType from './base';

export default class MessageArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'message');
    }

    public async validate(val: string, msg: CommandoMessage): Promise<boolean> {
        if (!/^\d+$/.test(val)) return false;
        const message = await msg.channel.messages.fetch(val).catch(() => null);
        return !!message;
    }

    public parse(val: string, msg: CommandoMessage): Message | null {
        return msg.channel.messages.cache.get(val) ?? null;
    }
}
