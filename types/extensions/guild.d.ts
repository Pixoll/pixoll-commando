import { Guild, User, EmbedBuilder } from 'discord.js';
import CommandoClient from '../client';
import GuildDatabaseManager from '../database/GuildDatabaseManager';
import { CommandoGuildChannelManager, CommandoGuildEmojiManager, CommandoGuildMemberManager, CommandoRoleManager } from '../discord.overrides';
import GuildSettingsHelper from '../providers/helper';
import { CommandGroupResolvable, CommandResolvable } from '../registry';
/** A fancier Guild for fancier people. */
export default class CommandoGuild extends Guild {
    /** The client the guild is for */
    readonly client: CommandoClient<true>;
    /** The client the guild is for */
    channels: CommandoGuildChannelManager;
    emojis: CommandoGuildEmojiManager;
    members: CommandoGuildMemberManager;
    roles: CommandoRoleManager;
    /** The database manager for the guild */
    database: GuildDatabaseManager;
    /** Shortcut to use setting provider methods for this guild */
    settings: GuildSettingsHelper;
    /** The queued logs for this guild */
    queuedLogs: EmbedBuilder[];
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
    constructor(client: CommandoClient<true>, data: Guild);
    /**
     * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
     * Setting to `null` means that the prefix from {@link CommandoClient.prefix CommandoClient#prefix} will be used instead.
     * @emits {@link CommandoClientEvents.commandPrefixChange commandPrefixChange}
     */
    get prefix(): string | undefined;
    set prefix(prefix: string | undefined);
    /**
     * Sets whether a command is enabled in the guild
     * @param command - Command to set status of
     * @param enabled - Whether the command should be enabled
     */
    setCommandEnabled(command: CommandResolvable, enabled: boolean): void;
    /**
     * Checks whether a command is enabled in the guild (does not take the command's group status into account)
     * @param command - Command to check status of
     */
    isCommandEnabled(command: CommandResolvable): boolean;
    /**
     * Sets whether a command group is enabled in the guild
     * @param group - Group to set status of
     * @param enabled - Whether the group should be enabled
     */
    setGroupEnabled(group: CommandGroupResolvable, enabled: boolean): void;
    /**
     * Checks whether a command group is enabled in the guild
     * @param group - Group to check status of
     */
    isGroupEnabled(group: CommandGroupResolvable): boolean;
    /**
     * Creates a command usage string using the guild's prefix
     * @param command - A command + arg string
     * @param user - User to use for the mention command format
     */
    commandUsage(command: string, user?: User | null): string;
}
