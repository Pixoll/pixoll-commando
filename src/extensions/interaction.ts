import { stripIndent } from 'common-tags';
import {
    APIApplicationCommandOption as APISlashCommandOption,
    APIChatInputApplicationCommandInteraction,
    APIUser,
    ApplicationCommandOptionType as SlashCommandOptionType,
    ApplicationCommandType,
    Attachment,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    If,
    Snowflake,
    User,
} from 'discord.js';
import CommandoClient from '../client';
import Command from '../commands/base';
import FriendlyError from '../errors/friendly';
import {
    CommandoChannel,
    CommandoChatInputCommandInteraction,
    CommandoGuildMember,
    CommandContextChannel,
    CommandoRole,
    CommandoUser,
} from '../discord.overrides';
import Util, { PropertiesOf } from '../util';
import CommandoGuild from './guild';
import CommandoMessage from './message';
import { capitalize } from 'lodash';

export type SlashCommandBasicOptionsParser<O extends APISlashCommandOption[]> = {
    [A in O[number]as A['name']]: A['required'] extends true
    ? SlashCommandOptionTypeMap[A['type']]
    : (
        SlashCommandOptionTypeMap[A['type']] extends never
        ? never
        : SlashCommandOptionTypeMap[A['type']] | null
    );
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

const APISlashCommandOptionTypeMap = Object.fromEntries(Util.getEnumEntries(SlashCommandOptionType)
    .map(([key, value]) => [value, key]));

/** An extension of the base Discord.js ChatInputCommandInteraction class to add command-related functionality. */
export default class CommandoInteraction<InGuild extends boolean = boolean> extends ChatInputCommandInteraction {
    /** The client the interaction is for */
    declare public readonly client: CommandoClient<true>;
    // @ts-expect-error: member is CommandoGuildMember
    declare public member: If<InGuild, CommandoGuildMember>;
    declare public guildId: If<InGuild, Snowflake>;
    /** Command that the interaction triggers */
    protected _command: Command<InGuild>;

    /**
     * @param client - The client the interaction is for
     * @param data - The interaction data
     */
    public constructor(client: CommandoClient<true>, data: CommandoChatInputCommandInteraction) {
        super(client, interactionToJSON(data));
        Object.assign(this, data);

        this._command = client.registry.resolveCommand(data.commandName) as Command<InGuild>;
    }

    public get author(): User {
        return this.user;
    }

    /** The channel this interaction was used in */
    // @ts-expect-error: This is meant to override CommandInteraction's channel getter.
    public get channel(): CommandContextChannel<true, InGuild> {
        return super.channel as CommandContextChannel<true, InGuild>;
    }

    /** Command that the interaction triggers */
    // @ts-expect-error: This is meant to override CommandInteraction's command getter.
    public get command(): Command<InGuild> {
        return this._command;
    }

    /** The guild this interaction was used in */
    // @ts-expect-error: This is meant to override CommandInteraction's guild getter.
    public get guild(): If<InGuild, CommandoGuild> {
        return super.guild as If<InGuild, CommandoGuild>;
    }

    // @ts-expect-error: This is meant to narrow this extension's types
    public inGuild(): this is CommandoInteraction<true> {
        return super.inGuild();
    }

    // @ts-expect-error: This is meant to narrow this extension's types
    public isChatInputCommand(): this is CommandoInteraction<InGuild> {
        return super.isChatInputCommand();
    }

    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    public isEditable(): boolean {
        return this.deferred || this.replied;
    }

    public isInteraction(): this is CommandoInteraction<InGuild> {
        return true;
    }

    public isMessage(): this is CommandoMessage<InGuild> {
        return false;
    }

    /**
     * Parses the options data into usable arguments
     * @see {@link Command.run Command#run}
     */
    public parseArgs<O extends APISlashCommandOption[]>(options?: O): SlashCommandBasicOptionsParser<O> {
        const optionsManager = this.options;
        const args: Record<string, unknown> = {};
        if (!options) {
            return args as SlashCommandBasicOptionsParser<O>;
        }

        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const { name, type } = option;
            const getOptionName = `get${APISlashCommandOptionTypeMap[type]}` as `get${PropertiesOf<
                typeof APISlashCommandOptionTypeMap
            >}`;

            const isSubCommand = Util.equals(getOptionName, ['getSubcommand', 'getSubcommandGroup']);
            const argName = getOptionName === 'getSubcommand' ? 'subCommand'
                : getOptionName === 'getSubcommandGroup' ? 'subCommandGroup'
                    : name.split('-').map((s, i) => i === 0 ? s : capitalize(s)).join('');
            const apiName = name.replace(/[A-Z]/g, '-$&').toLowerCase();
            const value = isSubCommand
                ? optionsManager[getOptionName]()
                // @ts-expect-error: signatures are compatible
                : optionsManager[getOptionName](apiName);

            if (args[argName] || (isSubCommand && name !== value)) continue;
            args[argName] = value;
            if (value && 'options' in option) {
                const nestedValues = this.parseArgs(option.options);
                Object.assign(args, nestedValues);
            }
        }

        return args as SlashCommandBasicOptionsParser<O>;
    }

    /** Runs the command */
    public async run(): Promise<void> {
        const { command, channelId, channel: tempChannel, guild, author, guildId, client } = this;
        const clientUser = client.user;
        const channel = tempChannel ?? await client.channels.fetch(channelId) as unknown as CommandContextChannel<false>;

        if (guild && !channel.isDMBased()) {
            const { members } = guild;

            // Obtain the member for the ClientUser if it doesn't already exist
            const me = members.me ?? await members.fetch(clientUser.id);

            const clientPerms = me.permissionsIn(channel.id).serialize();
            if (clientPerms.ViewChannel && !clientPerms.SendMessages) {
                await author.send(stripIndent`
                    It seems like I cannot **Send Messages** in this channel: ${channel.toString()}
                    Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
                `).catch(() => null);
                return;
            }

            if (!clientPerms.UseApplicationCommands) {
                await author.send(stripIndent`
                    It seems like I cannot **Use Application Commands** in this channel: ${channel.toString()}
                    Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
                `).catch(() => null);
                return;
            }

            // Make sure the command is usable in this context
            if (command.dmOnly) {
                client.emit('commandBlock', this, 'dmOnly');
                await command.onBlock(this, 'dmOnly');
                return;
            }
        }

        // Make sure the command is usable in this context
        if ((command.guildOnly || command.guildOwnerOnly) && !guild) {
            client.emit('commandBlock', this, 'guildOnly');
            await command.onBlock(this, 'guildOnly');
            return;
        }

        // Ensure the channel is a NSFW one if required
        if (command.nsfw && !channel.isDMBased() && channel.isTextBased() && !channel.isThread() && !channel.nsfw) {
            client.emit('commandBlock', this, 'nsfw');
            await command.onBlock(this, 'nsfw');
            return;
        }

        // Ensure the user has permission to use the command
        const hasPermission = command.hasPermission(this);
        if (hasPermission !== true) {
            if (typeof hasPermission === 'string') {
                client.emit('commandBlock', this, hasPermission);
                await command.onBlock(this, hasPermission);
                return;
            }
            const data = { missing: hasPermission || undefined };
            client.emit('commandBlock', this, 'userPermissions', data);
            await command.onBlock(this, 'userPermissions', data);
            return;
        }

        // Ensure the client user has the required permissions
        if (!channel.isDMBased() && command.clientPermissions) {
            const missing = channel.permissionsFor(clientUser)?.missing(command.clientPermissions) || [];
            if (missing.length > 0) {
                const data = { missing };
                client.emit('commandBlock', this, 'clientPermissions', data);
                await command.onBlock(this, 'clientPermissions', data);
                return;
            }
        }

        if (command.deprecated) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Gold)
                .addFields([{
                    name: `The \`${command.name}\` command has been marked as deprecated!`,
                    value: `Please start using the \`${command.deprecatedReplacement}\` command from now on.`,
                }]);

            await channel.send({ content: author.toString(), embeds: [embed] });
        }

        // Parses the options into an arguments object. Array.from to prevent "readonly" error.
        const args = this.parseArgs(this.command.slashCommand?.options);

        // Run the command
        try {
            const location = guildId ? `${guildId}:${channelId}` : `DM:${author.id}`;
            client.emit('debug', `Running slash command "${command.toString()}" at "${location}".`);
            await this.deferReply({ ephemeral: command.slashCommand?.deferEphemeral });
            const promise = command.run(this, args);

            client.emit('commandRun', command, promise, this, args);
            await promise;
        } catch (err) {
            client.emit('commandError', command, err as Error, this, args);
            if (err instanceof FriendlyError) {
                if (this.isEditable()) {
                    await this.editReply({ content: err.message, components: [], embeds: [] });
                } else {
                    await this.reply(err.message);
                }
            }
            await command.onError(err as Error, this, args);
        }
    }
}

function interactionToJSON(
    data: CommandoChatInputCommandInteraction
): APIChatInputApplicationCommandInteraction {
    /* eslint-disable camelcase */
    return {
        app_permissions: data.appPermissions?.bitfield.toString() ?? '',
        application_id: data.applicationId,
        channel_id: data.channelId,
        channel: {
            id: data.channelId,
            type: data.channel?.type ?? 0,
        },
        data: {
            id: data.command?.id ?? '',
            name: data.command?.name ?? '',
            type: ApplicationCommandType.ChatInput,
        },
        id: data.id,
        locale: data.locale,
        token: data.token,
        type: data.type,
        user: data.user.toJSON() as APIUser,
        version: 1,
    };
    /* eslint-enable camelcase */
}
