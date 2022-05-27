const path = require('path');
const { MessageEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const ArgumentCollector = require('./collector');
const { permissions, noReplyInDMs } = require('../util');

/** A command that can be run in a client */
class Command {
    /**
     * @typedef {Object} ThrottlingOptions
     * @property {number} usages - Maximum number of usages of the command allowed in the time frame.
     * @property {number} duration - Amount of time to count the usages of the command within (in seconds).
     */

    /**
     * @typedef {Object} CommandInfo
     * @property {string} name - The name of the command (must be lowercase)
     * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
     * @property {boolean} [autoAliases=true] - Whether automatic aliases should be added
     * @property {string} group - The ID of the group the command belongs to (must be lowercase)
     * @property {string} memberName - The member name of the command in the group (must be lowercase)
     * @property {string} description - A short description of the command
     * @property {string} [format] - The command usage format string - will be automatically generated if not specified,
     * and `args` is specified
     * @property {string} [details] - A detailed description of the command and its functionality
     * @property {string[]} [examples] - Usage examples of the command
     * @property {boolean} [guildOnly=false] - Whether or not the command should only function in a guild channel
     * @property {boolean} [ownerOnly=false] - Whether or not the command is usable only by an owner
     * @property {PermissionResolvable[]} [clientPermissions] - Permissions required by the client to use the command.
     * @property {PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
     * @property {boolean} [nsfw=false] - Whether the command is usable only in NSFW channels.
     * @property {ThrottlingOptions} [throttling] - Options for throttling usages of the command.
     * @property {boolean} [defaultHandling=true] - Whether or not the default command handling should be used.
     * If false, then only patterns will trigger the command.
     * @property {ArgumentInfo[]} [args] - Arguments for the command.
     * @property {number} [argsPromptLimit=Infinity] - Maximum number of times to prompt a user for a single argument.
     * Only applicable if `args` is specified.
     * @property {string} [argsType=single] - One of 'single' or 'multiple'. Only applicable if `args` is not specified.
     * When 'single', the entire argument string will be passed to run as one argument.
     * When 'multiple', it will be passed as multiple arguments.
     * @property {number} [argsCount=0] - The number of arguments to parse from the command string.
     * Only applicable when argsType is 'multiple'. If nonzero, it should be at least 2.
     * When this is 0, the command argument string will be split into as many arguments as it can be.
     * When nonzero, it will be split into a maximum of this number of arguments.
     * @property {boolean} [argsSingleQuotes=true] - Whether or not single quotes should be allowed to box-in arguments
     * in the command string.
     * @property {RegExp[]} [patterns] - Patterns to use for triggering the command
     * @property {boolean} [guarded=false] - Whether the command should be protected from disabling
     * @property {boolean} [hidden=false] - Whether the command should be hidden from the help command
     * @property {boolean} [unknown=false] - Whether the command should be run when an unknown command is used - there
     * may only be one command registered with this property as `true`.
     */

    /**
     * @param {CommandoClient} client - The client the command is for
     * @param {CommandInfo} info - The command information
     */
    constructor(client, info) {
        this.constructor.validateInfo(client, info);

        Object.defineProperty(this, 'client', { value: client });

        /**
         * Client that this command is for
         * @type {CommandoClient}
         * @readonly
         */
        this.client;

        /**
         * Name of this command
         * @type {string}
         */
        this.name = info.name;

        /**
         * Aliases for this command
         * @type {string[]}
         */
        this.aliases = info.aliases ?? [];
        if (info.autoAliases) {
            if (this.name.includes('-')) this.aliases.push(this.name.replace(/-/g, ''));
            for (const alias of this.aliases) {
                if (alias.includes('-')) this.aliases.push(alias.replace(/-/g, ''));
            }
        }

        /**
         * ID of the group the command belongs to
         * @type {string}
         */
        this.groupId = info.group;

        /**
         * The group the command belongs to, assigned upon registration
         * @type {?CommandGroup}
         */
        this.group = null;

        /**
         * Name of the command within the group
         * @type {string}
         * @default this.name
         */
        this.memberName = info.memberName ?? this.name;

        /**
         * Short description of the command
         * @type {string}
         */
        this.description = info.description;

        /**
         * Usage format string of the command
         * @type {?string}
         */
        this.format = info.format ?? null;

        /**
         * Long description of the command
         * @type {?string}
         */
        this.details = info.details ?? null;

        /**
         * Example usage strings
         * @type {?string[]}
         */
        this.examples = info.examples ?? null;

        /**
         * Whether the command can only be run in direct messages
         * @type {boolean}
         * @default false
         */
        this.dmOnly = !!info.dmOnly;

        /**
         * Whether the command can only be run in a guild channel
         * @type {boolean}
         * @default false
         */
        this.guildOnly = !!info.guildOnly;

        /**
         * Whether the command can only be used by a server owner
         * @type {boolean}
         * @default false
         */
        this.guildOwnerOnly = !!info.guildOwnerOnly;

        /**
         * Whether the command can only be used by an owner
         * @type {boolean}
         * @default false
         */
        this.ownerOnly = !!info.ownerOnly;

        /**
         * Permissions required by the client to use the command.
         * @type {?PermissionResolvable[]}
         */
        this.clientPermissions = info.clientPermissions ?? null;

        /**
         * Permissions required by the user to use the command.
         * @type {?PermissionResolvable[]}
         */
        this.userPermissions = info.userPermissions ?? null;

        /**
         * Whether this command's user permissions are based on "moderator" permissions
         * @type {boolean}
         * @default false
         */
        this.modPermissions = !!info.modPermissions;

        /**
         * Whether the command can only be used in NSFW channels
         * @type {boolean}
         * @default false
         */
        this.nsfw = !!info.nsfw;

        /**
         * Whether the default command handling is enabled for the command
         * @type {boolean}
         * @default true
         */
        this.defaultHandling = info.defaultHandling ?? true;

        /**
         * Options for throttling command usages
         * @type {?ThrottlingOptions}
         */
        this.throttling = info.throttling ?? null;

        /**
         * The argument collector for the command
         * @type {?ArgumentCollector}
         */
        this.argsCollector = info.args?.length ?
            new ArgumentCollector(client, info.args, info.argsPromptLimit) :
            null;
        if (this.argsCollector && !info.format) {
            this.format = this.argsCollector.args.reduce((prev, arg) => {
                const wrapL = arg.required ? '[' : '<';
                const wrapR = arg.required ? ']' : '>';
                return `${prev}${prev ? ' ' : ''}${wrapL}${arg.label}${arg.infinite ? '...' : ''}${wrapR}`;
            }, '');
        }

        /**
         * How the arguments are split when passed to the command's run method
         * @type {string}
         * @default 'single'
         */
        this.argsType = info.argsType ?? 'single';

        /**
         * Maximum number of arguments that will be split
         * @type {number}
         * @default 0
         */
        this.argsCount = info.argsCount ?? 0;

        /**
         * Whether single quotes are allowed to encapsulate an argument
         * @type {boolean}
         * @default true
         */
        this.argsSingleQuotes = info.argsSingleQuotes ?? true;

        /**
         * Regular expression triggers
         * @type {?RegExp[]}
         */
        this.patterns = info.patterns ?? null;

        /**
         * Whether the command is protected from being disabled
         * @type {boolean}
         * @default false
         */
        this.guarded = !!info.guarded;

        /**
         * Whether the command should be hidden from the help command
         * @type {boolean}
         * @default false
         */
        this.hidden = !!info.hidden;

        /**
         * Whether the command will be run when an unknown command is used
         * @type {boolean}
         * @default false
         */
        this.unknown = !!info.unknown;

        /**
         * Whether the command is marked as deprecated
         * @type {boolean}
         * @default false
         */
        this.deprecated = !!info.deprecated;

        /**
         * The name or alias of the command that is replacing the deprecated command.
         * Required if `deprecated` is `true`.
         * @type {?string}
         */
        this.replacing = info.replacing ?? null;

        /**
         * Whether this command will be registered in the test guild only or not
         * @type {boolean}
         * @default false
         */
        this.test = !!info.test;

        /**
         * The data for the slash command
         * @type {SlashCommandInfo}
         * @default false
         */
        this.slash = info.slash ?? false;

        /**
         * Whether the command is enabled globally
         * @type {boolean}
         * @private
         */
        this._globalEnabled = true;

        /**
         * The slash command data to send to the API
         * @type {?RESTPostAPIChatInputApplicationCommandsJSONBody}
         * @private
         */
        this._slashToAPI = this.slash ? this.constructor.parseSlash(JSON.parse(JSON.stringify(this.slash))) : null;

        /**
         * Current throttle objects for the command, mapped by user ID
         * @type {Map<string, Throttle>}
         * @private
         */
        this._throttles = new Map();
    }

    /**
     * Checks whether the user has permission to use the command
     * @param {CommandInstances} instances The triggering command instances
     * @param {boolean} [ownerOverride=true] - Whether the bot owner(s) will always have permission
     * @return {boolean|string} Whether the user has permission, or an error message to respond with if they don't
     */
    hasPermission({ message, interaction }, ownerOverride = true) {
        const { guildOwnerOnly, ownerOnly, userPermissions, modPermissions, client } = this;
        const { channel, guild, member } = message || interaction;
        const author = message?.author || interaction.user;

        if (!guildOwnerOnly && !ownerOnly && !userPermissions && !modPermissions) return true;
        if (ownerOverride && client.isOwner(author)) return true;

        if (ownerOnly && !client.isOwner(author)) {
            return 'ownerOnly';
        }

        if (guildOwnerOnly && guild?.ownerId !== author.id) {
            return 'guildOwnerOnly';
        }

        if (channel.type !== 'DM') {
            if (modPermissions && !isMod(member)) {
                return 'modPermissions';
            }
            if (userPermissions) {
                const missing = channel.permissionsFor(author).missing(userPermissions, false);
                if (missing.length > 0) return missing;
            }
        }

        return true;
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message - The message the command is being run for
     * @param {Object|string|string[]} args - The arguments for the command, or the matches from a pattern.
     * If args is specified on the command, this will be the argument values object. If argsType is single, then only
     * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
     * matches array from the pattern match
     * (see [RegExp#exec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)).
     * @param {boolean} fromPattern - Whether or not the command is being run from a pattern match
     * @param {?ArgumentCollectorResult} result - Result from obtaining the arguments from the collector (if applicable)
     * @return {Promise<?Message|?Array<Message>>}
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    async run(message, args, fromPattern, result) {
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }

    /**
     * Called when the command is prevented from running
     * @param {CommandInstances} instances - The instances the command is being run for
     * @param {CommandBlockReason} reason - Reason that the command was blocked
     * @param {CommandBlockData} [data={}] - Additional data associated with the block. Built-in reason data properties:
     * - guildOnly: none
     * - nsfw: none
     * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
     * - userPermissions & clientPermissions: `missing` ({@link Array}<{@link string}>) permission names
     */
    onBlock({ message, interaction }, reason, data = {}) {
        const { name } = this;
        const { missing, remaining } = data;

        switch (reason) {
            case 'dmOnly':
                return replyAll({ message, interaction }, embed(
                    `The \`${name}\` command can only be used in direct messages.`
                ));
            case 'guildOnly':
                return replyAll({ message, interaction }, embed(
                    `The \`${name}\` command can only be used in a server channel.`
                ));
            case 'guildOwnerOnly':
                return replyAll({ message, interaction }, embed(
                    `The \`${name}\` command can only be used by the server's owner.`
                ));
            case 'nsfw':
                return replyAll({ message, interaction }, embed(
                    `The \`${name}\` command can only be used in a NSFW channel.`
                ));
            case 'ownerOnly':
                return replyAll({ message, interaction }, embed(
                    `The \`${name}\` command can only be used by the bot's owner.`
                ));
            case 'userPermissions':
                return replyAll({ message, interaction }, embed(
                    'You are missing the following permissions:',
                    missing.map(perm => `\`${permissions[perm]}\``).join(', ')
                ));
            case 'modPermissions':
                return replyAll({ message, interaction }, embed(
                    `The \`${name}\` command can only be used by "moderators".`,
                    'For more information visit the `page 3` of the `help` command.'
                ));
            case 'clientPermissions':
                return replyAll({ message, interaction }, embed(
                    'The bot is missing the following permissions:',
                    missing.map(perm => `\`${permissions[perm]}\``).join(', ')
                ));
            case 'throttling':
                return replyAll({ message, interaction }, embed(
                    `Please wait **${remaining.toFixed(1)} seconds** before using the \`${name}\` command again.`
                ));
        }
    }

    /**
     * Called when the command produces an error while running
     * @param {Error} err - Error that was thrown
     * @param {CommandInstances} instances - The instances the command is being run for
     * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
     * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
     * @param {?ArgumentCollectorResult} result - Result from obtaining the arguments from the collector
     * (if applicable - see {@link Command#run})
     * @returns {Promise<?Message|?Message[]>}
     */
    // eslint-disable-next-line no-unused-vars
    onError(err, { message, interaction }, args, fromPattern, result) {
        return;
        // eslint-disable-next-line no-unreachable
        const owner = message.client.owners[0];
        const { serverInvite } = message.client.options;
        const emoji = '<:cross:802617654442852394>';

        const reply = new MessageEmbed()
            .setColor('RED')
            .setDescription(stripIndent`
                ${emoji} **An unexpected error happened**
                Please contact ${owner.toString()} (${owner.tag}), or join the [support server](${serverInvite}).
            `)
            .addField(err.name, '```' + err.message + '```');

        message.replyEmbed(reply);
    }

    /**
     * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
     * @param {string} userId - ID of the user to throttle for
     * @return {?Object}
     * @protected
     */
    throttle(userId) {
        const { throttling, _throttles, client } = this;
        if (!throttling || client.isOwner(userId)) return null;

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
     * @param {?GuildResolvable} guild - Guild to enable/disable the command in
     * @param {boolean} enabled - Whether the command should be enabled or disabled
     */
    setEnabledIn(guild, enabled) {
        const { client, guarded } = this;
        if (typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        if (guarded) throw new Error('The command is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            client.emit('commandStatusChange', null, this, enabled);
            return;
        }
        guild = client.guilds.resolve(guild);
        guild.setCommandEnabled(this, enabled);
    }

    /**
     * Checks if the command is enabled in a guild
     * @param {?GuildResolvable} guild - Guild to check in
     * @param {boolean} [bypassGroup] - Whether to bypass checking the group's status
     * @return {boolean}
     */
    isEnabledIn(guild, bypassGroup) {
        const { client, group } = this;
        if (this.guarded) return true;
        if (!guild) return group._globalEnabled && this._globalEnabled;
        guild = client.guilds.resolve(guild);
        return (bypassGroup || guild.isGroupEnabled(group)) && guild.isCommandEnabled(this);
    }

    /**
     * Checks if the command is usable for a message
     * @param {?CommandInstances} instances - The instances
     * @return {boolean}
     */
    isUsable({ message, interaction } = {}) {
        if (!message && !interaction) return this._globalEnabled;
        const { guild } = message || interaction;
        if (this.guildOnly && !guild) return false;
        const hasPermission = this.hasPermission({ message, interaction });
        return this.isEnabledIn(guild) && hasPermission === true;
    }

    /**
     * Creates a usage string for the command
     * @param {string} [argString] - A string of arguments for the command
     * @param {string} [prefix=this.client.commandPrefix] - Prefix to use for the prefixed command format
     * @param {User} [user=this.client.user] - User to use for the mention command format
     * @return {string}
     */
    usage(argString, prefix = this.client.commandPrefix, user = this.client.user) {
        return this.constructor.usage(`${this.name}${argString ? ` ${argString}` : ''}`, prefix, user);
    }

    /** Reloads the command */
    reload() {
        const { client, groupId, memberName } = this;
        const { registry } = client;

        let cmdPath, cached, newCmd;
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
                if (err2.message.includes('Cannot find module')) {
                    throw err;
                } else {
                    throw err2;
                }
            }
        }

        registry.reregisterCommand(newCmd, this);
    }

    /** Unloads the command */
    unload() {
        const { client, groupId, memberName } = this;
        const { registry } = client;

        const cmdPath = registry.resolveCommandPath(groupId, memberName);
        if (!require.cache[cmdPath]) throw new Error('Command cannot be unloaded.');
        delete require.cache[cmdPath];
        registry.unregisterCommand(this);
    }

    /**
     * Creates a usage string for a command
     * @param {string} command - A command + arg string
     * @param {string} [prefix] - Prefix to use for the prefixed command format
     * @param {User} [user] - User to use for the mention command format
     * @return {string}
     */
    static usage(command, prefix = null, user = null) {
        const nbcmd = command.replace(/ /g, '\xa0');
        if (!prefix && !user) return `\`${nbcmd}\``;

        let prefixPart;
        if (prefix) {
            if (prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' ';
            prefix = prefix.replace(/ /g, '\xa0');
            prefixPart = `\`${prefix}${nbcmd}\``;
        }

        let mentionPart;
        if (user) mentionPart = `\`@${user.tag.replace(/ /g, '\xa0')}\xa0${nbcmd}\``;

        return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`;
    }

    /**
     * Validates the constructor parameters
     * @param {CommandoClient} client - Client to validate
     * @param {CommandInfo} info - Info to validate
     * @private
     */
    static validateInfo(client, info) {
        if (!client) throw new Error('A client must be specified.');
        if (typeof info !== 'object') throw new TypeError('Command info must be an Object.');
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
                if (!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if ('userPermissions' in info) {
            if (!Array.isArray(info.userPermissions)) {
                throw new TypeError('Command userPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.userPermissions) {
                if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
            }
        }
        if ('throttling' in info) {
            if (typeof info.throttling !== 'object') throw new TypeError('Command throttling must be an Object.');
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
            if (Object.keys(info.slash).length === 0) throw new TypeError('Command slash must not be an empty object.');
            for (const prop in info) {
                if (['slash', 'test'].includes(prop)) continue;
                if (typeof info.slash[prop] !== 'undefined' && info.slash[prop] !== null) continue;
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
            if ('options' in info.slash && (
                !Array.isArray(info.slash.options) || info.slash.options.some(op => typeof op !== 'object')
            )) throw new TypeError('Command slash options must be an Array of objects.');
        }
    }

    /**
     * Parses the slash command information, so it's usable by the API
     * @param {SlashCommandInfo|SlashCommandOptionInfo[]} info Info to parse
     * @private
     */
    static parseSlash(info) {
        if (!Array.isArray(info) && info.name) {
            for (const prop in info) {
                if (['name', 'description', 'options'].includes(prop)) continue;
                delete info[prop];
            }
            info.type = 1;
        }
        (Array.isArray(info) ? info : info.options)?.forEach(option => {
            if (typeof option.type === 'string') option.type = parseOptionType(option.type);
            for (const prop in option) {
                if (prop.toLowerCase() === prop) continue;
                const toApply = prop.replace(/[A-Z]/g, '_$&').toLowerCase();
                option[toApply] = option[prop];
                delete option[prop];
                if (toApply === 'channel_types') {
                    for (let i = 0; i < option[toApply].length; i++) {
                        option[toApply][i] = parseChannelType(option[toApply][i]);
                    }
                }
            }
            if (option.options) this.parseSlash(option.options);
        });
        return info;
    }
}

module.exports = Command;

/**
 * Creates a basic embed.
 * @param {string} text The text to fill the embed with.
 * @param {string} [value] The value of the field.
 * @returns {MessageEmbed}
 */
function embed(text, value) {
    const embed = new MessageEmbed().setColor('RED');

    if (value) embed.addField(text, value);
    else embed.setDescription(text);

    return embed;
}

/**
 * Parses the type of the slash command option type into a valid value for the API.
 * @param {SlashCommandOptionType} type The type to parse.
 * @returns {?number}
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
 * @param {SlashCommandChannelType} type The type to parse.
 * @returns {?number}
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
    if (options instanceof MessageEmbed) options = { embeds: [options] };
    if (typeof options === 'string') options = { content: options };
    if (interaction) {
        if (interaction.deferred || interaction.replied) return await interaction.editReply(options).catch(() => null);
        else return await interaction.reply(options).catch(() => null);
    }
    if (message) {
        return await message.reply({ ...options, ...noReplyInDMs(message) }).catch(() => null);
    }
    return null;
}

function isMod(roleOrMember) {
    if (!roleOrMember) return false;
    const { permissions } = roleOrMember;
    if (permissions.has('ADMINISTRATOR')) return true;

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
