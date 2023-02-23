import {
    Message,
    EmbedBuilder,
    User,
    MessageCreateOptions,
    TextBasedChannel,
    escapeMarkdown,
    Colors,
    MessageReplyOptions,
    If,
    GuildTextBasedChannel,
    StageChannel,
    APIMessage,
    APIUser,
} from 'discord.js';
import { oneLine, stripIndent } from 'common-tags';
import Command from '../commands/base';
import FriendlyError from '../errors/friendly';
import CommandFormatError from '../errors/command-format';
import Util from '../util';
import CommandoClient from '../client';
import CommandoGuild from './guild';
import { CommandoGuildMember, CommandoifiedMessage } from '../discord.overrides';

/** Type of the response */
type ResponseType =
    | 'code'
    | 'direct'
    | 'plain'
    | 'reply';

type StringResolvable =
    | MessageCreateOptions
    | string;

interface ResponseOptions {
    /** Type of the response */
    type?: ResponseType;
    /** Content of the response */
    content?: StringResolvable | null;
    /** Options of the response */
    options?: MessageCreateOptions;
    /** Language of the response, if its type is `code` */
    lang?: string;
    /** If the response is from an edited message */
    fromEdit?: boolean;
}

export type CommandoMessageResponse<InGuild extends boolean = boolean> =
    | Array<Message<InGuild>>
    | CommandoMessage<InGuild>
    | Message<InGuild>
    | null;

const singleSmartQuote = /[\u2018\u2019]/g;
const doubleSmartQuote = /[“”]/g;

