"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const collector_1 = __importDefault(require("./collector"));
const util_1 = __importDefault(require("../util"));
const argumentTypeToSlashMap /* : Record<ArgumentTypeString, SlashCommandOptionType> */ = {
    boolean: discord_js_1.ApplicationCommandOptionType.Boolean,
    'category-channel': discord_js_1.ApplicationCommandOptionType.Channel,
    channel: discord_js_1.ApplicationCommandOptionType.Channel,
    command: discord_js_1.ApplicationCommandOptionType.String,
    date: discord_js_1.ApplicationCommandOptionType.String,
    'default-emoji': discord_js_1.ApplicationCommandOptionType.String,
    duration: discord_js_1.ApplicationCommandOptionType.String,
    float: discord_js_1.ApplicationCommandOptionType.Number,
    'forum-channel': discord_js_1.ApplicationCommandOptionType.Channel,
    group: discord_js_1.ApplicationCommandOptionType.String,
    'guild-emoji': discord_js_1.ApplicationCommandOptionType.String,
    integer: discord_js_1.ApplicationCommandOptionType.Integer,
    invite: discord_js_1.ApplicationCommandOptionType.String,
    member: discord_js_1.ApplicationCommandOptionType.User,
    message: discord_js_1.ApplicationCommandOptionType.String,
    'news-channel': discord_js_1.ApplicationCommandOptionType.Channel,
    role: discord_js_1.ApplicationCommandOptionType.Role,
    'stage-channel': discord_js_1.ApplicationCommandOptionType.Channel,
    string: discord_js_1.ApplicationCommandOptionType.String,
    'text-channel': discord_js_1.ApplicationCommandOptionType.Channel,
    'thread-channel': discord_js_1.ApplicationCommandOptionType.Channel,
    time: discord_js_1.ApplicationCommandOptionType.String,
    user: discord_js_1.ApplicationCommandOptionType.User,
    'voice-channel': discord_js_1.ApplicationCommandOptionType.Channel,
};
const channelTypeMap = {
    'category-channel': [discord_js_1.ChannelType.GuildCategory],
    channel: [
        discord_js_1.ChannelType.AnnouncementThread,
        discord_js_1.ChannelType.GuildAnnouncement,
        discord_js_1.ChannelType.GuildCategory,
        discord_js_1.ChannelType.GuildForum,
        discord_js_1.ChannelType.GuildStageVoice,
        discord_js_1.ChannelType.GuildText,
        discord_js_1.ChannelType.GuildVoice,
        discord_js_1.ChannelType.PrivateThread,
        discord_js_1.ChannelType.PublicThread,
    ],
    'forum-channel': [discord_js_1.ChannelType.GuildForum],
    'news-channel': [discord_js_1.ChannelType.GuildAnnouncement],
    'stage-channel': [discord_js_1.ChannelType.GuildStageVoice],
    'text-channel': [discord_js_1.ChannelType.GuildText],
    'thread-channel': [
        discord_js_1.ChannelType.AnnouncementThread,
        discord_js_1.ChannelType.PrivateThread,
        discord_js_1.ChannelType.PublicThread,
    ],
    'voice-channel': [discord_js_1.ChannelType.GuildVoice],
};
const channelTypeMapKeys = Object.keys(channelTypeMap);
/**
 * A command that can be run in a client
 * @example
 * import { ApplicationCommandOptionType } from 'discord.js';
 * import { CommandoClient, Command, CommandContext, ParseRawArguments } from 'pixoll-commando';
 *
 * const args = [{
 *     key: 'first',
 *     prompt: 'First argument.',
 *     type: 'user',
 * }, {
 *     key: 'optional',
 *     prompt: 'Optional argument.',
 *     type: 'string',
 *     required: false,
 * }] as const;
 *
 * type RawArgs = typeof args;
 * type ParsedArgs = ParseRawArguments<RawArgs>;
 *
 * export default class TestCommand extends Command<boolean, RawArgs> {
 *     public constructor(client: CommandoClient) {
 *         super(client, {
 *             name: 'test',
 *             description: 'Test command.',
 *             group: 'commands',
 *             args,
 *         }, {
 *             options: [{
 *                 name: 'first',
 *                 description: 'First argument.',
 *                 type: ApplicationCommandOptionType.User,
 *                 required: true,
 *             }, {
 *                 name: 'optional',
 *                 description: 'Optional argument.',
 *                 type: ApplicationCommandOptionType.String,
 *             }],
 *         });
 *     }
 *
 *     public async run(context: CommandContext, args: ParsedArgs): Promise<void> {
 *         const content = `\`${context.toString()}\`: ${args.first}, ${args.optional}`;
 *         if ('isEditable' in context && context.isEditable()) {
 *             await context.editReply(content);
 *             return;
 *         }
 *         await context.reply(content);
 *     }
 * }
 */
