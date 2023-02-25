"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const base_1 = __importDefault(require("../commands/base"));
const friendly_1 = __importDefault(require("../errors/friendly"));
const command_format_1 = __importDefault(require("../errors/command-format"));
const util_1 = __importDefault(require("../util"));
const singleSmartQuote = /[\u2018\u2019]/g;
const doubleSmartQuote = /[“”]/g;
/** An extension of the base Discord.js Message class to add command-related functionality. */
// @ts-expect-error: Message's constructor is private
class CommandoMessage extends discord_js_1.Message {
    /** Whether the message contains a command (even an unknown one) */
    isCommand;
    /** Command that the message triggers, if any */
    command;
    /** Argument string for the command */
    argString;
    /** Pattern matches (if from a pattern trigger) */
    patternMatches;
    /** Response messages sent, mapped by channel ID (set by the dispatcher after running the command) */
    responses;
    /** Index of the current response that will be edited, mapped by channel ID */
    responsePositions;
    /**
     * @param client - The client the message is for
     * @param data - The message data
     */
    constructor(client, data) {
        super(client, messageToJSON(data));
        Object.assign(this, data);
        this.isCommand = false;
        this.command = null;
        this.argString = null;
        this.patternMatches = null;
        this.responses = new Map();
        this.responsePositions = new Map();
    }
    get member() {
        return super.member;
    }
    /** The guild this message was sent in */
    get guild() {
        return super.guild;
    }
    /** The channel this message was sent in */
    get channel() {
        return super.channel;
    }
    inGuild() {
        return super.inGuild();
    }
    /**
     * Initializes the message for a command
     * @param command - Command the message triggers
     * @param argString - Argument string for the command
     * @param patternMatches - Command pattern matches (if from a pattern trigger)
     * @return This message
     */
    initCommand(command, argString, patternMatches) {
        this.isCommand = true;
        this.command = command;
        this.argString = argString;
        this.patternMatches = patternMatches;
        return this;
    }
    /**
     * Creates a usage string for the message's command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the
     * prefixed command format
     * @param user - User to use for the mention command format
     */
    usage(argString, prefix, user = this.client.user) {
        const { guild, client, command } = this;
        prefix ??= guild?.prefix ?? client.prefix;
        if (!command)
            throw new TypeError('Command cannot be null or undefined');
        return command.usage(argString, prefix, user);
    }
    /**
     * Creates a usage string for any command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the
     * prefixed command format
     * @param user - User to use for the mention command format
     */
    anyUsage(command, prefix, user = this.client.user) {
        const { guild, client } = this;
        prefix ??= guild?.prefix ?? client.prefix;
        return base_1.default.usage(command, prefix, user);
    }
    /**
     * Parses the argString into usable arguments, based on the argsType and argsCount of the command
     * @see Command#run
     */
    parseArgs() {
        const { command, argString } = this;
        if (!command)
            throw new TypeError('Command cannot be null or undefined');
        const { argsType, argsSingleQuotes, argsCount } = command;
        switch (argsType) {
            case 'single':
                return (argString ?? '').trim().replace(argsSingleQuotes ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g, '$2');
            case 'multiple':
                return CommandoMessage.parseArgs(argString ?? '', argsCount, argsSingleQuotes);
            default:
                throw new RangeError(`Unknown argsType "${argsType}".`);
        }
    }
    /** Runs the command */
    async run() {
        const { guild, guildId, channel, channelId, author, client, command, patternMatches, argString } = this;
        if (!command)
            return null;
        const { groupId, memberName } = command;
        const { user: clientUser } = client;
        if (guild && !channel.isDMBased()) {
            const { members } = guild;
            // Obtain the member for the ClientUser if it doesn't already exist
            const me = members.me ?? await members.fetch(clientUser.id);
            // Checks if the client has permission to send messages
            const clientPerms = me.permissionsIn(channel).serialize();
            if (clientPerms && clientPerms.ViewChannel && !clientPerms.SendMessages) {
                return await this.direct((0, common_tags_1.stripIndent) `
                    It seems like I cannot **Send Messages** in this channel: ${channel.toString()}
                    Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
                `).catch(() => null);
            }
            // Make sure the command is usable in this context
            if (command.dmOnly) {
                client.emit('commandBlock', { message: this }, 'dmOnly');
                return await command.onBlock({ message: this }, 'dmOnly');
            }
        }
        // Make sure the command is usable in this context
        if ((command.guildOnly || command.guildOwnerOnly) && !guild) {
            client.emit('commandBlock', { message: this }, 'guildOnly');
            return await command.onBlock({ message: this }, 'guildOnly');
        }
        // Ensure the channel is a NSFW one if required
        if (command.nsfw && 'nsfw' in channel && !channel.nsfw) {
            client.emit('commandBlock', { message: this }, 'nsfw');
            return await command.onBlock({ message: this }, 'nsfw');
        }
        // Ensure the user has permission to use the command
        const hasPermission = command.hasPermission({ message: this });
        if (!channel.isDMBased() && hasPermission !== true) {
            if (typeof hasPermission === 'string') {
                client.emit('commandBlock', { message: this }, hasPermission);
                return await command.onBlock({ message: this }, hasPermission);
            }
            const data = { missing: hasPermission };
            client.emit('commandBlock', { message: this }, 'userPermissions', data);
            return await command.onBlock({ message: this }, 'userPermissions', data);
        }
        // Ensure the client user has the required permissions
        if (!channel.isDMBased() && command.clientPermissions) {
            const missing = channel.permissionsFor(clientUser)?.missing(command.clientPermissions) || [];
            if (missing.length > 0) {
                const data = { missing };
                client.emit('commandBlock', { message: this }, 'clientPermissions', data);
                return await command.onBlock({ message: this }, 'clientPermissions', data);
            }
        }
        // Throttle the command
        //@ts-expect-error: method throttle is protected 
        const throttle = command.throttle(author.id);
        if (throttle && command.throttling && throttle.usages + 1 > command.throttling.usages) {
            const remaining = (throttle.start + (command.throttling.duration * 1000) - Date.now()) / 1000;
            const data = { throttle, remaining };
            client.emit('commandBlock', { message: this }, 'throttling', data);
            return await command.onBlock({ message: this }, 'throttling', data);
        }
        if (command.deprecated) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Gold)
                .addFields([{
                    name: `The \`${command.name}\` command has been marked as deprecated.`,
                    value: `Please start using the \`${command.deprecatedReplacement}\` command from now on.`,
                }]);
            await this.replyEmbed(embed);
        }
        // Figure out the command arguments
        let args = patternMatches;
        let collResult = null;
        if (!args && command.argsCollector) {
            const collArgs = command.argsCollector.args;
            const count = collArgs[collArgs.length - 1].infinite ? Infinity : collArgs.length;
            const provided = CommandoMessage.parseArgs((argString ?? '').trim(), count, command.argsSingleQuotes);
            collResult = await command.argsCollector.obtain(this, provided);
            if (collResult.cancelled) {
                if (collResult.prompts.length === 0 || collResult.cancelled === 'promptLimit') {
                    const err = new command_format_1.default(this);
                    return this.reply({ content: err.message, ...util_1.default.noReplyPingInDMs(this) });
                }
                client.emit('commandCancel', command, collResult.cancelled, this, collResult);
                return this.reply({ content: 'Cancelled command.', ...util_1.default.noReplyPingInDMs(this) });
            }
            args = collResult.values;
        }
        args ??= this.parseArgs();
        const fromPattern = !!patternMatches;
        // Run the command
        if (throttle)
            throttle.usages++;
        try {
            const location = guildId ? `${guildId}:${channelId}` : `DM:${author.id}`;
            client.emit('debug', `Running message command "${groupId}:${memberName}" at "${location}".`);
            await channel.sendTyping().catch(() => null);
            const promise = command.run({ message: this }, args, fromPattern, collResult);
            client.emit('commandRun', command, promise, { message: this }, args, fromPattern, collResult);
            const retVal = await promise;
            const isValid = retVal instanceof discord_js_1.Message || Array.isArray(retVal) || util_1.default.isNullish(retVal);
            if (!isValid) {
                const retValType = retVal !== null ? (
                // @ts-expect-error: constructor does not exist in never
                retVal?.constructor ? retVal.constructor.name : typeof retVal) : null;
                throw new TypeError((0, common_tags_1.oneLine) `
                    Command ${command.name}'s run() resolved with an unknown type (${retValType}). Command run methods
                    must return a Promise that resolve with a Message, array of Messages, or null/undefined.
                `);
            }
            return retVal;
        }
        catch (err) {
            client.emit('commandError', command, err, { message: this }, args, fromPattern, collResult ?? undefined);
            if (err instanceof friendly_1.default) {
                return await this.reply(err.message);
            }
            return await command.onError(err, { message: this }, args, fromPattern, collResult);
        }
    }
    /**
     * Responds to the command message
     * @param options - Options for the response
     */
    respond(options = {}) {
        let { type = 'reply' } = options;
        const { content = '', options: msgOptions = {}, lang = '', fromEdit = false } = options;
        const { responses, channel, guild, client, author } = this;
        const shouldEdit = responses && !fromEdit;
        if (type === 'reply' && channel.isDMBased())
            type = 'plain';
        if (type !== 'direct') {
            if (guild && !channel.isDMBased() && !channel.permissionsFor(client.user)?.has('SendMessages')) {
                type = 'direct';
            }
        }
        if (content)
            msgOptions.content = resolveString(content);
        Object.assign(msgOptions, util_1.default.noReplyPingInDMs(this));
        switch (type) {
            case 'plain':
                if (!shouldEdit)
                    return channel.send(msgOptions);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options: msgOptions });
            case 'reply':
                if (!shouldEdit)
                    return this.reply(msgOptions);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options: msgOptions });
            case 'direct':
                if (!shouldEdit)
                    return author.send(msgOptions);
                return this.editCurrentResponse('DM', { type, options: msgOptions });
            case 'code':
                msgOptions.content = `\`\`\`${lang}\n${(0, discord_js_1.escapeMarkdown)(content, { codeBlockContent: true })}\n\`\`\``;
                if (!shouldEdit)
                    return channel.send(msgOptions);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options: msgOptions });
            default:
                throw new RangeError(`Unknown response type "${type}".`);
        }
    }
    /**
     * Edits a response to the command message
     * @param response - The response message(s) to edit
     * @param options - Options for the response
     */
    editResponse(response, options = {}) {
        const { type, options: msgOptions = {} } = options;
        if (!response)
            return this.respond({ type, options: msgOptions, fromEdit: true });
        if (Array.isArray(response)) {
            for (let i = response.length - 1; i > 0; i--)
                response[i]?.delete();
            return response[0].edit(msgOptions);
        }
        return response.edit(msgOptions);
    }
    /**
     * Edits the current response
     * @param id - The ID of the channel the response is in ("DM" for direct messages)
     * @param options - Options for the response
     */
    editCurrentResponse(id, options) {
        const { responses, responsePositions } = this;
        if (typeof responses.get(id) === 'undefined')
            responses.set(id, []);
        const responsePos = responsePositions.get(id);
        if (typeof responsePos === 'undefined')
            responsePositions.set(id, -1);
        let pos = responsePos ?? -1;
        this.responsePositions.set(id, ++pos);
        const response = this.responses.get(id);
        return this.editResponse(response?.[pos], options);
    }
    /**
     * Responds with a plain message
     * @param content - Content for the message
     * @param options - Options for the message
     */
    say(content, options) {
        let msgContent = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object')
            options = {};
        return this.respond({ type: 'plain', content: msgContent, options });
    }
    /**
     * Responds with a direct message
     * @param content - Content for the message
     * @param options - Options for the message
     */
    direct(content, options) {
        let msgContent = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object')
            options = {};
        return this.respond({ type: 'direct', content: msgContent, options });
    }
    /**
     * Responds with a code message
     * @param lang - Language for the code block
     * @param content - Content for the message
     * @param options - Options for the message
     */
    code(lang, content, options) {
        let msgContent = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object')
            options = {};
        return this.respond({ type: 'code', content: msgContent, lang, options });
    }
    /**
     * Responds with an embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    embed(embed, content = '', options) {
        let msgContent = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object')
            options = {};
        options.embeds = Array.isArray(embed) ? embed : [embed];
        return this.respond({ type: 'plain', content: msgContent, options });
    }
    /**
     * Responds with a reply + embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    replyEmbed(embed, content = '', options) {
        let msgContent = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object')
            options = {};
        options.embeds = Array.isArray(embed) ? embed : [embed];
        return this.respond({ type: 'reply', content: msgContent, options });
    }
    /**
     * Finalizes the command message by setting the responses and deleting any remaining prior ones
     * @param responses - Responses to the message
     */
    finalize(responses) {
        if (!responses)
            return;
        const { responsePositions, responses: _responses } = this;
        if (_responses)
            this.deleteRemainingResponses();
        _responses.clear();
        responsePositions.clear();
        if (Array.isArray(responses)) {
            for (const response of responses) {
                const firstResponse = Array.isArray(response) ? response[0] : response;
                if (!firstResponse)
                    continue;
                const { channel } = firstResponse;
                const id = channelIdOrDM(channel);
                let res = _responses.get(id);
                if (!res) {
                    res = [];
                    _responses.set(id, res);
                    responsePositions.set(id, -1);
                }
                res.push(response);
            }
            return;
        }
        const id = channelIdOrDM(responses.channel);
        _responses.set(id, [responses]);
        responsePositions.set(id, -1);
    }
    /** Deletes any prior responses that haven't been updated */
    deleteRemainingResponses() {
        const { responses: _responses, responsePositions } = this;
        for (const [id, responses] of _responses) {
            const pos = responsePositions.get(id);
            if (!pos)
                continue;
            for (let i = pos + 1; i < responses.length; i++) {
                const response = responses[i];
                if (Array.isArray(response)) {
                    for (const resp of response)
                        resp?.delete();
                    continue;
                }
                response?.delete();
            }
        }
    }
    /**
     * Parses an argument string into an array of arguments
     * @param argString - The argument string to parse
     * @param argCount - The number of arguments to extract from the string
     * @param allowSingleQuote - Whether or not single quotes should be allowed to wrap arguments, in addition to
     * double quotes
     * @return The array of arguments
     */
    static parseArgs(argString, argCount, allowSingleQuote = true) {
        const argStringModified = removeSmartQuotes(argString, allowSingleQuote);
        const regex = allowSingleQuote ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g : /\s*(?:(")([^]*?)"|(\S+))\s*/g;
        const result = [];
        let match = [];
        // Large enough to get all items
        argCount ||= argStringModified.length;
        // Get match and push the capture group that is not null to the result
        while (--argCount && (match = regex.exec(argStringModified)))
            result.push(match[2] || match[3]);
        // If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
        if (match && regex.lastIndex < argStringModified.length) {
            const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
            result.push(argStringModified.substring(regex.lastIndex, argStringModified.length).replace(re2, '$2'));
        }
        return result;
    }
}
exports.default = CommandoMessage;
function removeSmartQuotes(argString, allowSingleQuote = true) {
    let replacementArgString = argString;
    if (allowSingleQuote)
        replacementArgString = argString.replace(singleSmartQuote, '\'');
    return replacementArgString.replace(doubleSmartQuote, '"');
}
function channelIdOrDM(channel) {
    if (channel.isDMBased())
        return channel.id;
    return 'DM';
}
/**
 * Resolves a StringResolvable to a string.
 * @param data - The string resolvable to resolve
 */
