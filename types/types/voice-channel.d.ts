import ArgumentType from './base';
import CommandoClient from '../client';
import CommandoMessage from '../extensions/message';
import Argument from '../commands/argument';
import { CommandoVoiceChannel } from '../discord.overrides';
export default class VoiceChannelArgumentType extends ArgumentType<'voice-channel'> {
    constructor(client: CommandoClient);
    validate(value: string | undefined, message: CommandoMessage, argument: Argument<'voice-channel'>): boolean | string;
    parse(value: string, message: CommandoMessage): CommandoVoiceChannel | null;
}
