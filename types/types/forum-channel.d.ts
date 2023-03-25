import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoForumChannel } from '../discord.overrides';
export default class ForumChannelArgumentType extends ArgumentType<'forum-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'forum-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoForumChannel | null;
}