function resolveString(data) {
    if (typeof data === 'string')
        return data;
    if ('content' in data && data.content)
        return data.content;
    return `${data}`;
}
function messageToJSON(data) {
    /* eslint-disable camelcase */
    return {
        attachments: [],
        author: data.author.toJSON(),
        channel_id: '',
        content: '',
        edited_timestamp: null,
        embeds: [],
        id: '',
        mention_everyone: false,
        mention_roles: [],
        mentions: [],
        pinned: false,
        timestamp: '',
        tts: false,
        type: data.type,
    };
    /* eslint-enable camelcase */
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0Fjb0I7QUFDcEIsNkNBQW1EO0FBQ25ELDREQUF1QztBQUN2QyxrRUFBK0M7QUFDL0MsOEVBQTBEO0FBQzFELG1EQUEyQjtBQW1DM0IsTUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztBQUMzQyxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztBQUVqQyw4RkFBOEY7QUFDOUYscURBQXFEO0FBQ3JELE1BQXFCLGVBQW1ELFNBQVEsb0JBQWdCO0lBRzVGLG1FQUFtRTtJQUM1RCxTQUFTLENBQVU7SUFDMUIsZ0RBQWdEO0lBQ3pDLE9BQU8sQ0FBaUI7SUFDL0Isc0NBQXNDO0lBQy9CLFNBQVMsQ0FBZ0I7SUFDaEMsa0RBQWtEO0lBQzNDLGNBQWMsQ0FBa0I7SUFDdkMscUdBQXFHO0lBQzlGLFNBQVMsQ0FBeUM7SUFDekQsOEVBQThFO0lBQ3ZFLGlCQUFpQixDQUFzQjtJQUU5Qzs7O09BR0c7SUFDSCxZQUFtQixNQUE0QixFQUFFLElBQTBCO1FBQ3ZFLEtBQUssQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3ZDLENB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