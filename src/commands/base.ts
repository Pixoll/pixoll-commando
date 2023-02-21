import {
    GuildResolvable,
    Message,
    EmbedBuilder,
    PermissionsString,
    User,
    Colors,
    SlashCommandBuilder,
    PermissionsBitField,
    ApplicationCommandOptionType,
    ApplicationCommandOptionBase,
    ApplicationCommandOptionData,
    APIApplicationCommandOptionChoice,
    SharedNameAndDescription,
    SharedSlashCommandOptions,
    ChatInputApplicationCommandData,
    RESTPostAPIChatInputApplicationCommandsJSONBody as RESTPostAPISlashCommand,
    Awaitable,
    MessageCreateOptions,
} from 'discord.js';
import path from 'path';
import ArgumentCollector, { ArgumentCollectorResult } from './collector';
import Util from '../util';
import CommandoClient from '../client';
import CommandGroup from './group';
import { ArgumentInfo } from './argument';
import CommandoMessage from '../extensions/message';
import CommandoGuild, { CommandoGuildMember } from '../extensions/guild';
import CommandoInteraction from '../extensions/interaction';

/** Options for throttling usages of the command. */
export interface ThrottlingOptions {
    /** Maximum number of usages of the command allowed in the time frame. */
    usages: number;
    /** Amount of time to count the usages of the command within (in seconds). */
    duration: number;
}

/** The command information */
export interface CommandInfo<InGuild extends boolean = boolean> {
    /** The name of the command (must be lowercase). */
    name: string;
    /** Alternative names for the command (all must be lowercase). */
    aliases?: string[];
    /**
     * Whether automatic aliases should be added.
     * @default false
     */
    autoAliases?: boolean;
    /** The ID of the group the command belongs to (must be lowercase). */
    group: string;
    /**
     * The member name of the command in the group (must be lowercase).
     * @default this.name
     */
    memberName?: string;
    /** A short description of the command. */
    description: string;
    /** The command usage format string - will be automatically generated if not specified, and `args` is specified. */
    format?: string;
    /** A detailed description of the command and its functionality. */
    details?: string;
    /** Usage examples of the command. */
    examples?: string[];
    /**
     * Whether the command is usable only in NSFW channels.
     * @default false
     */
    nsfw?: boolean;
    /**
     * Whether or not the command should only function in direct messages.
     * @default false
     */
    dmOnly?: boolean;
    /**
     * Whether or not the command should only function in a guild channel.
     * @default false
     */
    guildOnly?: InGuild;
    /**
     * Whether or not the command is usable only by a server owner.
     * @default false
     */
    guildOwnerOnly?: boolean;
    /**
     * Whether or not the command is usable only by an owner.
     * @default false
     */
    ownerOnly?: boolean;
    /** Permissions required by the client to use the command. */
    clientPermissions?: PermissionsString[];
    /** Permissions required by the user to use the command. */
    userPermissions?: PermissionsString[];
    /**
     * Whether this command's user permissions are based on "moderator" permissions.
     * @default false
     */
    modPermissions?: boolean;
    /**
     * Whether or not the default command handling should be used.
     * If false, then only patterns will trigger the command.
     * @default true
     */
    defaultHandling?: boolean;
    /** Options for throttling usages of the command. */
    throttling?: ThrottlingOptions;
    /**
     * Whether the slash command will be registered in the test guild only or not.
     * @default false
     */
    testEnv?: boolean;
    /** Arguments for the command. */
    args?: ArgumentInfo[];
    /**
     * Maximum number of times to prompt a user for a single argument. Only applicable if `args` is specified.
     * @default Infinity
     */
    argsPromptLimit?: number;
    /**
     * One of 'single' or 'multiple'. Only applicable if `args` is not specified.
     * When 'single', the entire argument string will be passed to run as one argument.
     * When 'multiple', it will be passed as multiple arguments.
     * @default 'single'
     */
    argsType?: 'multiple' | 'single';
    /**
     * The number of arguments to parse from the command string. Only applicable when argsType is 'multiple'.
     * If nonzero, it should be at least 2. When this is 0, the command argument string will be split into as
     * many arguments as it can be. When nonzero, it will be split into a maximum of this number of arguments.
     * @default 0
     */
    argsCount?: number;
    /**
     * Whether or not single quotes should be allowed to box-in arguments in the command string.
     * @default true
     */
    argsSingleQuotes?: boolean;
    /** Patterns to use for triggering the command. */
    patterns?: RegExp[];
    /**
     * Whether the command should be protected from disabling.
     * @default false
     */
    guarded?: boolean;
    /**
     * Whether the command should be hidden from the help command.
     * @default false
     */
    hidden?: boolean;
    /**
     * Whether the command should be run when an unknown command is used -
     * there may only be one command registered with this property as `true`.
     * @default false
     */
    unknown?: boolean;
    /**
     * Whether the command is marked as deprecated.
     * @default false
     */
    deprecated?: boolean;
    /**
     * The name or alias of the command that is replacing the deprecated command.
     * Required if `deprecated` is `true`.
     */
    deprecatedReplacement?: string;
}

