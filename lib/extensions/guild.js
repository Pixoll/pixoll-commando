"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const base_1 = __importDefault(require("../commands/base"));
const GuildDatabaseManager_1 = __importDefault(require("../database/GuildDatabaseManager"));
const helper_1 = __importDefault(require("../providers/helper"));
/** A fancier Guild for fancier people. */
// @ts-expect-error: Guild's constructor is private
class CommandoGuild extends discord_js_1.Guild {
    /** The database manager for the guild */
    database;
    /** Shortcut to use setting provider methods for this guild */
    settings;
    /** The queued logs for this guild */
    queuedLogs;
    /**
     * Internal command prefix for the guild, controlled by the {@link CommandoGuild.prefix CommandoGuild#prefix}
     * getter/setter
     */
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
        // @ts-expect-error: CommandoClient extends Client
        super(client, guildToJSON(data));
        Object.assign(this, data);
        client.emit('debug', `Created new ${this.constructor.name} with ID ${this.id}`);
        this.database = new GuildDatabaseManager_1.default(this);
        // @ts-expect-error: constructor is protected in GuildSettingsHelper
        this.settings = new helper_1.default(this.client, this);
        this.queuedLogs = [];
        this._prefix = null;
        this._commandsEnabled = new Map();
        this._groupsEnabled = new Map();
    }
    /**
     * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
     * Setting to `null` means that the prefix from {@link CommandoClient.prefix CommandoClient#prefix} will be used instead.
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
     * @param silent - If `true`, it won't emit a `commandStatusChange` event
     */
    setCommandEnabled(command, enabled, silent = false) {
        const { client } = this;
        command = client.registry.resolveCommand(command);
        const { name, guarded } = command;
        if (guarded)
            throw new Error('The command is guarded.');
        if (typeof enabled === 'undefined')
            throw new TypeError('Enabled must not be undefined.');
        enabled = !!enabled;
        this._commandsEnabled.set(name, enabled);
        if (!silent)
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
     * @param silent - If `true`, it won't emit a `groupStatusChange` event
     */
    setGroupEnabled(group, enabled, silent = false) {
        const { client } = this;
        group = client.registry.resolveGroup(group);
        const { id, guarded } = group;
        if (guarded)
            throw new Error('The group is guarded.');
        if (typeof enabled === 'undefined')
            throw new TypeError('Enabled must not be undefined.');
        enabled = !!enabled;
        this._groupsEnabled.set(id, enabled);
        if (!silent)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5zaW9ucy9ndWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF1RDtBQUl2RCw0REFBdUM7QUFDdkMsNEZBQW9FO0FBT3BFLGlFQUFzRDtBQUl0RCwwQ0FBMEM7QUFDMUMsbURBQW1EO0FBQ25ELE1BQXFCLGFBQWMsU0FBUSxrQkFBSztJQVk1Qyx5Q0FBeUM7SUFDbEMsUUFBUSxDQUF1QjtJQUN0Qyw4REFBOEQ7SUFDdkQsUUFBUSxDQUFzQjtJQUNyQyxxQ0FBcUM7SUFDOUIsVUFBVSxDQUFpQjtJQUNsQzs7O09BR0c7SUFDTyxPQUFPLENBQWlCO0lBQ2xDLCtFQUErRTtJQUNyRSxnQkFBZ0IsQ0FBdUI7SUFDakQseUVBQXlFO0lBQy9ELGNBQWMsQ0FBdUI7SUFFL0M7OztPQUdHO0lBQ0gsWUFBbUIsTUFBNEIsRUFBRSxJQUFXO1FBQ3hELGtEQUFrRDtRQUNsRCxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGVBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLDhCQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLG9FQUFvRTtRQUNwRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksZ0JBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENB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