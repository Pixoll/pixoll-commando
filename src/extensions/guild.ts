import { Guild, User, EmbedBuilder } from 'discord.js';
import { RawGuildData } from 'discord.js/typings/rawDataTypes';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CommandoClient, { CommandoClientEvents } from '../client';
import Command from '../commands/base';
import GuildDatabaseManager from '../database/GuildDatabaseManager';
import {
    CommandoGuildChannelManager,
    CommandoGuildEmojiManager,
    CommandoGuildMemberManager,
    CommandoRoleManager,
} from '../discord.overrides';
import GuildSettingsHelper from '../providers/helper';
import { CommandGroupResolvable, CommandResolvable } from '../registry';
import { Nullable } from '../util';

/** A fancier Guild for fancier people. */
// @ts-expect-error: Guild's constructor is private
export default class CommandoGuild extends Guild {
    /** The client the guild is for */
    declare public readonly client: CommandoClient<true>;
    // @ts-expect-error: CommandoGuildChannelManager extends GuildChannelManager
    declare public channels: CommandoGuildChannelManager;
    // @ts-expect-error: CommandoGuildEmojiManager extends GuildEmojiManager
    declare public emojis: CommandoGuildEmojiManager;
    // @ts-expect-error: CommandoGuildMemberManager extends GuildMemberManager
    declare public members: CommandoGuildMemberManager;
    // @ts-expect-error: CommandoRoleManager extends RoleManager
    declare public roles: CommandoRoleManager;
    /** The database manager for the guild */
    public database: GuildDatabaseManager;
    /** Shortcut to use setting provider methods for this guild */
    public settings: GuildSettingsHelper;
    /** The queued logs for this guild */
    public queuedLogs: EmbedBuilder[];
    /**
     * Internal command prefix for the guild, controlled by the {@link CommandoGuild.prefix CommandoGuild#prefix}
     * getter/setter
     */
    protected _prefix?: string | null;
    /** Internal map object of internal command statuses, mapped by command name */
    protected _commandsEnabled: Map<string, boolean>;
    /** Internal map object of internal group statuses, mapped by group ID */
    protected _groupsEnabled: Map<string, boolean>;

    /**
     * @param client - The client the guild is for
     * @param data - The guild data
     */
    public constructor(client: CommandoClient<true>, data: Guild) {
        super(client, guildToJSON(data));
        Object.assign(this, data);

        client.emit('debug', `Created new ${this.constructor.name} with ID ${this.id}`);

        this.database = new GuildDatabaseManager(this);
        // @ts-expect-error: constructor is protected in GuildSettingsHelper
        this.settings = new GuildSettingsHelper(this.client, this);
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
    public get prefix(): string | undefined {
        if (this._prefix === null) return this.client.prefix;
        return this._prefix;
    }

    public set prefix(prefix: Nullable<string>) {
        this._prefix = prefix;
        this.client.emit('commandPrefixChange', this, this._prefix);
    }

    /**
     * Sets whether a command is enabled in the guild
     * @param command - Command to set status of
     * @param enabled - Whether the command should be enabled
     * @param silent - If `true`, it won't emit a `commandStatusChange` event
     */
    public setCommandEnabled(command: CommandResolvable, enabled: boolean, silent = false): void {
        const { client } = this;
        command = client.registry.resolveCommand(command);
        const { name, guarded } = command;
        if (guarded) throw new Error('The command is guarded.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        enabled = !!enabled;
        this._commandsEnabled.set(name, enabled);
        if (!silent) client.emit('commandStatusChange', this, command, enabled);
    }

    /**
     * Checks whether a command is enabled in the guild (does not take the command's group status into account)
     * @param command - Command to check status of
     */
    public isCommandEnabled(command: CommandResolvable): boolean {
        const { registry } = this.client;
        command = registry.resolveCommand(command);
        const { name, guarded } = command;
        if (guarded) return true;
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
    public setGroupEnabled(group: CommandGroupResolvable, enabled: boolean, silent = false): void {
        const { client } = this;
        group = client.registry.resolveGroup(group);
        const { id, guarded } = group;
        if (guarded) throw new Error('The group is guarded.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        enabled = !!enabled;
        this._groupsEnabled.set(id, enabled);
        if (!silent) client.emit('groupStatusChange', this, group, enabled);
    }

    /**
     * Checks whether a command group is enabled in the guild
     * @param group - Group to check status of
     */
    public isGroupEnabled(group: CommandGroupResolvable): boolean {
        const { registry } = this.client;
        group = registry.resolveGroup(group);
        const { id, guarded } = group;
        if (guarded) return true;
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
    public commandUsage(command: string, user: User | null = this.client.user): string {
        return Command.usage(command, this.prefix, user);
    }
}

function guildToJSON(data: Guild): RawGuildData {
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