/** Throttling object of the command. */
export interface Throttle {
    /** Time when the throttle started */
    start: number;
    /** Amount usages of the command */
    usages: number;
    /** Timeout function for this throttle */
    timeout: NodeJS.Timeout;
}

/** The instances the command is being run for */
export type CommandInstances<InGuild extends boolean = boolean> =
    | {
        /** The interaction the command is being run for */
        interaction: CommandoInteraction<InGuild>;
    }
    | {
        /** The message the command is being run for */
        message: CommandoMessage<InGuild>;
    };

/** The reason of {@link Command#onBlock} */
export type CommandBlockReason =
    | 'clientPermissions'
    | 'dmOnly'
    | 'guildOnly'
    | 'guildOwnerOnly'
    | 'modPermissions'
    | 'nsfw'
    | 'ownerOnly'
    | 'throttling'
    | 'userPermissions';

/** Additional data associated with the block */
export interface CommandBlockData {
    /**
     * Built-in reason: `throttling`
     * - The throttle object
     */
    throttle?: Throttle;
    /**
     * Built-in reason: `throttling`
     * - Remaining time in seconds
     */
    remaining?: number;
    /**
     * Built-in reasons: `userPermissions` & `clientPermissions`
     * - Missing permissions names
     */
    missing?: PermissionsString[];
}

export interface SlashCommandInfo extends Omit<
    ChatInputApplicationCommandData, 'defaultMemberPermissions' | 'description' | 'dmPermission' | 'name' | 'type'
> {
    /** Whether the deferred reply should be ephemeral or not */
    deferEphemeral?: boolean;
}

export type APISlashCommand = Required<Pick<SlashCommandInfo, 'deferEphemeral'>> & RESTPostAPISlashCommand;

/** A command that can be run in a client */
export default abstract class Command<InGuild extends boolean = boolean> {
    /** Client that this command is for */
    declare public readonly client: CommandoClient;
    /** Name of this command */
    public name: string;
    /** Aliases for this command */
    public aliases: string[];
    /** ID of the group the command belongs to */
    public groupId: string;
    /** The group the command belongs to, assigned upon registration */
    declare public group: CommandGroup;
    /** Name of the command within the group */
    public memberName: string;
    /** Short description of the command */
    public description: string;
    /** Usage format string of the command */
    public format: string | null;
    /** Long description of the command */
    public details: string | null;
    /** Example usage strings */
    public examples: string[] | null;
    /** Whether the command can only be run in direct messages */
    public dmOnly: boolean;
    /** Whether the command can only be run in a guild channel */
    public guildOnly: InGuild;
    /** Whether the command can only be used by a server owner */
    public guildOwnerOnly: boolean;
    /** Whether the command can only be used by an owner */
    public ownerOnly: boolean;
    /** Permissions required by the client to use the command. */
    public clientPermissions: PermissionsString[] | null;
    /** Permissions required by the user to use the command. */
    public userPermissions: PermissionsString[] | null;
    /** Whether this command's user permissions are based on "moderator" permissions */
    public modPermissions: boolean;
    /** Whether the command can only be used in NSFW channels */
    public nsfw: boolean;
    /** Whether the default command handling is enabled for the command */
    public defaultHandling: boolean;
    /** Options for throttling command usages */
    public throttling: ThrottlingOptions | null;
    /** The argument collector for the command */
    public argsCollector: ArgumentCollector | null;
    /** How the arguments are split when passed to the command's run method */
    public argsType: 'multiple' | 'single';
    /** Maximum number of arguments that will be split */
    public argsCount: number;
    /** Whether single quotes are allowed to encapsulate an argument */
    public argsSingleQuotes: boolean;
    /** Regular expression triggers */
    public patterns: RegExp[] | null;
    /** Whether the command is protected from being disabled */
    public guarded: boolean;
    /** Whether the command should be hidden from the help command */
    public hidden: boolean;
    /** Whether the command will be run when an unknown command is used */
    public unknown: boolean;
    /** Whether the command is marked as deprecated */
    public deprecated: boolean;
    /** The name or alias of the command that is replacing the deprecated command. Required if `deprecated` is `true`. */
    public deprecatedReplacement: string | null;
    /** Whether this command will be registered in the test guild only or not */
    public testEnv: boolean;
    /** The data for the slash command */
    public slashInfo: APISlashCommand | null;
    /** Whether the command is enabled globally */
    protected _globalEnabled: boolean;
    /** Current throttle objects for the command, mapped by user ID */
    protected _throttles: Map<string, Throttle>;