/** An extension of the base Discord.js Message class to add command-related functionality. */
// @ts-expect-error: Message's constructor is private
export default class CommandoMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
    /** The client the message is for */
    declare public readonly client: CommandoClient<true>;
    /** Whether the message contains a command (even an unknown one) */
    public isCommand: boolean;
    /** Command that the message triggers, if any */
    public command: Command | null;
    /** Argument string for the command */
    public argString: string | null;
    /** Pattern matches (if from a pattern trigger) */
    public patternMatches: string[] | null;
    /** Response messages sent, mapped by channel ID (set by the dispatcher after running the command) */
    public responses: Map<string, CommandoMessageResponse[]>;
    /** Index of the current response that will be edited, mapped by channel ID */
    public responsePositions: Map<string, number>;

    /**
     * @param client - The client the message is for
     * @param data - The message data
     */
    public constructor(client: CommandoClient<true>, data: CommandoifiedMessage) {
        super(client, messageToJSON(data));
        Object.assign(this, data);

        this.isCommand = false;
        this.command = null;
        this.argString = null;
        this.patternMatches = null;
        this.responses = new Map();
        this.responsePositions = new Map();
    }

    public get member(): CommandoGuildMember | null {
        return super.member as CommandoGuildMember | null;
    }

    /** The guild this message was sent in */
    public get guild(): If<InGuild, CommandoGuild> {
        return super.guild as If<InGuild, CommandoGuild>;
    }

    /** The channel this message was sent in */
    public get channel(): Exclude<If<InGuild, GuildTextBasedChannel, TextBasedChannel>, StageChannel> {
        return super.channel as Exclude<If<InGuild, GuildTextBasedChannel, TextBasedChannel>, StageChannel>;
    }

    public inGuild(): this is CommandoMessage<true> {
        return super.inGuild();
    }

    /**
     * Initializes the message for a command
     * @param command - Command the message triggers
     * @param argString - Argument string for the command
     * @param patternMatches - Command pattern matches (if from a pattern trigger)
     * @return This message
     */
    protected initCommand(command: Command | null, argString: string | null, patternMatches: string[] | null): this {
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
    public usage(argString?: string, prefix?: string | null, user: User | null = this.client.user): string {
        const { guild, client, command } = this;
        prefix ??= guild?.prefix ?? client.prefix;
        if (!command) throw new TypeError('Command cannot be null or undefined');
        return command.usage(argString, prefix, user);
    }

    /**
     * Creates a usage string for any command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the
     * prefixed command format
     * @param user - User to use for the mention command format
     */
    public anyUsage(command: string, prefix?: string | null, user: User | null = this.client.user): string {
        const { guild, client } = this;
        prefix ??= guild?.prefix ?? client.prefix;
        return Command.usage(command, prefix, user);
    }

    /**
     * Parses the argString into usable arguments, based on the argsType and argsCount of the command
     * @see Command#run
     */
    public parseArgs(): string[] | string {
        const { command, argString } = this;
        if (!command) throw new TypeError('Command cannot be null or undefined');

        const { argsType, argsSingleQuotes, argsCount } = command;
        switch (argsType) {
            case 'single':
                return (argString ?? '').trim().replace(
                    argsSingleQuotes ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g, '$2'
                );
            case 'multiple':
                return CommandoMessage.parseArgs(argString ?? '', argsCount, argsSingleQuotes);
            default:
                throw new RangeError(`Unknown argsType "${argsType}".`);
        }
    }

    /** Runs the command */
    public async run(): Promise<CommandoMessageResponse> {
        const { guild, guildId, channel, channelId, author, client, command, patternMatches, argString } = this;
        if (!command) return null;

        const { groupId, memberName } = command;
        const { user: clientUser } = client;

        if (guild && !channel.isDMBased()) {
            const { members } = guild;

            // Obtain the member for the ClientUser if it doesn't already exist
            const me = members.me ?? await members.fetch(clientUser.id);

            // Checks if the client has permission to send messages
            const clientPerms = me.permissionsIn(channel).serialize();
            if (clientPerms && clientPerms.ViewChannel && !clientPerms.SendMessages) {
                return await this.direct(stripIndent`
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
            const embed = new EmbedBuilder()
                .setColor(Colors.Gold)
                .addFields([{
                    name: `The \`${command.name}\` command has been marked as deprecated.`,
                    value: `Please start using the \`${command.deprecatedReplacement}\` command from now on.`,
                }]);

            await this.replyEmbed(embed);
        }

        // Figure out the command arguments
        let args: Record<string, unknown> | string[] | string | null = patternMatches;
        let collResult = null;
        if (!args && command.argsCollector) {
            const collArgs = command.argsCollector.args;
            const count = collArgs[collArgs.length - 1].infinite ? Infinity : collArgs.length;
            const provided = CommandoMessage.parseArgs((argString ?? '').trim(), count, command.argsSingleQuotes);

            collResult = await command.argsCollector.obtain(this, provided);
            if (collResult.cancelled) {
                if (collResult.prompts.length === 0 || collResult.cancelled === 'promptLimit') {
                    const err = new CommandFormatError(this);
                    return this.reply({ content: err.message, ...Util.noReplyPingInDMs(this) });
                }

                client.emit('commandCancel', command, collResult.cancelled, this, collResult);
                return this.reply({ content: 'Cancelled command.', ...Util.noReplyPingInDMs(this) });
            }
            args = collResult.values;
        }
        args ??= this.parseArgs();
        const fromPattern = !!patternMatches;

        // Run the command
        if (throttle) throttle.usages++;
        try {
            const location = guildId ? `${guildId}:${channelId}` : `DM:${author.id}`;
            client.emit('debug', `Running message command "${groupId}:${memberName}" at "${location}".`);
            await channel.sendTyping().catch(() => null);
            const promise = command.run({ message: this }, args, fromPattern, collResult);

            client.emit('commandRun', command, promise, { message: this }, args, fromPattern, collResult);
            const retVal = await promise as CommandoMessageResponse;
            const isValid = retVal instanceof Message || Array.isArray(retVal) || Util.isNullish(retVal);
            if (!isValid) {
                const retValType = retVal !== null ? (
                    // @ts-expect-error: constructor does not exist in never
                    retVal?.constructor ? retVal.constructor.name : typeof retVal
                ) : null;
                throw new TypeError(oneLine`
                    Command ${command.name}'s run() resolved with an unknown type (${retValType}). Command run methods
                    must return a Promise that resolve with a Message, array of Messages, or null/undefined.
                `);
            }

            return retVal;
        } catch (err) {
            client.emit(
                'commandError', command, err as Error, { message: this }, args, fromPattern, collResult ?? undefined
            );
            if (err instanceof FriendlyError) {
                return await this.reply(err.message);
            }
            return await command.onError(err as Error, { message: this }, args, fromPattern, collResult);
        }
    }

    /**
     * Responds to the command message
     * @param options - Options for the response
     */
    protected respond(options: ResponseOptions = {}): Promise<CommandoMessageResponse> {
        let { type = 'reply' } = options;
        const { content = '', options: msgOptions = {}, lang = '', fromEdit = false } = options;
        const { responses, channel, guild, client, author } = this;
        const shouldEdit = responses && !fromEdit;

        if (type === 'reply' && channel.isDMBased()) type = 'plain';
        if (type !== 'direct') {
            if (guild && !channel.isDMBased() && !channel.permissionsFor(client.user)?.has('SendMessages')) {
                type = 'direct';
            }
        }

        if (content) msgOptions.content = resolveString(content);
        Object.assign(msgOptions, Util.noReplyPingInDMs(this));

        switch (type) {
            case 'plain':
                if (!shouldEdit) return channel.send(msgOptions);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options: msgOptions });
            case 'reply':
                if (!shouldEdit) return this.reply(msgOptions);
                return this.editCurrentResponse(channelIdOrDM(channel), { type, options: msgOptions });
            case 'direct':
                if (!shouldEdit) return author.send(msgOptions);
                return this.editCurrentResponse('DM', { type, options: msgOptions });
            case 'code':
                msgOptions.content = `\`\`\`${lang}\n${escapeMarkdown(
                    content as string, { codeBlockContent: true }
                )}\n\`\`\``;
                if (!shouldEdit) return channel.send(msgOptions);
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
    protected editResponse(
        response?: CommandoMessageResponse, options: ResponseOptions = {}
    ): Promise<CommandoMessageResponse> {
        const { type, options: msgOptions = {} } = options;
        if (!response) return this.respond({ type, options: msgOptions, fromEdit: true });

        if (Array.isArray(response)) {
            for (let i = response.length - 1; i > 0; i--) response[i]?.delete();
            return response[0].edit(msgOptions);
        }
        return response.edit(msgOptions);
    }

    /**
     * Edits the current response
     * @param id - The ID of the channel the response is in ("DM" for direct messages)
     * @param options - Options for the response
     */
    protected editCurrentResponse(id: string, options?: ResponseOptions): Promise<CommandoMessageResponse> {
        const { responses, responsePositions } = this;
        if (typeof responses.get(id) === 'undefined') responses.set(id, []);
        const responsePos = responsePositions.get(id);
        if (typeof responsePos === 'undefined') responsePositions.set(id, -1);
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
    public say(content: StringResolvable, options?: MessageCreateOptions): Promise<CommandoMessageResponse> {
        let msgContent: StringResolvable | null = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object') options = {};
        return this.respond({ type: 'plain', content: msgContent, options });
    }

    /**
     * Responds with a direct message
     * @param content - Content for the message
     * @param options - Options for the message
     */
    public direct(content: StringResolvable, options?: MessageCreateOptions): Promise<CommandoMessageResponse> {
        let msgContent: StringResolvable | null = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object') options = {};
        return this.respond({ type: 'direct', content: msgContent, options });
    }

    /**
     * Responds with a code message
     * @param lang - Language for the code block
     * @param content - Content for the message
     * @param options - Options for the message
     */
    public code(lang: string, content: StringResolvable, options?: MessageCreateOptions): Promise<CommandoMessageResponse> {
        let msgContent: StringResolvable | null = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object') options = {};
        return this.respond({ type: 'code', content: msgContent, lang, options });
    }

    /**
     * Responds with an embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    public embed(
        embed: EmbedBuilder | EmbedBuilder[], content: StringResolvable = '', options?: MessageCreateOptions
    ): Promise<CommandoMessageResponse> {
        let msgContent: StringResolvable | null = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object') options = {};
        options.embeds = Array.isArray(embed) ? embed : [embed];
        return this.respond({ type: 'plain', content: msgContent, options });
    }

    /**
     * Responds with a reply + embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    public replyEmbed(
        embed: EmbedBuilder | EmbedBuilder[], content: StringResolvable = '', options?: MessageReplyOptions
    ): Promise<CommandoMessageResponse> {
        let msgContent: StringResolvable | null = content;
        if (!options && typeof content === 'object' && !Array.isArray(content)) {
            options = content;
            msgContent = null;
        }
        if (typeof options !== 'object') options = {};
        options.embeds = Array.isArray(embed) ? embed : [embed];
        return this.respond({ type: 'reply', content: msgContent, options });
    }

    /**
     * Finalizes the command message by setting the responses and deleting any remaining prior ones
     * @param responses - Responses to the message
     */
    protected finalize(responses?: CommandoMessageResponse | CommandoMessageResponse[] | null): void {
        if (!responses) return;
        const { responsePositions, responses: _responses } = this;

        if (_responses) this.deleteRemainingResponses();
        _responses.clear();
        responsePositions.clear();

        if (Array.isArray(responses)) {
            for (const response of responses) {
                const firstResponse = Array.isArray(response) ? response[0] : response;
                if (!firstResponse) continue;
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
    protected deleteRemainingResponses(): void {
        const { responses: _responses, responsePositions } = this;
        for (const [id, responses] of _responses) {
            const pos = responsePositions.get(id);
            if (!pos) continue;
            for (let i = pos + 1; i < responses.length; i++) {
                const response = responses[i];
                if (Array.isArray(response)) {
                    for (const resp of response) resp?.delete();
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
    public static parseArgs(argString: string, argCount?: number, allowSingleQuote = true): string[] {
        const argStringModified = removeSmartQuotes(argString, allowSingleQuote);
        const regex = allowSingleQuote ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g : /\s*(?:(")([^]*?)"|(\S+))\s*/g;
        const result = [];
        let match: string[] | null = [];

        // Large enough to get all items
        argCount ||= argStringModified.length;

        // Get match and push the capture group that is not null to the result
        while (--argCount && (match = regex.exec(argStringModified))) result.push(match[2] || match[3]);

        // If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
        if (match && regex.lastIndex < argStringModified.length) {
            const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
            result.push(argStringModified.substring(regex.lastIndex, argStringModified.length).replace(re2, '$2'));
        }

        return result;
    }
}

function removeSmartQuotes(argString: string, allowSingleQuote = true): string {
    let replacementArgString = argString;
    if (allowSingleQuote) replacementArgString = argString.replace(singleSmartQuote, '\'');
    return replacementArgString.replace(doubleSmartQuote, '"');
}

function channelIdOrDM(channel: TextBasedChannel): string {
    if (channel.isDMBased()) return channel.id;
    return 'DM';
}

/**
 * Resolves a StringResolvable to a string.
 * @param data - The string resolvable to resolve
 */
function resolveString(data: StringResolvable): string {
    if (typeof data === 'string') return data;
    if ('content' in data && data.content) return data.content;
    return `${data}`;
}

function messageToJSON(data: CommandoifiedMessage): APIMessage {
    /* eslint-disable camelcase */
    return {
        attachments: [],
        author: data.author.toJSON() as APIUser,
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
