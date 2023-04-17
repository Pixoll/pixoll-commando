"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    /** Checks if the {@link CommandContext} is an interaction. */
    isInteraction() {
        return false;
    }
    /** Checks if the {@link CommandContext} is a message. */
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
        const throttle = command['throttle'](author.id);
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
                // @ts-expect-error: is should never happen as the linter says
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0Fhb0I7QUFDcEIsNkNBQW1EO0FBQ25ELDZEQUE2RDtBQUM3RCw0REFBMkQ7QUFDM0Qsa0VBQStDO0FBQy9DLDhFQUEwRDtBQUMxRCxtREFBMkI7QUErQzNCLE1BQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7QUFDM0MsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7QUFFakMsOEZBQThGO0FBQzlGLHFEQUFxRDtBQUNyRCxNQUFxQixlQUFtRCxTQUFRLG9CQUFnQjtJQUc1RixtRUFBbUU7SUFDNUQsU0FBUyxDQUFVO0lBQzFCLGdEQUFnRDtJQUN6QyxPQUFPLENBQWlCO0lBQy9CLHNDQUFzQztJQUMvQixTQUFTLENBQWdCO0lBQ2hDLGtEQUFrRDtJQUMzQyxjQUFjLENBQWtCO0lBQ3ZDLHFHQUFxRztJQUM5RixTQUFTLENBQXlDO0lBQ3pELDhFQUE4RTtJQUN2RSxpQkFBaUIsQ0FBc0I7SUFFOUM7OztPQUdHO0lBQ0gsWUFBbUIsTUFBNEIsRUFBRSxJQUEwQjtRQUN2RSxLQUFLLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUs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