    /**
     * @param client - The client the command is for
     * @param info - The command information
     * @param slashInfo - The slash command information
     */
    public constructor(client: CommandoClient, info: CommandInfo<InGuild>, slashInfo?: SlashCommandInfo) {
        Command.validateInfo(client, info);
        const parsedSlashInfo = Command.validateAndParseSlashInfo(info, slashInfo);

        Object.defineProperty(this, 'client', { value: client });

        this.name = info.name;
        this.aliases = info.aliases ?? [];
        if (info.autoAliases) {
            if (this.name.includes('-')) this.aliases.push(this.name.replace(/-/g, ''));
            for (const alias of this.aliases) {
                if (alias.includes('-')) this.aliases.push(alias.replace(/-/g, ''));
            }
        }

        this.groupId = info.group;
        this.memberName = info.memberName ?? this.name;
        this.description = info.description;
        this.format = info.format ?? null;
        this.details = info.details ?? null;
        this.examples = info.examples ?? null;
        this.dmOnly = !!info.dmOnly;
        // @ts-expect-error: seriously?
        this.guildOnly = !!info.guildOnly;
        this.guildOwnerOnly = !!info.guildOwnerOnly;
        this.ownerOnly = !!info.ownerOnly;
        this.clientPermissions = info.clientPermissions ?? null;
        this.userPermissions = info.userPermissions ?? null;
        this.modPermissions = !!info.modPermissions;
        this.nsfw = !!info.nsfw;
        this.defaultHandling = info.defaultHandling ?? true;
        this.throttling = info.throttling ?? null;
        this.argsCollector = info.args?.length
            ? new ArgumentCollector(client, info.args, info.argsPromptLimit)
            : null;
        if (this.argsCollector && !info.format) {
            this.format = this.argsCollector.args.reduce((prev, arg) => {
                const wrapL = arg.required ? '[' : '<';
                const wrapR = arg.required ? ']' : '>';
                return `${prev}${prev ? ' ' : ''}${wrapL}${arg.label}${arg.infinite ? '...' : ''}${wrapR}`;
            }, '');
        }

        this.argsType = info.argsType ?? 'single';
        this.argsCount = info.argsCount ?? 0;
        this.argsSingleQuotes = info.argsSingleQuotes ?? true;
        this.patterns = info.patterns ?? null;
        this.guarded = !!info.guarded;
        this.hidden = !!info.hidden;
        this.unknown = !!info.unknown;
        this.deprecated = !!info.deprecated;
        this.deprecatedReplacement = info.deprecatedReplacement ?? null;
        this.testEnv = !!info.testEnv;
        this.slashInfo = parsedSlashInfo;
        this._globalEnabled = true;
        this._throttles = new Map();
    }

