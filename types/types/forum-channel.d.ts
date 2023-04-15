import ArgumentType from './base';
import { ForumChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class ForumChannelArgumentType extends ArgumentType<'forum-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'forum-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): ForumChannel | null;
}
