import { APIApplicationCommandOption as APISlashCommandOption, ApplicationCommandOptionType as SlashCommandOptionType, Attachment, ChatInputCommandInteraction, If, Snowflake, User } from 'discord.js';
import CommandoClient from '../client';
import Command from '../commands/base';
import { CommandoChannel, CommandoChatInputCommandInteraction, CommandoGuildMember, CommandContextChannel, CommandoRole, CommandoUser } from '../discord.overrides';
import CommandoGuild from './guild';
import CommandoMessage from './message';
export type SlashCommandBasicOptionsParser<O extends APISlashCommandOption[]> = {
    [A in O[number] as A['name']]: A['required'] extends true ? SlashCommandOptionTypeMap[A['type']] : (SlashCommandOptionTypeMap[A['type']] extends never ? never : SlashCommandOptionTypeMap[A['type']] | null);
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
    get author(): User;
    /** The channel this interaction was used in */
    get channel(): CommandContextChannel<true, InGuild>;
    /** Command that the interaction triggers */
    get command(): Command<InGuild>;
    /** The guild this interaction was used in */
    get guild(): If<InGuild, CommandoGuild>;
    inGuild(): this is CommandoInteraction<true>;
    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    isEditable(): boolean;
    isInteraction(): this is CommandoInteraction<InGuild>;
    isMessage(): this is CommandoMessage<InGuild>;
    /**
     * Parses the options data into usable arguments
     * @see {@link Command.run Command#run}
     */
    parseArgs<O extends APISlashCommandOption[]>(options?: O): SlashCommandBasicOptionsParser<O>;
    /** Runs the command */
    run(): Promise<void>;
}