    /**
     * Runs the command
     * @param instances - The message the command is being run for
     * @param args - The arguments for the command, or the matches from a pattern.
     * If args is specified on the command, this will be the argument values object. If argsType is single, then only
     * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
     * matches array from the pattern match (see
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec RegExp#exec}).
     * @param fromPattern - Whether or not the command is being run from a pattern match
     * @param result - Result from obtaining the arguments from the collector (if applicable)
     */
    public abstract run(
        instances: CommandInstances<InGuild>,
        args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult | null
    ): Awaitable<Message | Message[] | null | void>;

    /**
     * Checks whether the user has permission to use the command
     * @param instances - The triggering command instances
     * @param ownerOverride - Whether the bot owner(s) will always have permission
     * @return Whether the user has permission, or an error message to respond with if they don't
     */
    public hasPermission(
        instances: CommandInstances<InGuild>, ownerOverride = true
    ): CommandBlockReason | PermissionsString[] | true {
        const { guildOwnerOnly, ownerOnly, userPermissions, modPermissions, client } = this;
        const instance = Util.getInstanceFrom(instances);
        const { channel, guild, member, author } = instance;

        if (!guildOwnerOnly && !ownerOnly && !userPermissions && !modPermissions) return true;
        if (ownerOverride && client.isOwner(author)) return true;

        if (ownerOnly && !client.isOwner(author)) {
            return 'ownerOnly';
        }

        if (guildOwnerOnly && guild?.ownerId !== author.id) {
            return 'guildOwnerOnly';
        }

        if (!channel.isDMBased()) {
            if (modPermissions && !isModerator(member as CommandoGuildMember)) {
                return 'modPermissions';
            }
            if (userPermissions) {
                const missing = channel.permissionsFor(author)?.missing(userPermissions, false) ?? [];
                if (missing.length > 0) return missing;
            }
        }

        return true;
    }

    /**
     * Called when the command is prevented from running
     * @param instances - The instances the command is being run for
     * @param reason - Reason that the command was blocked
     * @param data - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Throttle}), `remaining` (number) time in seconds
     * - userPermissions & clientPermissions: `missing` (Array<string>) permission names
     */
    public onBlock(
        instances: CommandInstances, reason: CommandBlockReason, data: CommandBlockData = {}
    ): Promise<Message | null> {
        const { name } = this;
        const { missing, remaining } = data;
        const useCommandOnlyIf = (location: string): string => `The \`${name}\` command can only be used ${location}.`;

        switch (reason) {
            case 'dmOnly':
                return replyInstance(instances, embed(useCommandOnlyIf('in direct messages')));
            case 'guildOnly':
                return replyInstance(instances, embed(useCommandOnlyIf('in a server channel')));
            case 'guildOwnerOnly':
                return replyInstance(instances, embed(useCommandOnlyIf('by the server\'s owner')));
            case 'nsfw':
                return replyInstance(instances, embed(useCommandOnlyIf('in a NSFW channel')));
            case 'ownerOnly':
                return replyInstance(instances, embed(useCommandOnlyIf('by the bot\'s owner')));
            case 'userPermissions': {
                if (!missing) {
                    throw new Error('Missing permissions object must be specified for "userPermissions" case');
                }
                return replyInstance(instances, embed(
                    'You are missing the following permissions:',
                    missing.map(perm => `\`${Util.permissions[perm]}\``).join(', ')
                ));
            }
            case 'modPermissions':
                return replyInstance(instances, embed(
                    useCommandOnlyIf('by "moderators"'),
                    'For more information visit the `page 3` of the `help` command.'
                ));
            case 'clientPermissions': {
                if (!missing) {
                    throw new Error('Missing permissions object must be specified for "clientPermissions" case');
                }
                return replyInstance(instances, embed(
                    'The bot is missing the following permissions:',
                    missing.map(perm => `\`${Util.permissions[perm]}\``).join(', ')
                ));
            }
            case 'throttling': {
                if (!remaining) {
                    throw new Error('Remaining time value must be specified for "throttling" case');
                }
                return replyInstance(instances, embed(
                    `Please wait **${remaining.toFixed(1)} seconds** before using the \`${name}\` command again.`
                ));
            }
        }
    }

