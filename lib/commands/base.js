"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const collector_1 = __importDefault(require("./collector"));
const util_1 = require("../util");
/** A command that can be run in a client */
class Command {
    /** Client that this command is for */
    client;
    /** Name of this command */
    name;
    /** Aliases for this command */
    aliases;
    /** ID of the group the command belongs to */
    groupId;
    /** The group the command belongs to, assigned upon registration */
    group;
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
    /**
     * The name or alias of the command that is replacing the deprecated command. Required if `deprecated` is `true`.
     */
    replacing;
    /** Whether this command will be registered in the test guild only or not */
    test;
    /** The data for the slash command */
    slash;
    /** Whether the command is enabled globally */
    _globalEnabled;
    /** The slash command data to send to the API */
    _slashToAPI;
    /** Current throttle objects for the command, mapped by user ID */
    _throttles;
    /**
     * @param client - The client the command is for
     * @param info - The command information
     */
    constructor(client, info) {
        Command.validateInfo(client, info);
        Object.defineProperty(this, 'client', { value: client });
        this.client;
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
        this.group = null;
        this.memberName = info.memberName ?? this.name;
        this.description = info.description;
        this.format = info.format ?? null;
        this.details = info.details ?? null;
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
        this.argsCollector = info.args?.length ?
            new collector_1.default(client, info.args, info.argsPromptLimit) :
            null;
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
        this.replacing = info.replacing ?? null;
        this.test = !!info.test;
        this.slash = info.slash ?? false;
        this._globalEnabled = true;
        this._slashToAPI = this.slash ? Command.parseSlash(JSON.parse(JSON.stringify(this.slash))) : null;
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
        const { message, interaction } = instances;
        const { channel, guild, member } = (message || interaction);
        const author = message?.author || interaction.user;
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
        if (channel.type !== 'DM') {
            // @ts-expect-error: CommandoMember is not assignable to GuildMember
            if (modPermissions && !isMod(member)) {
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
     * Runs the command
     * @param instances - The message the command is being run for
     * @param args - The arguments for the command, or the matches from a pattern.
     * If args is specified on the command, this will be the argument values object. If argsType is single, then only
     * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
     * matches array from the pattern match
     * (see [RegExp#exec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)).
     * @param fromPattern - Whether or not the command is being run from a pattern match
     * @param result - Result from obtaining the arguments from the collector (if applicable)
     * @return {Promise<?Message|?Array<Message>>}
     */
    run(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    instances, args, fromPattern, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result) {
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }
    /**
     * Called when the command is prevented from running
     * @param instances - The instances the command is being run for
     * @param reason - Reason that the command was blocked
     * @param data - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
     * - userPermissions & clientPermissions: `missing` ({@link Array}<{@link string}>) permission names
     */
    onBlock(instances, reason, data = {}) {
        const { name } = this;
        const { message, interaction } = instances;
        const { missing, remaining } = data;
        switch (reason) {
            case 'dmOnly':
                return replyAll({ message, interaction }, embed(`The \`${name}\` command can only be used in direct messages.`));
            case 'guildOnly':
                return replyAll({ message, interaction }, embed(`The \`${name}\` command can only be used in a server channel.`));
            case 'guildOwnerOnly':
                return replyAll({ message, interaction }, embed(`The \`${name}\` command can only be used by the server's owner.`));
            case 'nsfw':
                return replyAll({ message, interaction }, embed(`The \`${name}\` command can only be used in a NSFW channel.`));
            case 'ownerOnly':
                return replyAll({ message, interaction }, embed(`The \`${name}\` command can only be used by the bot's owner.`));
            case 'userPermissions':
                return replyAll({ message, interaction }, embed('You are missing the following permissions:', missing.map(perm => `\`${util_1.permissions[perm]}\``).join(', ')));
            case 'modPermissions':
                return replyAll({ message, interaction }, embed(`The \`${name}\` command can only be used by "moderators".`, 'For more information visit the `page 3` of the `help` command.'));
            case 'clientPermissions':
                return replyAll({ message, interaction }, embed('The bot is missing the following permissions:', missing.map(perm => `\`${util_1.permissions[perm]}\``).join(', ')));
            case 'throttling':
                return replyAll({ message, interaction }, embed(`Please wait **${remaining.toFixed(1)} seconds** before using the \`${name}\` command again.`));
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
    onError(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    err, instances, args, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromPattern, result) {
        // @ts-expect-error: null not assignable to return type
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
                }, throttling.duration * 1000)
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
        // @ts-expect-error: _globalEnabled should not be used outside of CommandGroup
        if (!guild)
            return group._globalEnabled && this._globalEnabled;
        // @ts-expect-error: CommandoGuild is not assignable to Guild
        const commandoGuild = client.guilds.resolve(guild);
        return (bypassGroup || commandoGuild.isGroupEnabled(group)) && commandoGuild.isCommandEnabled(this);
    }
    /**
     * Checks if the command is usable for a message
     * @param instances - The instances
     */
    isUsable(instances = {}) {
        const { message, interaction } = instances;
        if (!message && !interaction)
            return this._globalEnabled;
        const { guild } = (message || interaction);
        if (this.guildOnly && !guild)
            return false;
        const hasPermission = this.hasPermission({ message, interaction });
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
        let cmdPath;
        let cached;
        let newCmd;
        try {
            cmdPath = registry.resolveCommandPath(groupId, memberName);
            cached = require.cache[cmdPath];
            delete require.cache[cmdPath];
            newCmd = require(cmdPath);
        }
        catch (err) {
            // @ts-expect-error: cmdPath is actually declared
            if (cached)
                require.cache[cmdPath] = cached;
            try {
                cmdPath = path_1.default.join(__dirname, groupId, `${memberName}.js`);
                cached = require.cache[cmdPath];
                delete require.cache[cmdPath];
                newCmd = require(cmdPath);
            }
            catch (err2) {
                // @ts-expect-error: cmdPath is actually declared
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
            throw new TypeError('Command info must be an Object.');
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
                if (!util_1.permissions[perm])
                    throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if ('userPermissions' in info) {
            if (!Array.isArray(info.userPermissions)) {
                throw new TypeError('Command userPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.userPermissions) {
                if (!util_1.permissions[perm])
                    throw new RangeError(`Invalid command userPermission: ${perm}`);
            }
        }
        if ('throttling' in info) {
            if (typeof info.throttling !== 'object')
                throw new TypeError('Command throttling must be an Object.');
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
        if ('argsPromptLimit' in info && info.argsPromptLimit < 0) {
            throw new RangeError('Command argsPromptLimit must be at least 0.');
        }
        if ('argsType' in info && !['single', 'multiple'].includes(info.argsType)) {
            throw new RangeError('Command argsType must be one of "single" or "multiple".');
        }
        if (info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
            throw new RangeError('Command argsCount must be at least 2.');
        }
        if ('patterns' in info && (!Array.isArray(info.patterns) || info.patterns.some(pat => !(pat instanceof RegExp)))) {
            throw new TypeError('Command patterns must be an Array of regular expressions.');
        }
        if (!!info.deprecated && typeof info.replacing !== 'string') {
            throw new TypeError('Command replacing must be a string.');
        }
        if (!!info.deprecated && info.replacing !== info.replacing.toLowerCase()) {
            throw new TypeError('Command replacing must be lowercase.');
        }
        if ('slash' in info && (typeof info.slash !== 'object' && typeof info.slash !== 'boolean')) {
            throw new TypeError('Command slash must be object or boolean.');
        }
        if (info.slash === true) {
            info.slash = {
                name: info.name,
                description: info.description
            };
        }
        if (typeof info.slash === 'object') {
            if (Object.keys(info.slash).length === 0)
                throw new TypeError('Command slash must not be an empty object.');
            for (const prop in info) {
                if (['slash', 'test'].includes(prop))
                    continue;
                // @ts-expect-error: no string index
                if (typeof info.slash[prop] !== 'undefined' && info.slash[prop] !== null)
                    continue;
                // @ts-expect-error: no string index
                info.slash[prop] = info[prop];
            }
            if ('name' in info.slash && typeof info.slash.name === 'string') {
                if (info.slash.name !== info.slash.name.toLowerCase()) {
                    throw new TypeError('Command slash name must be lowercase.');
                }
                if (info.slash.name.replace(/ +/g, '') !== info.slash.name) {
                    throw new TypeError('Command slash name must not include spaces.');
                }
            }
            if ('description' in info.slash) {
                if (typeof info.slash.description !== 'string') {
                    throw new TypeError('Command slash description must be a string.');
                }
                if (info.slash.description.length > 100) {
                    throw new TypeError('Command slash description length must be at most 100 characters long.');
                }
            }
            if ('options' in info.slash && (!Array.isArray(info.slash.options) || info.slash.options.some(op => typeof op !== 'object')))
                throw new TypeError('Command slash options must be an Array of objects.');
        }
    }
    /**
     * Parses the slash command information, so it's usable by the API
     * @param info - Info to parse
     */
    static parseSlash(info) {
        if (!Array.isArray(info) && info.name) {
            for (const prop in info) {
                if (['name', 'description', 'options'].includes(prop))
                    continue;
                // @ts-expect-error: no string index
                delete info[prop];
            }
            // @ts-expect-error: type is set as string in SlashCommandInfo, but as number in RestAPIApplicationCommand
            info.type = 1;
        }
        (Array.isArray(info) ? info : info.options)?.forEach(option => {
            // @ts-expect-error: type is set as string in SlashCommandInfo, but as number in RestAPIApplicationCommand
            if (typeof option.type === 'string')
                option.type = parseOptionType(option.type);
            for (const prop in option) {
                if (prop.toLowerCase() === prop)
                    continue;
                const toApply = prop.replace(/[A-Z]/g, '_$&').toLowerCase();
                // @ts-expect-error: no string index
                option[toApply] = option[prop];
                // @ts-expect-error: no string index
                delete option[prop];
                if (toApply === 'channel_types') {
                    // @ts-expect-error: no string index
                    for (let i = 0; i < option[toApply].length; i++) {
                        // @ts-expect-error: no string index
                        option[toApply][i] = parseChannelType(option[toApply][i]);
                    }
                }
            }
            if (option.options)
                this.parseSlash(option.options);
        });
        return info;
    }
}
exports.default = Command;
/**
 * Creates a basic embed.
 * @param text - The text to fill the embed with.
 * @param value - The value of the field.
 */
function embed(text, value) {
    const embed = new discord_js_1.MessageEmbed().setColor('RED');
    if (value)
        embed.addField(text, value);
    else
        embed.setDescription(text);
    return embed;
}
/**
 * Parses the type of the slash command option type into a valid value for the API.
 * @param type - The type to parse.
 */
function parseOptionType(type) {
    switch (type) {
        case 'subcommand': return 1;
        case 'subcommand-group': return 2;
        case 'string': return 3;
        case 'integer': return 4;
        case 'boolean': return 5;
        case 'user': return 6;
        case 'channel': return 7;
        case 'role': return 8;
        case 'mentionable': return 9;
        case 'number': return 10;
        default: throw new TypeError('Unable to parse SlashCommandOptionType.');
    }
}
/**
 * Parses the type of the slash command channel type into a valid value for the API.
 * @param type - The type to parse.
 */
function parseChannelType(type) {
    switch (type) {
        case 'guild-text': return 0;
        case 'guild-voice': return 2;
        case 'guild-category': return 4;
        case 'guild-news': return 5;
        case 'guild-news-thread': return 10;
        case 'guild-public-thread': return 11;
        case 'guild-private-thread': return 12;
        case 'guild-stage-voice': return 13;
        default: throw new TypeError('Unable to parse SlashCommandChannelType.');
    }
}
async function replyAll({ message, interaction }, options) {
    if (options instanceof discord_js_1.MessageEmbed)
        options = { embeds: [options] };
    if (typeof options === 'string')
        options = { content: options };
    if (interaction) {
        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply(options).catch(() => null);
        }
        // @ts-expect-error: MessageOptions "not compatible" (tested and works regardless)
        return await interaction.reply(options).catch(() => null);
    }
    if (message) {
        // @ts-expect-error: CommandoMessage not assignable to Message<boolean>
        return await message.reply({ ...options, ...(0, util_1.noReplyInDMs)(message) }).catch(() => null);
    }
    return null;
}
function isMod(roleOrMember) {
    if (!roleOrMember)
        return false;
    const { permissions } = roleOrMember;
    if (permissions.has('ADMINISTRATOR'))
        return true;
    const conditions = [
        'BAN_MEMBERS', 'DEAFEN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_EMOJIS_AND_STICKERS', 'MANAGE_GUILD',
        'MANAGE_MESSAGES', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_THREADS', 'MANAGE_WEBHOOKS', 'MOVE_MEMBERS',
        'MUTE_MEMBERS'
    ];
    const values = [];
    for (const condition of conditions) {
        values.push(permissions.has(condition));
    }
    return !!values.find(b => b === true);
}
//# sourceMappingURL=base.js.map