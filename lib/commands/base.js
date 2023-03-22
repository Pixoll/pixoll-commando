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
    group: discord_js_1.ApplicationCommandOptionType.String,
    'guild-emoji': discord_js_1.ApplicationCommandOptionType.String,
    integer: discord_js_1.ApplicationCommandOptionType.Integer,
    invite: discord_js_1.ApplicationCommandOptionType.String,
    member: discord_js_1.ApplicationCommandOptionType.User,
    message: discord_js_1.ApplicationCommandOptionType.String,
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
    channel: [null],
    'stage-channel': [discord_js_1.ChannelType.GuildStageVoice],
    'text-channel': [discord_js_1.ChannelType.GuildText],
    'thread-channel': [
        discord_js_1.ChannelType.AnnouncementThread,
        discord_js_1.ChannelType.PrivateThread,
        discord_js_1.ChannelType.PublicThread,
    ],
    'voice-channel': [discord_js_1.ChannelType.GuildVoice],
};
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
    if (type === discord_js_1.ApplicationCommandOptionType.Channel && util_1.default.equals(argType, [
        'category-channel', 'channel', 'text-channel', 'thread-channel', 'stage-channel', 'voice-channel',
    ]))
        return {
            type,
            ...defaultData,
            channelTypes: util_1.default.filterNullishItems(channelTypeMap[argType]),
        };
    if (type === discord_js_1.ApplicationCommandOptionType.Channel && Array.isArray(rawType) && rawType.every(type => util_1.default.equals(type, [
        'category-channel', 'channel', 'text-channel', 'thread-channel', 'stage-channel', 'voice-channel',
    ])))
        return {
            type,
            ...defaultData,
            channelTypes: util_1.default.filterNullishItems(rawType.map(type => channelTypeMap[type]).flat()),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBeUJvQjtBQUNwQixnREFBd0I7QUFDeEIsNERBQTRGO0FBQzVGLG1EQUF3QztBQWtQeEMsTUFBTSxzQkFBc0IsQ0FBQSwwREFBMEQsR0FBRztJQUNyRixPQUFPLEVBQUUseUNBQXNCLENBQUMsT0FBTztJQUN2QyxrQkFBa0IsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ2xELE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ3ZDLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3RDLElBQUksRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ25DLGVBQWUsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQzlDLFFBQVEsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3ZDLEtBQUssRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3BDLEtBQUssRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3BDLGFBQWEsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQzVDLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ3ZDLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3JDLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxJQUFJO0lBQ25DLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3RDLElBQUksRUFBRSx5Q0FBc0IsQ0FBQyxJQUFJO0lBQ2pDLGVBQWUsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQy9DLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3JDLGNBQWMsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQzlDLGdCQUFnQixFQUFFLHlDQUFzQixDQUFDLE9BQU87SUFDaEQsSUFBSSxFQUFFLHlDQUFzQixDQUFDLE1BQU07SUFDbkMsSUFBSSxFQUFFLHlDQUFzQixDQUFDLElBQUk7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