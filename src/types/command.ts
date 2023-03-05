import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import Command from '../commands/base';

export default class CommandArgumentType extends ArgumentType<'command'> {
    public constructor(client: CommandoClient) {
        super(client, 'command');
    }

    public validate(value: string | undefined): boolean | string {
        if (typeof value === 'undefined') return false;
        const commands = this.client.registry.findCommands(value);
        if (commands.length === 1) return true;
        if (commands.length === 0) return false;
        return commands.length <= 15
            ? `${Util.disambiguation(commands.map(cmd => escapeMarkdown(cmd.name)), 'commands')}\n`
            : 'Multiple commands found. Please be more specific.';
    }

    public parse(value: string): Command {
        return this.client.registry.findCommands(value)[0];
    }
}
