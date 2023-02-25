"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const collector_1 = __importDefault(require("./collector"));
const util_1 = __importDefault(require("../util"));
/** A command that can be run in a client */
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
     * @param instances - The triggering command instances
     * @param ownerOverride - Whether the bot owner(s) will always have permission
     * @return Whether the user has permission, or an error message to respond with if they don't
     */
    hasPermission(instances, ownerOverride = true) {
        const { guildOwnerOnly, ownerOnly, userPermissions, modPermissions, client } = this;
        const instance = util_1.default.getInstanceFrom(instances);
        const { channel, guild, member, author } = instance;
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
     * @param instances - The instances the command is being run for
     * @param reason - Reason that the command was blocked
     * @param data - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Throttle}), `remaining` (number) time in seconds
     * - userPermissions & clientPermissions: `missing` (Array<string>) permission names
     */
    onBlock(instances, reason, data = {}) {
        const { name } = this;
        const { missing, remaining } = data;
        const useCommandOnlyIf = (location) => `The \`${name}\` command can only be used ${location}.`;
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
                return replyInstance(instances, embed('You are missing the following permissions:', missing.map(perm => `\`${util_1.default.permissions[perm]}\``).join(', ')));
            }
            case 'modPermissions':
                return replyInstance(instances, embed(useCommandOnlyIf('by "moderators"'), 'For more information visit the `page 3` of the `help` command.'));
            case 'clientPermissions': {
                if (!missing) {
                    throw new Error('Missing permissions object must be specified for "clientPermissions" case');
                }
                return replyInstance(instances, embed('The bot is missing the following permissions:', missing.map(perm => `\`${util_1.default.permissions[perm]}\``).join(', ')));
            }
            case 'throttling': {
                if (!remaining) {
                    throw new Error('Remaining time value must be specified for "throttling" case');
                }
                return replyInstance(instances, embed(`Please wait **${remaining.toFixed(1)} seconds** before using the \`${name}\` command again.`));
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
    async onError(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    err, instances, args, 
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
     * @param instances - The instances
     */
    isUsable(instances) {
        if (!instances)
            return this._globalEnabled;
        const instance = util_1.default.getInstanceFrom(instances);
        const { guild } = instance;
        if (this.guildOnly && !instance.inGuild())
            return false;
        const hasPermission = this.hasPermission(instances);
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
        let cmdPath = '';
        let cached;
        let newCmd;
        try {
            cmdPath = registry.resolveCommandPath(groupId, memberName);
            cached = require.cache[cmdPath];
            delete require.cache[cmdPath];
            newCmd = require(cmdPath);
        }
        catch (err) {
            if (cached)
                require.cache[cmdPath] = cached;
            try {
                cmdPath = path_1.default.join(__dirname, groupId, `${memberName}.js`);
                cached = require.cache[cmdPath];
                delete require.cache[cmdPath];
                newCmd = require(cmdPath);
            }
            catch (err2) {
                if (cached)
                    require.cache[cmdPath] = cached;
                if (err2.message.includes('Cannot find module')) {
                    throw err;
                }
                throw err2;
            }
        }
        registry.reregisterCommand(newCmd, this);
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
        if (!slashInfo)
            return null;
        const { name, description, userPermissions, dmOnly, guildOnly } = info;
        const { nameLocalizations = null, descriptionLocalizations = null, options, } = slashInfo;
        const memberPermissions = dmOnly ? '0' : (userPermissions && discord_js_1.PermissionsBitField.resolve(userPermissions));
        const slash = new discord_js_1.SlashCommandBuilder()
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
                if (optionType === discord_js_1.ApplicationCommandOptionType.Subcommand) {
                    slash.addSubcommand(builder => {
                        createBaseSlashOption(option)(builder);
                        if (option.options)
                            addBasicOptions(builder, option.options);
                        return builder;
                    });
                }
                if (optionType === discord_js_1.ApplicationCommandOptionType.SubcommandGroup) {
                    slash.addSubcommandGroup(builder => {
                        createBaseSlashOption(option)(builder);
                        if (!option.options)
                            return builder;
                        for (const subCommand of option.options) {
                            builder.addSubcommand(subBuilder => {
                                createBaseSlashOption(subCommand)(subBuilder);
                                if (subCommand.options)
                                    addBasicOptions(subBuilder, subCommand.options);
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
exports.default = Command;
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
function addBasicOptions(builder, options) {
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
async function replyInstance(instances, options) {
    if (options instanceof discord_js_1.EmbedBuilder)
        options = { embeds: [options] };
    if (typeof options === 'string')
        options = { content: options };
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
        Object.assign(options, util_1.default.noReplyPingInDMs(message));
        return await message.reply(options).catch(() => null);
    }
    return null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBa0JvQjtBQUNwQixnREFBd0I7QUFDeEIsNERBQXVGO0FBQ3ZGLG1EQUEyQjtBQStNM0IsNENBQTRDO0FBQzVDLE1BQThCLE9BQU87SUFHakMsMkJBQTJCO0lBQ3BCLElBQUksQ0FBUztJQUNwQiwrQkFBK0I7SUFDeEIsT0FBTyxDQUFXO0lBQ3pCLDZDQUE2QztJQUN0QyxPQUFPLENBQVM7SUFHdkIsMkNBQTJDO0lBQ3BDLFVBQVUsQ0FBUztJQUMxQix1Q0FBdUM7SUFDaEMsV0FBVyxDQUFTO0lBQzNCLHlDQUF5QztJQUNsQyxNQUFNLENBQWdCO0lBQzdCLHNDQUFzQztJQUMvQixPQUFPLENBQWdCO0lBQzlCLDRCQUE0QjtJQUNyQixRQUFRLENBQWtCO0lBQ2pDLDZEQUE2RDtJQUN0RCxNQUFNLENBQVU7SUFDdkIsNkRBQTZEO0lBQ3RELFNBQVMsQ0FBVTtJQUMxQiw2REFBNkQ7SUFDdEQsY0FBYyxDQUFVO0lBQy9CLHVEQUF1RDtJQUNoRCxTQUFTLENBQVU7SUFDMUIsNkRBQTZEO0lBQ3RELGlCQUFpQixDQUE2QjtJQUNyRCwyREFBMkQ7SUFDcEQsZUFBZSxDQUE2QjtJQUNuRCxtRkFBbUY7SUFDNUUsY0FBYyxDQUFVO0lBQy9CLDREQUE0RDtJQUNyRCxJQUFJLENBQVU7SUFDckIsc0VBQXNFO0lBQy9ELGVBQWUsQ0FBVTtJQUNoQyw0Q0FBNEM7SUFDckMsVUFBVSxDQUEyQjtJQUM1Qyw2Q0FBNkM7SUFDdEMsYUFBYSxDQUFpQztJQUNyRCwwRUFBMEU7SUFDbkUsUUFBUSxDQUF3QjtJQUN2QyxxREFBcUQ7SUFDOUMsU0FBUyxDQUFTO0lBQ3pCLG1FQUFtRTtJQUM1RCxnQkFBZ0IsQ0FBVTtJQUNqQyxrQ0FBa0M7SUFDM0IsUUFBUSxDQUFrQjtJQUNqQywyREFBMkQ7SUFDcEQsT0FB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