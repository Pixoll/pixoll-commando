import ArgumentType from './base';
import { disambiguation } from '../util';
import { Util } from 'discord.js';
import CommandoClient from '../client';
import CommandGroup from '../commands/group';

export default class GroupArgumentType extends ArgumentType {
    public constructor(client: CommandoClient) {
        super(client, 'group');
    }

    public validate(val: string): boolean | string {
        const groups = this.client.registry.findGroups(val);
        if (groups.length === 1) return true;
        if (groups.length === 0) return false;
        return groups.length <= 15 ?
            `${disambiguation(groups.map(grp => Util.escapeMarkdown(grp.name)), 'groups', null)}\n` :
            'Multiple groups found. Please be more specific.';
    }

    public parse(val: string): CommandGroup {
        return this.client.registry.findGroups(val)[0];
    }
}
