import { Message, EmbedBuilder, User, MessageOptions } from 'discord.js';
import Command from '../commands/base';
import CommandoClient from '../client';
import CommandoGuild from './guild';
/** Type of the response */
declare type ResponseType = 'code' | 'direct' | 'plain' | 'reply';
declare type StringResolvable = MessageOptions | string[] | string;
interface ResponseOptions {
    /** Type of the response */
    type?: ResponseType;
    /** Content of the response */
    content?: MessageOptions | StringResolvable | null;
    /** Options of the response */
    options?: MessageOptions;
    /** Language of the response, if its type is `code` */
    lang?: string;
    /** If the response is from an edited message */
    fromEdit?: boolean;
}
export declare type CommandoMessageResponse = CommandoMessage | Message | Message[] | null;
/**
 * An extension of the base Discord.js Message class to add command-related functionality.
 * @augments Message
 */
export default class CommandoMessage extends Message {
    /** The client the message is for */
    readonly client: CommandoClient<true>;
    /** Whether the message contains a command (even an unknown one) */
    isCommand: boolean;
    /** Command that the message triggers, if any */
    command: Command | null;
    /** Argument string for the command */
    argString: string | null;
    /** Pattern matches (if from a pattern trigger) */
    patternMatches: string[] | null;
    /** Response messages sent, mapped by channel ID (set by the dispatcher after running the command) */
    responses: Map<string, CommandoMessageResponse[]>;
    /** Index of the current response that will be edited, mapped by channel ID */
    responsePositions: Map<string, number>;
    /**
     * @param client - The client the message is for
     * @param data - The message data
     */
    constructor(client: CommandoClient, data: Message);
    /** The guild this message is for */
    get guild(): CommandoGuild | null;
    /**
     * Initializes the message for a command
     * @param command - Command the message triggers
     * @param argString - Argument string for the command
     * @param patternMatches - Command pattern matches (if from a pattern trigger)
     * @return This message
     */
    protected initCommand(command: Command | null, argString: string | null, patternMatches: string[] | null): this;
    /**
     * Creates a usage string for the message's command
     * @param argString - A string of arguments for the command
     * @param prefix - Prefix to use for the
     * prefixed command format
     * @param user - User to use for the mention command format
     */
    usage(argString?: string, prefix?: string | null, user?: User | null): string;
    /**
     * Creates a usage string for any command
     * @param command - A command + arg string
     * @param prefix - Prefix to use for the
     * prefixed command format
     * @param user - User to use for the mention command format
     */
    anyUsage(command: string, prefix?: string | null, user?: User | null): string;
    /**
     * Parses the argString into usable arguments, based on the argsType and argsCount of the command
     * @see Command#run
     */
    parseArgs(): string[] | string;
    /** Runs the command */
    run(): Promise<CommandoMessageResponse>;
    /**
     * Responds to the command message
     * @param options - Options for the response
     */
    protected respond(options?: ResponseOptions): Promise<CommandoMessageResponse>;
    /**
     * Edits a response to the command message
     * @param response - The response message(s) to edit
     * @param options - Options for the response
     */
    protected editResponse(response?: CommandoMessageResponse, options?: ResponseOptions): Promise<CommandoMessageResponse>;
    /**
     * Edits the current response
     * @param id - The ID of the channel the response is in ("DM" for direct messages)
     * @param options - Options for the response
     */
    protected editCurrentResponse(id: string, options?: ResponseOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with a plain message
     * @param content - Content for the message
     * @param options - Options for the message
     */
    say(content: StringResolvable, options?: MessageOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with a direct message
     * @param content - Content for the message
     * @param options - Options for the message
     */
    direct(content: StringResolvable, options?: MessageOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with a code message
     * @param lang - Language for the code block
     * @param content - Content for the message
     * @param options - Options for the message
     */
    code(lang: string, content: StringResolvable, options?: MessageOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with an embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    embed(embed: EmbedBuilder | EmbedBuilder[], content?: StringResolvable, options?: MessageOptions): Promise<CommandoMessageResponse>;
    /**
     * Responds with a reply + embed
     * @param embed - Embed to send
     * @param content - Content for the message
     * @param options - Options for the message
     */
    replyEmbed(embed: EmbedBuilder | EmbedBuilder[], content?: StringResolvable, options?: MessageOptions): Promise<CommandoMessageResponse>;
    /**
     * Finalizes the command message by setting the responses and deleting any remaining prior ones
     * @param responses - Responses to the message
     */
    protected finalize(responses?: CommandoMessageResponse | CommandoMessageResponse[] | null): void;
    /** Deletes any prior responses that haven't been updated */
    protected deleteRemainingResponses(): void;
    /**
     * Parses an argument string into an array of arguments
     * @param argString - The argument string to parse
     * @param argCount - The number of arguments to extract from the string
     * @param allowSingleQuote - Whether or not single quotes should be allowed to wrap arguments, in addition to
     * double quotes
     * @return The array of arguments
     */
    static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[];
}
export {};
