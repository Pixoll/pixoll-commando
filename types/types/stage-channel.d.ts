import ArgumentType from './base';
import { StageChannel } from 'discord.js';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
export default class StageChannelArgumentType extends ArgumentType<'stage-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'stage-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): StageChannel | null;
}
