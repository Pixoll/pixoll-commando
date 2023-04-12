"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/** A group for commands. Whodathunkit? */
class CommandGroup {
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
     * @param silent - If `true`, it won't emit a `groupStatusChange` event
     */
    setEnabledIn(guild, enabled, silent = false) {
        const { client, guarded } = this;
        if (typeof guild === 'undefined')
            throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined')
            throw new TypeError('Enabled must not be undefined.');
        if (guarded)
            throw new Error('The group is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            if (!silent)
                client.emit('groupStatusChange', null, this, enabled);
            return;
        }
        const commandoGuild = client.guilds.resolve(guild);
        if (!commandoGuild)
            throw new Error(`Couldn't resolve guild ${guild}`);
        commandoGuild.setGroupEnabled(this, enabled, silent);
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
        if (!commandoGuild)
            throw new Error(`Couldn't resolve guild ${guild}`);
        return commandoGuild.isGroupEnabled(this);
    }
    /** Reloads all of the group's commands */
    reload() {
        for (const command of this.commands.values())
            command.reload();
    }
}
exports.default = CommandGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBd0M7QUFLeEMsMENBQTBDO0FBQzFDLE1BQXFCLFlBQVk7SUFHN0IsdUJBQXVCO0lBQ2hCLEVBQUUsQ0FBUztJQUNsQix5QkFBeUI7SUFDbEIsSUFBSSxDQUFTO0lBQ3BCLGlFQUFpRTtJQUMxRCxRQUFRLENBQThCO0lBQzdDLGlFQUFpRTtJQUMxRCxPQUFPLENBQVU7SUFDeEIsNENBQTRDO0lBQ2xDLGNBQWMsQ0FBVTtJQUVsQzs7Ozs7T0FLRztJQUNILFlBQW1CLE1BQXNCLEVBQUUsRUFBVSxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsT0FBTyxHQUFHLEtBQUs7UUFDN0UsSUFBSSxDQUFDLE1BQU07WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDNUQsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzlFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxXQUFXLEVBQUU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFNUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFekQsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksWUFBWSxDQUFDLEtBQXFDLEVBQUUsT0FBZ0IsRUFBRSxNQUFNLEdBQUcsS0FBSztRQUN2RixNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7WUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDdEYsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQzFGLElBQUksT0FBTztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7WUFDOUIsSUFBSSxDQUFDLE1BQU07Z0JBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLE9BQU87U0FDVjtRQUNELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxhQUFhO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN2RSxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxXQUFXLENBQUMsS0FBcUM7UUFDcEQsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2pELElBQUksT0FBTztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxjQUFjLENBQUM7UUFDbEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLGFBQWE7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsMENBQTBDO0lBQ25DLE1BQU07UUFDVCxLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ25FLENBQUM7Q0FDSjtBQXpFRCwrQkF5RUMifQ==