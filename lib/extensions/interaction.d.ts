import { CommandInteraction, CommandInteractionOption, GuildMember, GuildTextBasedChannel, If, StageChannel, TextBasedChannel, User } from 'discord.js';
import CommandoClient from '../client';
import Command from '../commands/base';
import CommandoGuild from './guild';
declare class CommandoMember extends GuildMember {
    guild: CommandoGuild;
}
/** An extension of the base Discord.js CommandInteraction class to add command-related functionality. */
export default class CommandoInteraction<InGuild extends boolean = boolean> extends CommandInteraction {
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
    /** The channel this interaction was used in */
    get channel(): Exclude<If<InGuild, GuildTextBasedChannel, TextBasedChannel>, StageChannel>;
    /** Command that the interaction triggers */
    get command(): Command;
    /** The guild this interaction was used in */
    get guild(): If<InGuild, CommandoGuild>;
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
