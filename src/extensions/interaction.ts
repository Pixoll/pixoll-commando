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
    .map<[SlashCommandOptionType, keyof typeof SlashCommandOptionType | false]>(([key, value]) =>
        [value, Util.equals(key, ['Subcommand', 'SubcommandGroup']) ? false : key]
    )) as Record<
        Exclude<SlashCommandOptionType, SlashCommandOptionType.Subcommand | SlashCommandOptionType.SubcommandGroup>,
        Exclude<keyof typeof SlashCommandOptionType, 'Subcommand' | 'SubcommandGroup'>
    > & Record<SlashCommandOptionType.Subcommand | SlashCommandOptionType.SubcommandGroup, false>;

/** An extension of the base Discord.js ChatInputCommandInteraction class to add command-related functionality. */
export default class CommandoInteraction<InGuild extends boolean = boolean> extends ChatInputCommandInteraction {
    /** The client the interaction is for */
    declare public readonly client: CommandoClient<true>;
    declare public member: If<InGuild, CommandoGuildMember>;
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
    public get channel(): CommandContextChannel<true, InGuild> {
        return super.channel as CommandContextChannel<true, InGuild>;
    }

    /** Command that the interaction triggers */
    // @ts-expect-error: This is meant to override CommandInteraction's command getter.
    public get command(): Command<InGuild> {
        return this._command;
    }

    /** The guild this interaction was used in */
    public get guild(): If<InGuild, CommandoGuild> {
        return super.guild as If<InGuild, CommandoGuild>;
    }

    // @ts-expect-error: This is meant to narrow this extension's types
    public inGuild(): this is CommandoInteraction<true> {
        return super.inGuild();
    }

    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    public isEditable(): boolean {
        return this.deferred || this.replied;
    }

    /**
     * Parses the options data into usable arguments
     * @see Command#run
     */
    public parseArgs<O extends APISlashCommandOption[]>(options?: O): SlashCommandBasicOptionsParser<O> {
        const optionsManager = this.options;
        const args: Record<string, unknown> = {};
        if (!options) {
            return args as SlashCommandBasicOptionsParser<O>;
        }

        for (const { name, type } of options) {
            const getOptionName = `get${APISlashCommandOptionTypeMap[type]}` as `get${Exclude<PropertiesOf<
                typeof APISlashCommandOptionTypeMap
            >, false>}`;
            const apiName = name.replace(/[A-Z]/g, '-$&').toLowerCase();
            const value = optionsManager[getOptionName](apiName);
            args[name] = value;
        }

        return args as SlashCommandBasicOptionsParser<O>;
    }

    /** Runs the command */
    public async run(): Promise<void> {
        const { command, channelId, channel: tempChannel, guild, author, guildId, client } = this;
        const { groupId, memberName } = command;
        const clientUser = client.user;
        const channel = tempChannel ?? await client.channels.fetch(channelId) as CommandContextChannel<false>;

        if (guild && !channel.isDMBased()) {
            const { members } = guild;

            // Obtain the member for the ClientUser if it doesn't already exist
            const me = members.me ?? await members.fetch(clientUser.id);

            const clientPerms = me.permissionsIn(channel).serialize();
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
            const data = { missing: hasPermission };
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
        const args = this.parseArgs(this.command.slashInfo?.options);

        // Run the command
        try {
            const location = guildId ? `${guildId}:${channelId}` : `DM:${author.id}`;
            client.emit('debug', `Running slash command "${groupId}:${memberName}" at "${location}".`);
            await this.deferReply({ ephemeral: command.slashInfo?.deferEphemeral });
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