    /**
     * Called when the command produces an error while running
     * @param err - Error that was thrown
     * @param instances - The instances the command is being run for
     * @param args - Arguments for the command (see {@link Command#run})
     * @param fromPattern - Whether the args are pattern matches (see {@link Command#run})
     * @param result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command#run})
     */
    public async onError(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        err: Error, instances: CommandInstances, args: Record<string, unknown> | string[] | string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        fromPattern?: boolean, result?: ArgumentCollectorResult | null
    ): Promise<Message | Message[] | null> {
        return null;
    }

    /**
     * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
     * @param userId - ID of the user to throttle for
     */
    protected throttle(userId: string): Throttle | null {
        const { throttling, _throttles, client } = this;
        if (!throttling || client.isOwner(userId)) return null;

        let throttle = _throttles.get(userId);
        if (!throttle) {
            throttle = {
                start: Date.now(),
                usages: 0,
                timeout: setTimeout(() => {
                    _throttles.delete(userId);
                }, throttling.duration * 1000),
            };
            _throttles.set(userId, throttle);
        }

        return throttle;
    }

    /**
     * Enables or disables the command in a guild
     * @param guild - Guild to enable/disable the command in
     * @param enabled - Whether the command should be enabled or disabled
     */
    public setEnabledIn(guild: CommandoGuild | GuildResolvable | null, enabled: boolean): void {
        const { client, guarded } = this;
        if (typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        if (guarded) throw new Error('The command is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            client.emit('commandStatusChange', null, this, enabled);
            return;
        }
        const commandoGuild = client.guilds.resolve(guild) as CommandoGuild;
        commandoGuild.setCommandEnabled(this, enabled);
    }

    /**
     * Checks if the command is enabled in a guild
     * @param guild - Guild to check in
     * @param bypassGroup - Whether to bypass checking the group's status
     */
    public isEnabledIn(guild: CommandoGuild | GuildResolvable | null, bypassGroup?: boolean): boolean {
        const { client, group } = this;
        if (this.guarded) return true;
        if (!guild) return group.isEnabledIn(null) && this._globalEnabled;
        const commandoGuild = client.guilds.resolve(guild) as CommandoGuild;
        return (bypassGroup || commandoGuild.isGroupEnabled(group)) && commandoGuild.isCommandEnabled(this);
    }

    /**
     * Checks if the command is usable for a message
     * @param instances - The instances
     */
    public isUsable(instances?: CommandInstances<InGuild>): boolean {
        if (!instances) return this._globalEnabled;
        const instance = Util.getInstanceFrom(instances);
        const { guild } = instance;
        if (this.guildOnly && !guild) return false;
        const hasPermission = this.hasPermission(instances);
        return this.isEnabledIn(guild) && hasPermission === true;
    }

    /**
     * Creates a usage string for the command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    public usage(
        argString?: string, prefix: string | null | undefined = this.client.prefix, user: User | null = this.client.user
    ): string {
        return Command.usage(`${this.name}${argString ? ` ${argString}` : ''}`, prefix, user);
    }

    /** Reloads the command */
    public reload(): void {
        const { client, groupId, memberName } = this;
        const { registry } = client;

        let cmdPath = '';
        let cached: NodeModule | undefined;
        let newCmd: this;
        try {
            cmdPath = registry.resolveCommandPath(groupId, memberName);
            cached = require.cache[cmdPath];
            delete require.cache[cmdPath];
            newCmd = require(cmdPath);
        } catch (err) {
            if (cached) require.cache[cmdPath] = cached;
            try {
                cmdPath = path.join(__dirname, groupId, `${memberName}.js`);
                cached = require.cache[cmdPath];
                delete require.cache[cmdPath];
                newCmd = require(cmdPath);
            } catch (err2) {
                if (cached) require.cache[cmdPath] = cached;
                if ((err2 as Error).message.includes('Cannot find module')) {
                    throw err;
                }
                throw err2;
            }
        }

        registry.reregisterCommand(newCmd, this);
    }

    /** Unloads the command */
    public unload(): void {
        const { client, groupId, memberName } = this;
        const { registry } = client;

        const cmdPath = registry.resolveCommandPath(groupId, memberName);
        if (!require.cache[cmdPath]) throw new Error('Command cannot be unloaded.');
        delete require.cache[cmdPath];
        registry.unregisterCommand(this);
    }

    /**
     * Creates a usage string for a command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    public static usage(command: string, prefix: string | null = null, user: User | null = null): string {
        const nbcmd = command.replace(/ /g, '\xa0');
        if (!prefix && !user) return `\`${nbcmd}\``;

        let prefixPart: string | undefined;
        if (prefix) {
            if (prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' ';
            prefix = prefix.replace(/ /g, '\xa0');
            prefixPart = `\`${prefix}${nbcmd}\``;
        }

        let mentionPart: string | undefined;
        if (user) mentionPart = `\`@${user.tag.replace(/ /g, '\xa0')}\xa0${nbcmd}\``;

        return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`;
    }

    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    protected static validateInfo(client: CommandoClient, info: CommandInfo): void {
        if (!client) throw new Error('A client must be specified.');
        if (typeof info !== 'object') throw new TypeError('Command info must be an object.');
        if (typeof info.name !== 'string') throw new TypeError('Command name must be a string.');
        if (info.name !== info.name.toLowerCase()) throw new Error('Command name must be lowercase.');
        if (info.name.replace(/ +/g, '') !== info.name) throw new Error('Command name must not include spaces.');
        if ('aliases' in info) {
            if (!Array.isArray(info.aliases) || info.aliases.some(ali => typeof ali !== 'string')) {
                throw new TypeError('Command aliases must be an Array of strings.');
            }
            if (info.aliases.some(ali => ali !== ali.toLowerCase())) {
                throw new RangeError('Command aliases must be lowercase.');
            }
        }
        if (typeof info.group !== 'string') throw new TypeError('Command group must be a string.');
        if (info.group !== info.group.toLowerCase()) throw new RangeError('Command group must be lowercase.');
        if (typeof info.name !== 'string' && typeof info.memberName !== 'string') {
            throw new TypeError('Command memberName must be a string.');
        }
        if (info.memberName !== info.memberName?.toLowerCase() && info.memberName === 'string') {
            throw new Error('Command memberName must be lowercase.');
        }
        if (typeof info.description !== 'string') throw new TypeError('Command description must be a string.');
        if ('format' in info && typeof info.format !== 'string') throw new TypeError('Command format must be a string.');
        if ('details' in info && typeof info.details !== 'string') throw new TypeError('Command details must be a string.');
        if ('examples' in info && (!Array.isArray(info.examples) || info.examples.some(ex => typeof ex !== 'string'))) {
            throw new TypeError('Command examples must be an Array of strings.');
        }
        if ('clientPermissions' in info) {
            if (!Array.isArray(info.clientPermissions)) {
                throw new TypeError('Command clientPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.clientPermissions) {
                if (!Util.permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if ('userPermissions' in info) {
            if (!Array.isArray(info.userPermissions)) {
                throw new TypeError('Command userPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.userPermissions) {
                if (!Util.permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
            }
        }
        if ('throttling' in info) {
            if (typeof info.throttling !== 'object') throw new TypeError('Command throttling must be an object.');
            if (typeof info.throttling.usages !== 'number' || isNaN(info.throttling.usages)) {
                throw new TypeError('Command throttling usages must be a number.');
            }
            if (info.throttling.usages < 1) throw new RangeError('Command throttling usages must be at least 1.');
            if (typeof info.throttling.duration !== 'number' || isNaN(info.throttling.duration)) {
                throw new TypeError('Command throttling duration must be a number.');
            }
            if (info.throttling.duration < 1) throw new RangeError('Command throttling duration must be at least 1.');
        }
        if ('args' in info && !Array.isArray(info.args)) throw new TypeError('Command args must be an Array.');
        if ('argsPromptLimit' in info && typeof info.argsPromptLimit !== 'number') {
            throw new TypeError('Command argsPromptLimit must be a number.');
        }
        if ('argsPromptLimit' in info && info.argsPromptLimit && info.argsPromptLimit < 0) {
            throw new RangeError('Command argsPromptLimit must be at least 0.');
        }
        if ('argsType' in info && info.argsType && !Util.equals(info.argsType, ['single', 'multiple'])) {
            throw new RangeError('Command argsType must be one of "single" or "multiple".');
        }
        if (info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
            throw new RangeError('Command argsCount must be at least 2.');
        }
        if ('patterns' in info && (!Array.isArray(info.patterns) || info.patterns.some(pat => !(pat instanceof RegExp)))) {
            throw new TypeError('Command patterns must be an Array of regular expressions.');
        }
        if (info.deprecated) {
            if (typeof info.deprecatedReplacement !== 'string') {
                throw new TypeError('Command deprecatedReplacement must be a string.');
            }
            if (info.deprecatedReplacement !== info.deprecatedReplacement.toLowerCase()) {
                throw new TypeError('Command deprecatedReplacement must be lowercase.');
            }
        }
    }

    /**
     * Validates the slash command information
     * @param info - Info to validate
     * @param slashInfo - Slash info to validate
     */
    protected static validateAndParseSlashInfo(info: CommandInfo, slashInfo?: SlashCommandInfo): APISlashCommand | null {
        if (!slashInfo) return null;
        const { name, description, userPermissions, dmOnly, guildOnly } = info;
        const {
            nameLocalizations = null,
            descriptionLocalizations = null,
            options,
        } = slashInfo;
        const memberPermissions = dmOnly ? 0n : (userPermissions && PermissionsBitField.resolve(userPermissions));

        const slash = new SlashCommandBuilder()
            .setName(name)
            .setNameLocalizations(nameLocalizations)
            .setDescription(description)
            .setDescriptionLocalizations(descriptionLocalizations)
            .setDMPermission(!guildOnly)
            .setDefaultMemberPermissions(memberPermissions);

        if (options) {
            addBasicOptions(slash, options);

            for (const option of options) {
                const { type: optionType } = option;

                if (optionType === ApplicationCommandOptionType.Subcommand) {
                    slash.addSubcommand(builder => {
                        createBaseSlashOption(option)(builder);
                        if (option.options) addBasicOptions(builder, option.options);
                        return builder;
                    });
                }
                if (optionType === ApplicationCommandOptionType.SubcommandGroup) {
                    slash.addSubcommandGroup(builder => {
                        createBaseSlashOption(option)(builder);
                        if (!option.options) return builder;
                        for (const subCommand of option.options) {
                            builder.addSubcommand(subBuilder => {
                                createBaseSlashOption(subCommand)(subBuilder);
                                if (subCommand.options) addBasicOptions(subBuilder, subCommand.options);
                                return subBuilder;
                            });
                        }
                        return builder;
                    });
                }
            }
        }

        // Validate data
        const validatedData = slash.toJSON();
        return {
            ...validatedData,
            deferEphemeral: !!slashInfo.deferEphemeral,
        };
    }
}

type SlashCommandOptionBase =
    | ApplicationCommandOptionBase
    | SharedNameAndDescription;

function createBaseSlashOption(option: ApplicationCommandOptionData): <T extends SlashCommandOptionBase>(builder: T) => T {
    return <T extends SlashCommandOptionBase>(builder: T): T => {
        builder.setName(option.name)
            .setNameLocalizations(option.nameLocalizations ?? null)
            .setDescription(option.description)
            .setDescriptionLocalizations(option.descriptionLocalizations ?? null);
        if (
            option.type !== ApplicationCommandOptionType.Subcommand
            && option.type !== ApplicationCommandOptionType.SubcommandGroup
            && builder instanceof ApplicationCommandOptionBase
        ) builder.setRequired(option.required ?? false);
        return builder;
    };
}

function addBasicOptions<T extends SharedSlashCommandOptions<boolean>>(
    builder: T, options: ApplicationCommandOptionData[]
): T {
    for (const option of options) {
        const { type: optionType } = option;

        if (optionType === ApplicationCommandOptionType.Attachment) {
            builder.addAttachmentOption(createBaseSlashOption(option));
        }
        if (optionType === ApplicationCommandOptionType.Boolean) {
            builder.addBooleanOption(createBaseSlashOption(option));
        }
        if (optionType === ApplicationCommandOptionType.Channel) {
            builder.addChannelOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                const channelTypes = option.channelTypes ?? option.channel_types;
                if (channelTypes) optBuilder.addChannelTypes(...channelTypes.map(t => t.valueOf()));
                return optBuilder;
            });
        }
        if (optionType === ApplicationCommandOptionType.Integer) {
            builder.addIntegerOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder)
                    .setAutocomplete(option.autocomplete ?? false);

                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices as Array<APIApplicationCommandOptionChoice<number>>);
                }

                if ('minValue' in option) {
                    const maxValue = option.maxValue ?? option.max_value;
                    if (!Util.isNullish(maxValue)) optBuilder.setMaxValue(maxValue);
                    const minValue = option.minValue ?? option.min_value;
                    if (!Util.isNullish(minValue)) optBuilder.setMinValue(minValue);
                }
                return optBuilder;
            });
        }
        if (optionType === ApplicationCommandOptionType.Mentionable) {
            builder.addMentionableOption(createBaseSlashOption(option));
        }
        if (optionType === ApplicationCommandOptionType.Number) {
            builder.addNumberOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder)
                    .setAutocomplete(option.autocomplete ?? false);

                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices as Array<APIApplicationCommandOptionChoice<number>>);
                }

                if ('minValue' in option) {
                    const maxValue = option.maxValue ?? option.max_value;
                    if (!Util.isNullish(maxValue)) optBuilder.setMaxValue(maxValue);
                    const minValue = option.minValue ?? option.min_value;
                    if (!Util.isNullish(minValue)) optBuilder.setMinValue(minValue);
                }
                return optBuilder;
            });
        }
        if (optionType === ApplicationCommandOptionType.Role) {
            builder.addRoleOption(createBaseSlashOption(option));
        }
        if (optionType === ApplicationCommandOptionType.String) {
            builder.addStringOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder)
                    .setAutocomplete(option.autocomplete ?? false);

                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices as Array<APIApplicationCommandOptionChoice<string>>);
                }

                if ('minLength' in option) {
                    const maxLength = option.maxLength ?? option.max_length;
                    if (!Util.isNullish(maxLength)) optBuilder.setMaxLength(maxLength);
                    const minLength = option.minLength ?? option.min_length;
                    if (!Util.isNullish(minLength)) optBuilder.setMinLength(minLength);
                }
                return optBuilder;
            });
        }
        if (optionType === ApplicationCommandOptionType.User) {
            builder.addUserOption(createBaseSlashOption(option));
        }
    }

    return builder;
}

