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
    isInteraction() {
        return false;
    }
    isMessage() {
        return true;
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
     * @see {@link Command.run Command#run}
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
                client.emit('commandBlock', this, 'dmOnly');
                return await command.onBlock(this, 'dmOnly');
            }
        }
        // Make sure the command is usable in this context
        if ((command.guildOnly || command.guildOwnerOnly) && !guild) {
            client.emit('commandBlock', this, 'guildOnly');
            return await command.onBlock(this, 'guildOnly');
        }
        // Ensure the channel is a NSFW one if required
        if (command.nsfw && 'nsfw' in channel && !channel.nsfw) {
            client.emit('commandBlock', this, 'nsfw');
            return await command.onBlock(this, 'nsfw');
        }
        // Ensure the user has permission to use the command
        const hasPermission = command.hasPermission(this);
        if (!channel.isDMBased() && hasPermission !== true) {
            if (typeof hasPermission === 'string') {
                client.emit('commandBlock', this, hasPermission);
                return await command.onBlock(this, hasPermission);
            }
            const data = { missing: hasPermission };
            client.emit('commandBlock', this, 'userPermissions', data);
            return await command.onBlock(this, 'userPermissions', data);
        }
        // Ensure the client user has the required permissions
        if (!channel.isDMBased() && command.clientPermissions) {
            const missing = channel.permissionsFor(clientUser)?.missing(command.clientPermissions) || [];
            if (missing.length > 0) {
                const data = { missing };
                client.emit('commandBlock', this, 'clientPermissions', data);
                return await command.onBlock(this, 'clientPermissions', data);
            }
        }
        // Throttle the command
        //@ts-expect-error: method throttle is protected 
        const throttle = command.throttle(author.id);
        if (throttle && command.throttling && throttle.usages + 1 > command.throttling.usages) {
            const remaining = (throttle.start + (command.throttling.duration * 1000) - Date.now()) / 1000;
            const data = { throttle, remaining };
            client.emit('commandBlock', this, 'throttling', data);
            return await command.onBlock(this, 'throttling', data);
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
            const promise = command.run(this, args, fromPattern, collResult);
            client.emit('commandRun', command, promise, this, args, fromPattern, collResult);
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
            client.emit('commandError', command, err, this, args, fromPattern, collResult ?? undefined);
            if (err instanceof friendly_1.default) {
                return await this.reply(err.message);
            }
            return await command.onError(err, this, args, fromPattern, collResult);
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
                if (!Array.isArray(response)) {
                    response?.delete();
                    continue;
                }
                for (const resp of response)
                    resp?.delete();
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
        channel_id: data.channelId,
        content: data.content,
        edited_timestamp: null,
        embeds: [],
        id: data.id,
        mention_everyone: data.mentions.everyone,
        mention_roles: [],
        mentions: [],
        pinned: data.pinned,
        timestamp: data.createdTimestamp.toString(),
        tts: data.tts,
        type: data.type,
    };
    /* eslint-enable camelcase */
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FZb0I7QUFDcEIsNkNBQW1EO0FBQ25ELDREQUF1QztBQUN2QyxrRUFBK0M7QUFDL0MsOEVBQTBEO0FBQzFELG1EQUEyQjtBQXFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztBQUMzQyxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztBQUVqQyw4RkFBOEY7QUFDOUYscURBQXFEO0FBQ3JELE1BQXFCLGVBQW1ELFNBQVEsb0JBQWdCO0lBRzVGLG1FQUFtRTtJQUM1RCxTQUFTLENBQVU7SUFDMUIsZ0RBQWdEO0lBQ3pDLE9BQU8sQ0FBaUI7SUFDL0Isc0NBQXNDO0lBQy9CLFNBQVMsQ0FBZ0I7SUFDaEMsa0RBQWtEO0lBQzNDLGNBQWMsQ0FBa0I7SUFDdkMscUdBQXFHO0lBQzlGLFNBQVMsQ0FBeUM7SUFDekQsOEVBQThFO0lBQ3ZFLGlCQUFpQixDQUFzQjtJQUU5Qzs7O09BR0c7SUFDSCxZQUFtQixNQUE0QixFQUFFLElBQTBCO1FBQ3ZFLEtBQUssQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3ZDLENB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