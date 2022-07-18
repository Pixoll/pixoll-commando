import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import Command from '../commands/base';

export default class CommandArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'command');
    }

    public validate(val: string): boolean | string {
        const commands = this.client.registry.findCommands(val);
        if (commands.length === 1) return true;
        if (commands.length === 0) return false;
        return commands.length <= 15 ?
            `${Util.disambiguation(commands.map(cmd => escapeMarkdown(cmd.name)), 'commands')}\n` :
            'Multiple commands found. Please be more specific.';
    }

    public parse(val: string): Command {
        return this.client.registry.findCommands(val)[0];
    }
}