/**
 * Creates a basic embed.
 * @param name - The text to fill the embed with.
 * @param value - The value of the field.
 */
function embed(name: string, value?: string): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(Colors.Red);

    if (value) embed.addFields([{ name, value }]);
    else embed.setDescription(name);

    return embed;
}

async function replyInstance(
    instances: CommandInstances, options: EmbedBuilder | Omit<MessageCreateOptions, 'flags'> | string
): Promise<Message | null> {
    if (options instanceof EmbedBuilder) options = { embeds: [options] };
    if (typeof options === 'string') options = { content: options };
    if ('interaction' in instances) {
        const { interaction } = instances;
        if (interaction.isEditable()) {
            return await interaction.editReply(options).catch(() => null);
        }
        await interaction.reply(options).catch(() => null);
        return null;
    }
    if ('message' in instances) {
        const { message } = instances;
        Object.assign(options, Util.noReplyPingInDMs(message));
        return await message.reply(options).catch(() => null);
    }
    return null;
}

const isModConditions: PermissionsString[] = [
    'BanMembers',
    'DeafenMembers',
    'KickMembers',
    'ManageChannels',
    'ManageEmojisAndStickers',
    'ManageGuild',
    'ManageMessages',
    'ManageNicknames',
    'ManageRoles',
    'ManageThreads',
    'ManageWebhooks',
    'MoveMembers',
    'MuteMembers',
];

function isModerator(member: CommandoGuildMember): boolean {
    if (!member) return false;
    const { permissions } = member;
    if (permissions.has('Administrator')) return true;

    const values = [];
    for (const condition of isModConditions) {
        values.push(permissions.has(condition));
    }

    return !!values.find(b => b === true);
}
