"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const base_1 = __importDefault(require("../commands/base"));
const GuildDatabaseManager_1 = __importDefault(require("../database/GuildDatabaseManager"));
/** A fancier Guild for fancier people. */
// @ts-expect-error: Guild's constructor is private
class CommandoGuild extends discord_js_1.Guild {
    /** The database manager for the guild */
    database;
    /** The queued logs for this guild */
    queuedLogs;
    /** Internal command prefix for the guild, controlled by the {@link CommandoGuild#prefix} getter/setter */
    _prefix;
    /** Internal map object of internal command statuses, mapped by command name */
    _commandsEnabled;
    /** Internal map object of internal group statuses, mapped by group ID */
    _groupsEnabled;
    /**
     * @param client - The client the guild is for
     * @param data - The guild data
     */
    constructor(client, data) {
        // @ts-expect-error: data.toJSON() does not work
        super(client, { id: data.id });
        Object.assign(this, data);
        client.emit('debug', `Created new ${this.constructor.name} with ID ${this.id}`);
        this.database = new GuildDatabaseManager_1.default(this);
        this.queuedLogs = [];
        this._prefix = null;
        this._commandsEnabled = new Map();
        this._groupsEnabled = new Map();
        this.channels.cache.first()?.guild;
    }
    /**
     * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
     * Setting to `null` means that the prefix from {@link CommandoClient#prefix} will be used instead.
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get prefix() {
        if (this._prefix === null)
            return this.client.prefix;
        return this._prefix;
    }
    set prefix(prefix) {
        this._prefix = prefix;
        this.client.emit('commandPrefixChange', this, this._prefix);
    }
    /**
     * Sets whether a command is enabled in the guild
     * @param command - Command to set status of
     * @param enabled - Whether the command should be enabled
     */
    setCommandEnabled(command, enabled) {
        const { client } = this;
        command = client.registry.resolveCommand(command);
        const { name, guarded } = command;
        if (guarded)
            throw new Error('The command is guarded.');
        if (typeof enabled === 'undefined')
            throw new TypeError('Enabled must not be undefined.');
        enabled = !!enabled;
        this._commandsEnabled.set(name, enabled);
        client.emit('commandStatusChange', this, command, enabled);
    }
    /**
     * Checks whether a command is enabled in the guild (does not take the command's group status into account)
     * @param command - Command to check status of
     */
    isCommandEnabled(command) {
        const { registry } = this.client;
        command = registry.resolveCommand(command);
        const { name, guarded } = command;
        if (guarded)
            return true;
        const commandEnabled = this._commandsEnabled.get(name);
        if (typeof commandEnabled === 'undefined') {
            return command.isEnabledIn(null);
        }
        return commandEnabled;
    }
    /**
     * Sets whether a command group is enabled in the guild
     * @param group - Group to set status of
     * @param enabled - Whether the group should be enabled
     */
    setGroupEnabled(group, enabled) {
        const { client } = this;
        group = client.registry.resolveGroup(group);
        const { id, guarded } = group;
        if (guarded)
            throw new Error('The group is guarded.');
        if (typeof enabled === 'undefined')
            throw new TypeError('Enabled must not be undefined.');
        enabled = !!enabled;
        this._groupsEnabled.set(id, enabled);
        client.emit('groupStatusChange', this, group, enabled);
    }
    /**
     * Checks whether a command group is enabled in the guild
     * @param group - Group to check status of
     */
    isGroupEnabled(group) {
        const { registry } = this.client;
        group = registry.resolveGroup(group);
        const { id, guarded } = group;
        if (guarded)
            return true;
        const groupEnabled = this._commandsEnabled.get(id);
        if (typeof groupEnabled === 'undefined') {
            return group.isEnabledIn(null);
        }
        return groupEnabled;
    }
    /**
     * Creates a command usage string using the guild's prefix
     * @param command - A command + arg string
     * @param user - User to use for the mention command format
     */
    commandUsage(command, user = this.client.user) {
        return base_1.default.usage(command, this.prefix, user);
    }
}
exports.default = CommandoGuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5zaW9ucy9ndWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF1RDtBQUV2RCw0REFBdUM7QUFDdkMsNEZBQW9FO0FBU3BFLDBDQUEwQztBQUMxQyxtREFBbUQ7QUFDbkQsTUFBcUIsYUFBYyxTQUFRLGtCQUFLO0lBUTVDLHlDQUF5QztJQUNsQyxRQUFRLENBQXVCO0lBQ3RDLHFDQUFxQztJQUM5QixVQUFVLENBQWlCO0lBQ2xDLDBHQUEwRztJQUNoRyxPQUFPLENBQWlCO0lBQ2xDLCtFQUErRTtJQUNyRSxnQkFBZ0IsQ0FBdUI7SUFDakQseUVBQXlFO0lBQy9ELGNBQWMsQ0FBdUI7SUFFL0M7OztPQUdHO0lBQ0gsWUFBbUIsTUFBNEIsRUFBRSxJQUFXO1FBQ3hELGdEQUFnRDtRQUNoRCxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGVBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLDhCQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxL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