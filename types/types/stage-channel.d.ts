import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoStageChannel } from '../discord.overrides';
export default class StageChannelArgumentType extends ArgumentType<'stage-channel'> {
    constructor(client: CommandoClient);
    validate(value: string, message: CommandoMessage, argument: Argument<'stage-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoStageChannel | null;
}
