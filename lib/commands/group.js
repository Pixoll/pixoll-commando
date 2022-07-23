"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/** A group for commands. Whodathunkit? */
class CommandGroup {
    /** Client that this group is for */
    client;
    /** ID of this group */
    id;
    /** Name of this group */
    name;
    /** The commands in this group (added upon their registration) */
    commands;
    /** Whether or not this group is protected from being disabled */
    guarded;
    /** Whether the group is enabled globally */
    _globalEnabled;
    /**
     * @param client - The client the group is for
     * @param id - The ID for the group
     * @param name - The name of the group
     * @param guarded - Whether the group should be protected from disabling
     */
    constructor(client, id, name = id, guarded = false) {
        if (!client)
            throw new Error('A client must be specified.');
        if (typeof id !== 'string')
            throw new TypeError('Group ID must be a string.');
        if (id !== id.toLowerCase())
            throw new Error('Group ID must be lowercase.');
        Object.defineProperty(this, 'client', { value: client });
        this.id = id;
        this.name = name ?? id;
        this.commands = new discord_js_1.Collection();
        this.guarded = !!guarded;
        this._globalEnabled = true;
    }
    /**
     * Enables or disables the group in a guild
     * @param guild - Guild to enable/disable the group in
     * @param enabled - Whether the group should be enabled or disabled
     */
    setEnabledIn(guild, enabled) {
        const { client, guarded } = this;
        if (typeof guild === 'undefined')
            throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined')
            throw new TypeError('Enabled must not be undefined.');
        if (guarded)
            throw new Error('The group is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            client.emit('groupStatusChange', null, this, enabled);
            return;
        }
        const commandoGuild = client.guilds.resolve(guild);
        commandoGuild.setGroupEnabled(this, enabled);
    }
    /**
     * Checks if the group is enabled in a guild
     * @param guild - Guild to check in
     * @return Whether or not the group is enabled
     */
    isEnabledIn(guild) {
        const { client, _globalEnabled, guarded } = this;
        if (guarded)
            return true;
        if (!guild)
            return _globalEnabled;
        const commandoGuild = client.guilds.resolve(guild);
        return commandoGuild.isGroupEnabled(this);
    }
    /** Reloads all of the group's commands */
    reload() {
        for (const command of this.commands.values())
            command.reload();
    }
}
exports.default = CommandGroup;
//# sourceMappingURL=group.js.map