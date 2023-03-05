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
    /** Whether this command will be registered in the test guild only or not */
    testEnv;
    /** The data for the slash command */
    slashInfo;
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
        const parsedSlashInfo = Command.validateAndParseSlashInfo(info, slashInfo);
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
        this.testEnv = !!info.testEnv;
        this.slashInfo = parsedSlashInfo;
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
    onBlock(context, reason, data = {}) {
        const { name } = this;
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
     * @param args - Arguments for the command (see {@link Command#run})
     * @param fromPattern - Whether the args are pattern matches (see {@link Command#run})
     * @param result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command#run})
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
            if (!Array.isArray(info.aliases) || info.aliases.some(ali => typeof ali !== 'string')) {
                throw new TypeError('Command aliases must be an Array of strings.');
            }
            if (info.aliases.some(ali => ali !== ali.toLowerCase())) {
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
        if ('details' in info && typeof info.details !== 'string')
            throw new TypeError('Command details must be a string.');
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
        const { autogenerateSlashCommand, name, description, userPermissions, dmOnly, guildOnly, args } = info;
        if (!slashInfo && !autogenerateSlashCommand)
            return null;
        const { nameLocalizations = null, descriptionLocalizations = null, options: slashOptions, } = slashInfo ?? {};
        const memberPermissions = dmOnly ? '0' : (userPermissions && discord_js_1.PermissionsBitField.resolve(userPermissions));
        const slash = new discord_js_1.SlashCommandBuilder()
            .setName(name)
            .setNameLocalizations(nameLocalizations)
            .setDescription(description)
            .setDescriptionLocalizations(descriptionLocalizations)
            .setDMPermission(!guildOnly)
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
        return {
            ...validatedData,
            deferEphemeral: !!slashInfo?.deferEphemeral,
        };
    }
}
exports.default = Command;
function parseMessageArgToSlashOption(arg) {
    const { key: name, prompt: description, type: rawType, min, max, oneOf } = arg;
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
            choices: oneOf?.filter((c) => typeof c === 'string').map(choice => ({
                name: choice,
                value: choice,
            })),
        };
    if (util_1.default.equals(type, [discord_js_1.ApplicationCommandOptionType.Integer, discord_js_1.ApplicationCommandOptionType.Number]))
        return {
            type,
            ...defaultData,
            maxValue: max,
            minValue: min,
            choices: oneOf?.filter((c) => typeof c === 'number').map(choice => ({
                name: choice.toString(),
                value: choice,
            })),
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
                if ('minValue' in option) {
                    const maxValue = option.maxValue ?? option.max_value;
                    if (!util_1.default.isNullish(maxValue))
                        optBuilder.setMaxValue(maxValue);
                    const minValue = option.minValue ?? option.min_value;
                    if (!util_1.default.isNullish(minValue))
                        optBuilder.setMinValue(minValue);
                }
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
                if ('minValue' in option) {
                    const maxValue = option.maxValue ?? option.max_value;
                    if (!util_1.default.isNullish(maxValue))
                        optBuilder.setMaxValue(maxValue);
                    const minValue = option.minValue ?? option.min_value;
                    if (!util_1.default.isNullish(minValue))
                        optBuilder.setMinValue(minValue);
                }
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
                if ('minLength' in option) {
                    const maxLength = option.maxLength ?? option.max_length;
                    if (!util_1.default.isNullish(maxLength))
                        optBuilder.setMaxLength(maxLength);
                    const minLength = option.minLength ?? option.min_length;
                    if (!util_1.default.isNullish(minLength))
                        optBuilder.setMinLength(minLength);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBbUJvQjtBQUNwQixnREFBd0I7QUFDeEIsNERBQTRGO0FBQzVGLG1EQUEyQjtBQTZOM0IsTUFBTSxzQkFBc0IsQ0FBQSwwREFBMEQsR0FBRztJQUNyRixPQUFPLEVBQUUseUNBQXNCLENBQUMsT0FBTztJQUN2QyxrQkFBa0IsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ2xELE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ3ZDLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3RDLElBQUksRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ25DLGVBQWUsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQzlDLFFBQVEsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3ZDLEtBQUssRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3BDLEtBQUssRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3BDLGFBQWEsRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQzVDLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQ3ZDLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3JDLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxJQUFJO0lBQ25DLE9BQU8sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3RDLElBQUksRUFBRSx5Q0FBc0IsQ0FBQyxJQUFJO0lBQ2pDLGVBQWUsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQy9DLE1BQU0sRUFBRSx5Q0FBc0IsQ0FBQyxNQUFNO0lBQ3JDLGNBQWMsRUFBRSx5Q0FBc0IsQ0FBQyxPQUFPO0lBQzlDLGdCQUFnQixFQUFFLHlDQUFzQixDQUFDLE9BQU87SUFDaEQsSUFBSSxFQUFFLHlDQUFzQixDQUFDLE1BQU07SUFDbkMsSUFBSSxFQUFFLHlDQUFzQixDQUFDLElBQUk7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