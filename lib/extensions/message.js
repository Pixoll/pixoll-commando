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
    // @ts-expect-error: This is meant to override Message's member getter.
    get member() {
        return super.member;
    }
    /** The guild this message was sent in */
    // @ts-expect-error: This is meant to override guild's member getter.
    get guild() {
        // @ts-expect-error: CommandoGuild extends Guild
        return super.guild;
    }
    /** The channel this message was sent in */
    // @ts-expect-error: This is meant to override channel's member getter.
    get channel() {
        // @ts-expect-error: CommandContextChannel extends ContextChannel
        return super.channel;
    }
    // @ts-expect-error: This is meant to override the inGuild method type.
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
        const { user: clientUser } = client;
        if (!command)
            return null;
        if (guild && !channel.isDMBased()) {
            const { members } = guild;
            // Obtain the member for the ClientUser if it doesn't already exist
            const me = members.me ?? await members.fetch(clientUser.id);
            // Checks if the client has permission to send messages
            const clientPerms = me.permissionsIn(channel.id).serialize();
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
            const data = { missing: hasPermission || undefined };
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
            client.emit('debug', `Running message command "${command.toString()}" at "${location}".`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FZb0I7QUFDcEIsNkNBQW1EO0FBQ25ELDREQUF1QztBQUN2QyxrRUFBK0M7QUFDL0MsOEVBQTBEO0FBQzFELG1EQUEyQjtBQTBDM0IsTUFBTSxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQztBQUMzQyxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztBQUVqQyw4RkFBOEY7QUFDOUYscURBQXFEO0FBQ3JELE1BQXFCLGVBQW1ELFNBQVEsb0JBQWdCO0lBRzVGLG1FQUFtRTtJQUM1RCxTQUFTLENBQVU7SUFDMUIsZ0RBQWdEO0lBQ3pDLE9BQU8sQ0FBaUI7SUFDL0Isc0NBQXNDO0lBQy9CLFNBQVMsQ0FBZ0I7SUFDaEMsa0RBQWtEO0lBQzNDLGNBQWMsQ0FBa0I7SUFDdkMscUdBQXFHO0lBQzlGLFNBQVMsQ0FBeUM7SUFDekQsOEVBQThFO0lBQ3ZFLGlCQUFpQixDQUFzQjtJQUU5Qzs7O09BR0c7SUFDSCxZQUFtQixNQUE0QixFQUFFLElBQTBCO1FBQ3ZFLEtBQUssQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3ZDLENB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