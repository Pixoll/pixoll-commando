import ArgumentType from './base';
import Util from '../util';
import { escapeMarkdown } from 'discord.js';
import CommandoClient from '../client';
import CommandGroup from '../commands/group';

export default class GroupArgumentType extends ArgumentType<'group'> {
    public constructor(client: CommandoClient) {
        super(client, 'group');
    }

    public validate(value: string | undefined): boolean | string {
        if (typeof value === 'undefined') return false;
        const groups = this.client.registry.findGroups(value);
        if (groups.length === 1) return true;
        if (groups.length === 0) return false;
        return groups.length <= 15
            ? `${Util.disambiguation(groups.map(grp => escapeMarkdown(grp.name)), 'groups')}\n`
            : 'Multiple groups found. Please be more specific.';
    }

    public parse(value: string): CommandGroup {
        return this.client.registry.findGroups(value)[0];
    }
}
