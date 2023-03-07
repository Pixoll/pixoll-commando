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
    /** Internal command prefix for the guild, controlled by the {@link CommandoGuild.prefix prefix} getter/setter */
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
        super(client, guildToJSON(data));
        Object.assign(this, data);
        client.emit('debug', `Created new ${this.constructor.name} with ID ${this.id}`);
        this.database = new GuildDatabaseManager_1.default(this);
        this.queuedLogs = [];
        this._prefix = null;
        this._commandsEnabled = new Map();
        this._groupsEnabled = new Map();
    }
    /**
     * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
     * Setting to `null` means that the prefix from {@link CommandoClient.prefix prefix} will be used instead.
     * @emits {@link CommandoClientEvents.commandPrefixChange commandPrefixChange}
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
function guildToJSON(data) {
    /* eslint-disable camelcase */
    return {
        afk_channel_id: null,
        afk_timeout: 60,
        application_id: null,
        banner: null,
        default_message_notifications: data.defaultMessageNotifications,
        description: null,
        discovery_splash: null,
        emojis: [],
        explicit_content_filter: data.explicitContentFilter,
        features: [],
        hub_type: null,
        icon: null,
        id: data.id,
        mfa_level: data.mfaLevel,
        name: data.name,
        nsfw_level: data.nsfwLevel,
        owner_id: data.ownerId,
        preferred_locale: data.preferredLocale,
        premium_progress_bar_enabled: data.premiumProgressBarEnabled,
        premium_tier: data.premiumTier,
        public_updates_channel_id: null,
        roles: [],
        rules_channel_id: null,
        splash: null,
        stickers: [],
        system_channel_flags: data.systemChannelFlags.bitfield,
        system_channel_id: null,
        unavailable: !data.available,
        vanity_url_code: null,
        verification_level: data.verificationLevel,
    };
    /* eslint-enable camelcase */
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5zaW9ucy9ndWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF1RDtBQUl2RCw0REFBdUM7QUFDdkMsNEZBQW9FO0FBU3BFLDBDQUEwQztBQUMxQyxtREFBbUQ7QUFDbkQsTUFBcUIsYUFBYyxTQUFRLGtCQUFLO0lBUTVDLHlDQUF5QztJQUNsQyxRQUFRLENBQXVCO0lBQ3RDLHFDQUFxQztJQUM5QixVQUFVLENBQWlCO0lBQ2xDLGlIQUFpSDtJQUN2RyxPQUFPLENBQWlCO0lBQ2xDLCtFQUErRTtJQUNyRSxnQkFBZ0IsQ0FBdUI7SUFDakQseUVBQXlFO0lBQy9ELGNBQWMsQ0FBdUI7SUFFL0M7OztPQUdHO0lBQ0gsWUFBbUIsTUFBNEIsRUFBRSxJQUFXO1FBQ3hELEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVoRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBVyxNQUFNO1FBQ2IsSUFBSSxJQUFJLENBQUMsT0FBTyxL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