class Command {
    /** Name of this command */
    name;
    /** Aliases for this command */
    aliases;
    /** ID of the group the command belongs to */
    groupId;
    /** Name of the command within the group */
    memberName;
    /** Short description of the command */
    description;
    /** Usage format string of the command */
    format;
    /** Long description of the command */
    details;
    /** Example usage strings */
    examples;
    /** Whether the command can only be run in direct messages */
    dmOnly;
    /** Whether the command can only be run in a guild channel */
    guildOnly;
    /** Whether the command can only be used by a server owner */
    guildOwnerOnly;
    /** Whether the command can only be used by an owner */
    ownerOnly;
    /** Permissions required by the client to use the command. */
    clientPermissions;
    /** Permissions required by the user to use the command. */
    userPermissions;
    /** Whether this command's user permissions are based on "moderator" permissions */
    modPermissions;
    /** Whether the command can only be used in NSFW channels */
    nsfw;
    /** Whether the default command handling is enabled for the command */
    defaultHandling;
    /** Options for throttling command usages */
    throttling;
    /** The argument collector for the command */
    argsCollector;
    /** How the arguments are split when passed to the command's run method */
    argsType;
    /** Maximum number of arguments that will be split */
    argsCount;
    /** Whether single quotes are allowed to encapsulate an argument */
    argsSingleQuotes;
    /** Regular expression triggers */
    patterns;
    /** Whether the command is protected from being disabled */
    guarded;
    /** Whether the command should be hidden from the help command */
    hidden;
    /** Whether the command will be run when an unknown command is used */
    unknown;
    /** Whether the command is marked as deprecated */
    deprecated;
    /** The name or alias of the command that is replacing the deprecated command. Required if `deprecated` is `true`. */
    deprecatedReplacement;
    /** Whether the application commands will be registered in the test guild only */
    testAppCommand;
    /** Data for the slash command */
    slashCommand;
    /** Data for the context menu commands */
    contextMenuCommands;
    /** Whether the command is enabled globally */
    _globalEnabled;
    /** Current throttle objects for the command, mapped by user ID */
    _throttles;
    /**
     * @param client - The client the command is for
     * @param info - The command information
     * @param slashInfo - The slash command information
     */
    constructor(client, info, slashInfo) {
        Command.validateInfo(client, info);
        Object.defineProperty(this, 'client', { value: client });
        this.name = info.name;
        this.aliases = info.aliases ?? [];
        if (info.autoAliases) {
            if (this.name.includes('-'))
                this.aliases.push(this.name.replace(/-/g, ''));
            for (const alias of this.aliases) {
                if (alias.includes('-'))
                    this.aliases.push(alias.replace(/-/g, ''));
            }
        }
        this.groupId = info.group;
        this.memberName = info.memberName ?? this.name;
        this.description = info.description;
        this.format = info.format ?? null;
        this.details = info.detailedDescription ?? null;
        this.examples = info.examples ?? null;
        this.dmOnly = !!info.dmOnly;
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
            ? new collector_1.default(client, info.args, info.argsPromptLimit)
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
        this.testAppCommand = !!info.testAppCommand;
        this.slashCommand = Command.validateAndParseSlashInfo(info, slashInfo);
        this.contextMenuCommands = Command.validateAndParseContextMenuInfo(info);
        this._globalEnabled = true;
        this._throttles = new Map();
    }
    /**
     * Checks whether the user has permission to use the command
     * @param context - The triggering command context
     * @param ownerOverride - Whether the bot owner(s) will always have permission
     * @return Whether the user has permission, or an error message to respond with if they don't
     */
    hasPermission(context, ownerOverride = true) {
        const { guildOwnerOnly, ownerOnly, userPermissions, modPermissions, client } = this;
        const { channel, guild, member, author } = context;
        if (!guildOwnerOnly && !ownerOnly && !userPermissions && !modPermissions)
            return true;
        if (ownerOverride && client.isOwner(author))
            return true;
        if (ownerOnly && !client.isOwner(author)) {
            return 'ownerOnly';
        }
        if (guildOwnerOnly && guild?.ownerId !== author.id) {
            return 'guildOwnerOnly';
        }
        if (channel && !channel.isDMBased()) {
            if (member && modPermissions && !isModerator(member)) {
                return 'modPermissions';
            }
            if (userPermissions) {
                const missing = channel.permissionsFor(author)?.missing(userPermissions, false) ?? [];
                if (missing.length > 0)
                    return missing;
            }
        }
        return true;
    }
    /**
     * Called when the command is prevented from running
     * @param context - The context og the command
     * @param reason - Reason that the command was blocked
     * @param data - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Throttle}), `remaining` (number) time in seconds
     * - userPermissions & clientPermissions: `missing` (Array<string>) permission names
     */
    async onBlock(context, reason, data = {}) {
        const { name, hidden } = this;
        if (hidden)
            return null;
        const { missing, remaining } = data;
        const useCommandOnlyIf = (location) => `The \`${name}\` command can only be used ${location}.`;
        switch (reason) {
            case 'dmOnly':
                return replyContext(context, embed(useCommandOnlyIf('in direct messages')));
            case 'guildOnly':
                return replyContext(context, embed(useCommandOnlyIf('in a server channel')));
            case 'guildOwnerOnly':
                return replyContext(context, embed(useCommandOnlyIf('by the server\'s owner')));
            case 'nsfw':
                return replyContext(context, embed(useCommandOnlyIf('in a NSFW channel')));
            case 'ownerOnly':
                return replyContext(context, embed(useCommandOnlyIf('by the bot\'s owner')));
            case 'userPermissions': {
                if (!missing) {
                    throw new Error('Missing permissions array must be specified for "userPermissions" case');
                }
                return replyContext(context, embed('You are missing the following permissions:', missing.map(perm => `\`${util_1.default.permissions[perm]}\``).join(', ')));
            }
            case 'modPermissions':
                return replyContext(context, embed(useCommandOnlyIf('by "moderators"'), 'For more information visit the `page 3` of the `help` command.'));
            case 'clientPermissions': {
                if (!missing) {
                    throw new Error('Missing permissions array must be specified for "clientPermissions" case');
                }
                return replyContext(context, embed('The bot is missing the following permissions:', missing.map(perm => `\`${util_1.default.permissions[perm]}\``).join(', ')));
            }
            case 'throttling': {
                if (!remaining) {
                    throw new Error('Remaining time value must be specified for "throttling" case');
                }
                return replyContext(context, embed(`Please wait **${remaining.toFixed(1)} seconds** before using the \`${name}\` command again.`));
            }
        }
    }
    /**
     * Called when the command produces an error while running
     * @param err - Error that was thrown
     * @param context - The context the command is being run for
     * @param args - Arguments for the command (see {@link Command.run Command#run})
     * @param fromPattern - Whether the args are pattern matches (see {@link Command.run Command#run})
     * @param result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command.run Command#run})
     */
    async onError(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    err, context, args, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromPattern, result) {
        return null;
    }
    /**
     * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
     * @param userId - ID of the user to throttle for
     */
    throttle(userId) {
        const { throttling, _throttles, client } = this;
        if (!throttling || client.isOwner(userId))
            return null;
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
    setEnabledIn(guild, enabled) {
        const { client, guarded } = this;
        if (typeof guild === 'undefined')
            throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined')
            throw new TypeError('Enabled must not be undefined.');
        if (guarded)
            throw new Error('The command is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            client.emit('commandStatusChange', null, this, enabled);
            return;
        }
        const commandoGuild = client.guilds.resolve(guild);
        commandoGuild.setCommandEnabled(this, enabled);
    }
    /**
     * Checks if the command is enabled in a guild
     * @param guild - Guild to check in
     * @param bypassGroup - Whether to bypass checking the group's status
     */
    isEnabledIn(guild, bypassGroup) {
        const { client, group } = this;
        if (this.guarded)
            return true;
        if (!guild)
            return group.isEnabledIn(null) && this._globalEnabled;
        const commandoGuild = client.guilds.resolve(guild);
        return (bypassGroup || commandoGuild.isGroupEnabled(group)) && commandoGuild.isCommandEnabled(this);
    }
    /**
     * Checks if the command is usable for a message
     * @param context - The command context
     */
    isUsable(context) {
        if (!context)
            return this._globalEnabled;
        const { guild } = context;
        if (this.guildOnly && !context.inGuild())
            return false;
        const hasPermission = this.hasPermission(context);
        return this.isEnabledIn(guild) && hasPermission === true;
    }
    /**
     * Creates a usage string for the command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    usage(argString, prefix = this.client.prefix, user = this.client.user) {
        return Command.usage(`${this.name}${argString ? ` ${argString}` : ''}`, prefix, user);
    }
    /** Reloads the command */
    reload() {
        const { client, groupId, memberName } = this;
        const { registry } = client;
        let commandPath = '';
        let cached;
        let newCommand;
        try {
            commandPath = registry.resolveCommandPath(groupId, memberName);
            cached = require.cache[commandPath];
            delete require.cache[commandPath];
            newCommand = require(commandPath);
        }
        catch (err) {
            if (cached)
                require.cache[commandPath] = cached;
            try {
                commandPath = path_1.default.join(__dirname, groupId, `${memberName}.js`);
                cached = require.cache[commandPath];
                delete require.cache[commandPath];
                newCommand = require(commandPath);
            }
            catch (err2) {
                if (cached)
                    require.cache[commandPath] = cached;
                if (err2.message.includes('Cannot find module')) {
                    throw err;
                }
                throw err2;
            }
        }
        registry.reregisterCommand(newCommand, this);
    }
    /** Unloads the command */
    unload() {
        const { client, groupId, memberName } = this;
        const { registry } = client;
        const cmdPath = registry.resolveCommandPath(groupId, memberName);
        if (!require.cache[cmdPath])
            throw new Error('Command cannot be unloaded.');
        delete require.cache[cmdPath];
        registry.unregisterCommand(this);
    }
    toString() {
        return this.name;
    }
    /**
     * Creates a usage string for a command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the prefixed command format
     * @param user - User to use for the mention command format
     */
    static usage(command, prefix = null, user = null) {
        const nbcmd = command.replace(/ /g, '\xa0');
        if (!prefix && !user)
            return `\`${nbcmd}\``;
        let prefixPart;
        if (prefix) {
            if (prefix.length > 1 && !prefix.endsWith(' '))
                prefix += ' ';
            prefix = prefix.replace(/ /g, '\xa0');
            prefixPart = `\`${prefix}${nbcmd}\``;
        }
        let mentionPart;
        if (user)
            mentionPart = `\`@${user.tag.replace(/ /g, '\xa0')}\xa0${nbcmd}\``;
        return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`;
    }
    /**
     * Validates the constructor parameters
     * @param client - Client to validate
     * @param info - Info to validate
     */
    static validateInfo(client, info) {
        if (!client)
            throw new Error('A client must be specified.');
        if (typeof info !== 'object')
            throw new TypeError('Command info must be an object.');
        if (typeof info.name !== 'string')
            throw new TypeError('Command name must be a string.');
        if (info.name !== info.name.toLowerCase())
            throw new Error('Command name must be lowercase.');
        if (info.name.replace(/ +/g, '') !== info.name)
            throw new Error('Command name must not include spaces.');
        if ('aliases' in info) {
            if (!Array.isArray(info.aliases) || info.aliases.some(alias => typeof alias !== 'string')) {
                throw new TypeError('Command aliases must be an Array of strings.');
            }
            if (info.aliases.some(alias => alias !== alias.toLowerCase())) {
                throw new RangeError('Command aliases must be lowercase.');
            }
        }
        if (typeof info.group !== 'string')
            throw new TypeError('Command group must be a string.');
        if (info.group !== info.group.toLowerCase())
            throw new RangeError('Command group must be lowercase.');
        if (typeof info.name !== 'string' && typeof info.memberName !== 'string') {
            throw new TypeError('Command memberName must be a string.');
        }
        if (info.memberName !== info.memberName?.toLowerCase() && info.memberName === 'string') {
            throw new Error('Command memberName must be lowercase.');
        }
        if (typeof info.description !== 'string')
            throw new TypeError('Command description must be a string.');
        if ('format' in info && typeof info.format !== 'string')
            throw new TypeError('Command format must be a string.');
        if ('details' in info && typeof info.detailedDescription !== 'string') {
            throw new TypeError('Command details must be a string.');
        }
        if ('examples' in info && (!Array.isArray(info.examples) || info.examples.some(ex => typeof ex !== 'string'))) {
            throw new TypeError('Command examples must be an Array of strings.');
        }
        if ('clientPermissions' in info) {
            if (!Array.isArray(info.clientPermissions)) {
                throw new TypeError('Command clientPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.clientPermissions) {
                if (!util_1.default.permissions[perm])
                    throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if ('userPermissions' in info) {
            if (!Array.isArray(info.userPermissions)) {
                throw new TypeError('Command userPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.userPermissions) {
                if (!util_1.default.permissions[perm])
                    throw new RangeError(`Invalid command userPermission: ${perm}`);
            }
        }
        if ('throttling' in info) {
            if (typeof info.throttling !== 'object')
                throw new TypeError('Command throttling must be an object.');
            if (typeof info.throttling.usages !== 'number' || isNaN(info.throttling.usages)) {
                throw new TypeError('Command throttling usages must be a number.');
            }
            if (info.throttling.usages < 1)
                throw new RangeError('Command throttling usages must be at least 1.');
            if (typeof info.throttling.duration !== 'number' || isNaN(info.throttling.duration)) {
                throw new TypeError('Command throttling duration must be a number.');
            }
            if (info.throttling.duration < 1)
                throw new RangeError('Command throttling duration must be at least 1.');
        }
        if ('args' in info && !Array.isArray(info.args))
            throw new TypeError('Command args must be an Array.');
        if ('argsPromptLimit' in info && typeof info.argsPromptLimit !== 'number') {
            throw new TypeError('Command argsPromptLimit must be a number.');
        }
        if ('argsPromptLimit' in info && info.argsPromptLimit && info.argsPromptLimit < 0) {
            throw new RangeError('Command argsPromptLimit must be at least 0.');
        }
        if ('argsType' in info && info.argsType && !util_1.default.equals(info.argsType, ['single', 'multiple'])) {
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
    static validateAndParseSlashInfo(info, slashInfo) {
        const { autogenerateSlashCommand, name, nameLocalizations = null, description, descriptionLocalizations = null, userPermissions, dmOnly, guildOnly, args, testAppCommand, } = info;
        if (!slashInfo && !autogenerateSlashCommand)
            return null;
        const slashOptions = (slashInfo ?? {}).options;
        const memberPermissions = dmOnly ? '0' : (userPermissions && discord_js_1.PermissionsBitField.resolve(userPermissions));
        const slash = new discord_js_1.SlashCommandBuilder()
            .setName(name)
            .setNameLocalizations(nameLocalizations)
            .setDescription(description)
            .setDescriptionLocalizations(descriptionLocalizations)
            .setDMPermission(!testAppCommand ? !guildOnly : null)
            .setDefaultMemberPermissions(memberPermissions);
        if (slashOptions || args) {
            const options = slashOptions ?? (autogenerateSlashCommand && args
                ? util_1.default.filterNullishItems(args.map(parseMessageArgToSlashOption))
                : null);
            if (options)
                addSlashOptions(slash, options);
        }
        // Validate data
        const validatedData = slash.toJSON();
        removeEmptyOptions(validatedData.options);
        return {
            type: discord_js_1.ApplicationCommandType.ChatInput,
            ...validatedData,
            deferEphemeral: !!slashInfo?.deferEphemeral,
        };
    }
    /**
     * Validates the slash command information
     * @param info - Info to validate
     * @param slashInfo - Slash info to validate
     */
    static validateAndParseContextMenuInfo(info) {
        const { contextMenuCommandTypes, name, nameLocalizations = null, userPermissions, dmOnly, guildOnly, testAppCommand, } = info;
        if (!contextMenuCommandTypes || contextMenuCommandTypes.length === 0)
            return [];
        const memberPermissions = dmOnly ? '0' : (userPermissions && discord_js_1.PermissionsBitField.resolve(userPermissions));
        const contextMenuCommands = contextMenuCommandTypes.map(type => new discord_js_1.ContextMenuCommandBuilder()
            .setType(type)
            .setName(name)
            .setNameLocalizations(nameLocalizations)
            .setDMPermission(!testAppCommand ? !guildOnly : null)
            .setDefaultMemberPermissions(memberPermissions)
            .toJSON());
        return contextMenuCommands;
    }
}
exports.default = Command;
function removeEmptyOptions(options) {
    if (!options)
        return;
    for (const option of options) {
        if (!('options' in option) || !option.options)
            continue;
        if (option.options.length === 0) {
            delete option.options;
            continue;
        }
        removeEmptyOptions(option.options);
    }
}
function parseMessageArgToSlashOption(arg) {
    const { key: name, prompt: description, type: rawType, min, max, oneOf, autocomplete } = arg;
    if (!rawType)
        return null;
    const parsedOptionName = /[A-Z]/.test(name) ? name.replace(/([A-Z]+)/g, '-$1').toLowerCase() : name;
    const required = 'required' in arg ? !!arg.required : !('default' in arg);
    const defaultData = {
        name: parsedOptionName,
        description,
        required,
    };
    const argType = Array.isArray(rawType) ? rawType[0] : rawType;
    const type = argumentTypeToSlashMap[argType];
    if (util_1.default.equals(type, [
        discord_js_1.ApplicationCommandOptionType.Boolean, discord_js_1.ApplicationCommandOptionType.User, discord_js_1.ApplicationCommandOptionType.Role,
    ]))
        return { type, ...defaultData };
    if (type === discord_js_1.ApplicationCommandOptionType.Channel && util_1.default.equals(argType, channelTypeMapKeys))
        return {
            type,
            ...defaultData,
            channelTypes: channelTypeMap[argType],
        };
    if (type === discord_js_1.ApplicationCommandOptionType.Channel
        && Array.isArray(rawType)
        && rawType.every((type) => util_1.default.equals(type, channelTypeMapKeys)))
        return {
            type,
            ...defaultData,
            channelTypes: rawType.map(type => channelTypeMap[type]).flat(),
        };
    if (type === discord_js_1.ApplicationCommandOptionType.String)
        return {
            type,
            ...defaultData,
            maxLength: max,
            minLength: min,
            ...autocomplete && { autocomplete },
            ...!autocomplete && oneOf && {
                choices: oneOf.filter((c) => typeof c === 'string').map(choice => ({
                    name: choice,
                    value: choice,
                })),
            },
        };
    if (util_1.default.equals(type, [discord_js_1.ApplicationCommandOptionType.Integer, discord_js_1.ApplicationCommandOptionType.Number]))
        return {
            type,
            ...defaultData,
            maxValue: max,
            minValue: min,
            ...autocomplete && { autocomplete },
            ...!autocomplete && oneOf && {
                choices: oneOf.filter((c) => typeof c === 'number').map(choice => ({
                    name: choice.toString(),
                    value: choice,
                })),
            },
        };
    return null;
}
function createBaseSlashOption(option) {
    return (builder) => {
        builder.setName(option.name)
            .setNameLocalizations(option.nameLocalizations ?? null)
            .setDescription(option.description)
            .setDescriptionLocalizations(option.descriptionLocalizations ?? null);
        if (option.type !== discord_js_1.ApplicationCommandOptionType.Subcommand
            && option.type !== discord_js_1.ApplicationCommandOptionType.SubcommandGroup
            && 'setRequired' in builder)
            builder.setRequired(option.required ?? false);
        return builder;
    };
}
function addSlashOptions(builder, options) {
    for (const option of options) {
        const { type: optionType } = option;
        if (optionType === discord_js_1.ApplicationCommandOptionType.Attachment) {
            builder.addAttachmentOption(createBaseSlashOption(option));
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.Boolean) {
            builder.addBooleanOption(createBaseSlashOption(option));
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.Channel) {
            builder.addChannelOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                const channelTypes = option.channelTypes ?? option.channel_types;
                if (channelTypes)
                    optBuilder.addChannelTypes(...channelTypes.map(t => t.valueOf()));
                return optBuilder;
            });
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.Integer) {
            builder.addIntegerOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.autocomplete)
                    optBuilder.setAutocomplete(option.autocomplete);
                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices);
                }
                const maxValue = option.maxValue ?? option.max_value;
                if (!util_1.default.isNullish(maxValue))
                    optBuilder.setMaxValue(maxValue);
                const minValue = option.minValue ?? option.min_value;
                if (!util_1.default.isNullish(minValue))
                    optBuilder.setMinValue(minValue);
                return optBuilder;
            });
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.Mentionable) {
            builder.addMentionableOption(createBaseSlashOption(option));
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.Number) {
            builder.addNumberOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.autocomplete)
                    optBuilder.setAutocomplete(option.autocomplete);
                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices);
                }
                const maxValue = option.maxValue ?? option.max_value;
                if (!util_1.default.isNullish(maxValue))
                    optBuilder.setMaxValue(maxValue);
                const minValue = option.minValue ?? option.min_value;
                if (!util_1.default.isNullish(minValue))
                    optBuilder.setMinValue(minValue);
                return optBuilder;
            });
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.Role) {
            builder.addRoleOption(createBaseSlashOption(option));
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.String) {
            builder.addStringOption(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.autocomplete)
                    optBuilder.setAutocomplete(option.autocomplete);
                if (!option.autocomplete && option.choices) {
                    optBuilder.addChoices(...option.choices);
                }
                const maxLength = option.maxLength ?? option.max_length;
                if (!util_1.default.isNullish(maxLength))
                    optBuilder.setMaxLength(maxLength);
                const minLength = option.minLength ?? option.min_length;
                if (!util_1.default.isNullish(minLength))
                    optBuilder.setMinLength(minLength);
                return optBuilder;
            });
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.User) {
            builder.addUserOption(createBaseSlashOption(option));
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.Subcommand && 'addSubcommand' in builder) {
            builder.addSubcommand(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (option.options)
                    addSlashOptions(optBuilder, option.options);
                return optBuilder;
            });
        }
        if (optionType === discord_js_1.ApplicationCommandOptionType.SubcommandGroup && 'addSubcommandGroup' in builder) {
            builder.addSubcommandGroup(optBuilder => {
                createBaseSlashOption(option)(optBuilder);
                if (!option.options)
                    return optBuilder;
                for (const subCommand of option.options) {
                    optBuilder.addSubcommand(subBuilder => {
                        createBaseSlashOption(subCommand)(subBuilder);
                        if (subCommand.options)
                            addSlashOptions(subBuilder, subCommand.options);
                        return subBuilder;
                    });
                }
                return optBuilder;
            });
        }
    }
    return builder;
}
/**
 * Creates a basic embed.
 * @param name - The text to fill the embed with.
 * @param value - The value of the field.
 */
function embed(name, value) {
    const embed = new discord_js_1.EmbedBuilder().setColor(discord_js_1.Colors.Red);
    if (value)
        embed.addFields([{ name, value }]);
    else
        embed.setDescription(name);
    return embed;
}
async function replyContext(context, options) {
    if (options instanceof discord_js_1.EmbedBuilder)
        options = { embeds: [options] };
    if (typeof options === 'string')
        options = { content: options };
    if ('isEditable' in context) {
        if (context.isEditable()) {
            return await context.editReply(options).catch(() => null);
        }
        await context.reply(options).catch(() => null);
        return null;
    }
    Object.assign(options, util_1.default.noReplyPingInDMs(context));
    return await context.reply(options).catch(() => null);
}
const isModConditions = [
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
function isModerator(member) {
    if (!member)
        return false;
    const { permissions } = member;
    if (permissions.has('Administrator'))
        return true;
    const values = [];
    for (const condition of isModConditions) {
        values.push(permissions.has(condition));
    }
    return values.some(b => b === true);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBMEJvQjtBQUNwQixnREFBd0I7QUFDeEIsNERBQTRGO0FBQzVGLG1EQUEyQjtBQTZQM0IsTUFBTSxzQkFBc0IsQ0FBQSwwREFBMEQsR0FBRztJQUNyRixPQUFPLEVBQUUseUNBQXNCLENBQUMsT0FBTztJQUN2QyxrQkFBa0IsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ2xELE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ3ZDLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3RDLElBQUksRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ25DLGVBQWUsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQzlDLFFBQVEsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3ZDLEtBQUssRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3BDLGVBQWUsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQy9DLEtBQUssRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3BDLGFBQWEsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQzVDLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ3ZDLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3JDLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxJQUFJO0lBQ25DLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3RDLGNBQWMsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQzlDLElBQUksRUFBRSx5Q0FBc0IsQ0FBQyxJQUFJO0lBQ2pDLGVBQWUsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQy9DLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3JDLGNBQWMsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQzlDLGdCQUFnQixFQUFFLHlDQUFzQixDQUFDLE9BQU87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