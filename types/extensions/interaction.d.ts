import { APIApplicationCommandOption as APISlashCommandOption, ApplicationCommandOptionType as SlashCommandOptionType, Attachment, ChatInputCommandInteraction, If, Snowflake, User } from 'discord.js';
import CommandoClient from '../client';
import Command from '../commands/base';
import { CommandoChannel, CommandoChatInputCommandInteraction, CommandoGuildMember, CommandoRole, CommandoUser } from '../discord.overrides';
import CommandoGuild from './guild';
import CommandoMessage, { CommandContextChannel } from './message';
/**
 * Parses a raw slash command option array into an `APISlashCommandOption.name`-indexed object.
 *
 * Parsing order:
 * 1. If the `type` is invalid, use `never` and stop.
 * 2. Otherwise, use the result type from `type` and,
 * 3. Add `null` if `required` is not `true`.
 */
export type SlashCommandBasicOptionsParser<O extends APISlashCommandOption[]> = {
    [A in O[number] as A['name']]: SlashCommandOptionTypeMap[A['type']] extends never ? never : SlashCommandOptionTypeMap[A['type']] | (A['required'] extends true ? never : null);
};
export interface SlashCommandOptionTypeMap {
    [SlashCommandOptionType.Attachment]: Attachment;
    [SlashCommandOptionType.Boolean]: boolean;
    [SlashCommandOptionType.Channel]: CommandoChannel;
    [SlashCommandOptionType.Integer]: number;
    [SlashCommandOptionType.Mentionable]: CommandoChannel | CommandoRole | CommandoUser;
    [SlashCommandOptionType.Number]: number;
    [SlashCommandOptionType.Role]: CommandoRole;
    [SlashCommandOptionType.String]: string;
    [SlashCommandOptionType.User]: CommandoUser;
    [SlashCommandOptionType.Subcommand]: never;
    [SlashCommandOptionType.SubcommandGroup]: never;
}
/** An extension of the base Discord.js ChatInputCommandInteraction class to add command-related functionality. */
export default class CommandoInteraction<InGuild extends boolean = boolean> extends ChatInputCommandInteraction {
    /** The client the interaction is for */
    readonly client: CommandoClient<true>;
    member: If<InGuild, CommandoGuildMember>;
    guildId: If<InGuild, Snowflake>;
    /** Command that the interaction triggers */
    protected _command: Command<InGuild>;
    /**
     * @param client - The client the interaction is for
     * @param data - The interaction data
     */
    constructor(client: CommandoClient<true>, data: CommandoChatInputCommandInteraction);
    /** Used for compatibility with {@link CommandoMessage} in {@link CommandContext}. */
    get author(): User;
    /** The channel this interaction was used in */
    get channel(): CommandContextChannel<true, InGuild>;
    /** Command that the interaction triggers */
    get command(): Command<InGuild>;
    /** The guild this interaction was used in */
    get guild(): If<InGuild, CommandoGuild>;
    inGuild(): this is CommandoInteraction<true>;
    isChatInputCommand(): this is CommandoInteraction<InGuild>;
    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    isEditable(): boolean;
    /** Checks if the {@link CommandContext} is an interaction. */
    isInteraction(): this is CommandoInteraction<InGuild>;
    /** Checks if the {@link CommandContext} is a message. */
    isMessage(): this is CommandoMessage<InGuild>;
    /**
     * Parses the options data into usable arguments
     * @see {@link Command.run Command#run}
     */
    parseArgs<O extends APISlashCommandOption[]>(options?: O): SlashCommandBasicOptionsParser<O>;
    /** Runs the command */
    run(): Promise<void>;
}
