import { CommandInteraction, CommandInteractionOption, GuildMember, TextBasedChannel, User } from 'discord.js';
import CommandoClient from '../client';
import Command from '../commands/base';
import CommandoGuild from './guild';
declare class CommandoMember extends GuildMember {
    guild: CommandoGuild;
}
/**
 * An extension of the base Discord.js CommandInteraction class to add command-related functionality.
 * @augments CommandInteraction
 */
export default class CommandoInteraction extends CommandInteraction {
    /** The client the interaction is for */
    readonly client: CommandoClient<true>;
    member: CommandoMember | null;
    /** Command that the interaction triggers */
    protected _command: Command;
    /**
     * @param client - The client the interaction is for
     * @param data - The interaction data
     */
    constructor(client: CommandoClient, data: CommandInteraction);
    get author(): User;
    get channel(): TextBasedChannel;
    /** Command that the interaction triggers */
    get command(): Command;
    /** The guild this message is for */
    get guild(): CommandoGuild | null;
    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    isEditable(): boolean;
    /**
     * Parses the options data into usable arguments
     * @see Command#run
     */
    parseArgs(options: CommandInteractionOption[]): Record<string, unknown>;
    /** Runs the command */
    run(): Promise<void>;
}
export {};
