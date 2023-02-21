"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const friendly_1 = __importDefault(require("../errors/friendly"));
const util_1 = __importDefault(require("../util"));
const guild_1 = require("./guild");
/** An extension of the base Discord.js ChatInputCommandInteraction class to add command-related functionality. */
class CommandoInteraction extends discord_js_1.ChatInputCommandInteraction {
    /** Command that the interaction triggers */
    _command;
    /**
     * @param client - The client the interaction is for
     * @param data - The interaction data
     */
    constructor(client, data) {
        super(client, interactionToJSON(data));
        Object.assign(this, data);
        this._command = client.registry.resolveCommand(data.commandName);
    }
    get author() {
        return this.user;
    }
    /** The channel this interaction was used in */
    get channel() {
        return super.channel;
    }
    /** Command that the interaction triggers */
    // @ts-expect-error: This is meant to override CommandInteraction's command getter.
    get command() {
        return this._command;
    }
    /** The guild this interaction was used in */
    get guild() {
        return super.guild;
    }
    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    isEditable() {
        return this.deferred || this.replied;
    }
    /**
     * Parses the options data into usable arguments
     * @see Command#run
     */
    parseArgs(options) {
        const args = {};
        const { client, guild } = this;
        const { channels } = client;
        let members = null, roles = null;
        if (guild) {
            members = guild.members;
            roles = guild.roles;
        }
        for (const option of options) {
            const { name, value, type, channel, member, user, role, attachment } = option;
            if (name && util_1.default.isNullish(value)) {
                args.subCommand = name;
                if (option.options) {
                    Object.assign(args, this.parseArgs(option.options));
                }
                continue;
            }
            const optionName = util_1.default.removeDashes(name);
            switch (type) {
                case discord_js_1.ApplicationCommandOptionType.Boolean:
                case discord_js_1.ApplicationCommandOptionType.Integer:
                case discord_js_1.ApplicationCommandOptionType.Number:
                case discord_js_1.ApplicationCommandOptionType.String:
                case discord_js_1.ApplicationCommandOptionType.Subcommand:
                    args[optionName] = value ?? null;
                    break;
                case discord_js_1.ApplicationCommandOptionType.Channel:
                    args[optionName] = channel ? channels.resolve(channel.id) : null;
                    break;
                case discord_js_1.ApplicationCommandOptionType.Mentionable: {
                    const resolvedMember = member instanceof guild_1.CommandoGuildMember && members ? members.resolve(member) : null;
                    const resolvedChannel = channel ? channels.resolve(channel.id) : null;
                    const resolvedRole = role && roles ? roles.resolve(role.id) : null;
                    args[optionName] = resolvedMember ?? user ?? resolvedChannel ?? resolvedRole ?? null;
                    break;
                }
                case discord_js_1.ApplicationCommandOptionType.Role:
                    args[optionName] = role && roles ? roles.resolve(role.id) : null;
                    break;
                case discord_js_1.ApplicationCommandOptionType.User: {
                    const resolvedMember = member instanceof guild_1.CommandoGuildMember && members ? members.resolve(member) : null;
                    args[optionName] = resolvedMember ?? user ?? null;
                    break;
                }
                case discord_js_1.ApplicationCommandOptionType.Attachment:
                    args[optionName] = attachment ?? null;
                    break;
                default:
                    throw new RangeError(`Unsupported option type "${type}".`);
            }
        }
        return args;
    }
    /** Runs the command */
    async run() {
        const { command, channelId, channel, guild, author, guildId, client, options } = this;
        const { groupId, memberName } = command;
        const { user: clientUser } = client;
        if (guild && !channel.isDMBased()) {
            const { members } = guild;
            // Obtain the member for the ClientUser if it doesn't already exist
            const me = members.me ?? await members.fetch(clientUser.id);
            const clientPerms = me.permissionsIn(channel).serialize();
            if (clientPerms.ViewChannel && !clientPerms.SendMessages) {
                await author.send((0, common_tags_1.stripIndent) `
                    It seems like I cannot **Send Messages** in this channel: ${channel.toString()}
                    Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
                `).catch(() => null);
                return;
            }
            if (!clientPerms.UseApplicationCommands) {
                await author.send((0, common_tags_1.stripIndent) `
                    It seems like I cannot **Use Application Commands** in this channel: ${channel.toString()}
                    Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
                `).catch(() => null);
                return;
            }
            // Make sure the command is usable in this context
            if (command.dmOnly) {
                client.emit('commandBlock', { interaction: this }, 'dmOnly');
                await command.onBlock({ interaction: this }, 'dmOnly');
                return;
            }
        }
        // Make sure the command is usable in this context
        if ((command.guildOnly || command.guildOwnerOnly) && !guild) {
            client.emit('commandBlock', { interaction: this }, 'guildOnly');
            await command.onBlock({ interaction: this }, 'guildOnly');
            return;
        }
        // Ensure the channel is a NSFW one if required
        if (command.nsfw && 'nsfw' in channel && !channel.nsfw) {
            client.emit('commandBlock', { interaction: this }, 'nsfw');
            await command.onBlock({ interaction: this }, 'nsfw');
            return;
        }
        // Ensure the user has permission to use the command
        const hasPermission = command.hasPermission({ interaction: this });
        if (hasPermission !== true) {
            if (typeof hasPermission === 'string') {
                client.emit('commandBlock', { interaction: this }, hasPermission);
                await command.onBlock({ interaction: this }, hasPermission);
                return;
            }
            const data = { missing: hasPermission };
            client.emit('commandBlock', { interaction: this }, 'userPermissions', data);
            await command.onBlock({ interaction: this }, 'userPermissions', data);
            return;
        }
        // Ensure the client user has the required permissions
        if (!channel.isDMBased() && command.clientPermissions) {
            const missing = channel.permissionsFor(clientUser)?.missing(command.clientPermissions) || [];
            if (missing.length > 0) {
                const data = { missing };
                client.emit('commandBlock', { interaction: this }, 'clientPermissions', data);
                await command.onBlock({ interaction: this }, 'clientPermissions', data);
                return;
            }
        }
        if (command.deprecated) {
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Gold)
                .addFields([{
                    name: `The \`${command.name}\` command has been marked as deprecated!`,
                    value: `Please start using the \`${command.deprecatedReplacement}\` command from now on.`,
                }]);
            await channel.send({ content: author.toString(), embeds: [embed] });
        }
        // Parses the options into an arguments object. Array.from to prevent "readonly" error.
        const args = this.parseArgs(Array.from(options.data));
        // Run the command
        try {
            const location = guildId ? `${guildId}:${channelId}` : `DM:${author.id}`;
            client.emit('debug', `Running slash command "${groupId}:${memberName}" at "${location}".`);
            await this.deferReply({ ephemeral: command.slashInfo?.deferEphemeral });
            const promise = command.run({ interaction: this }, args);
            client.emit('commandRun', command, promise, { interaction: this }, args);
            await promise;
        }
        catch (err) {
            client.emit('commandError', command, err, { interaction: this }, args);
            if (err instanceof friendly_1.default) {
                if (this.isEditable()) {
                    await this.editReply({ content: err.message, components: [], embeds: [] });
                }
                else {
                    await this.reply(err.message);
                }
            }
            await command.onError(err, { interaction: this }, args);
        }
    }
}
exports.default = CommandoInteraction;
function interactionToJSON(data) {
    /* eslint-disable camelcase */
    return {
        app_permissions: data.appPermissions?.bitfield.toString() ?? '',
        application_id: data.applicationId,
        channel_id: data.channelId,
        data: {
            id: data.command?.id ?? '',
            name: data.command?.name ?? '',
            type: discord_js_1.ApplicationCommandType.ChatInput,
        },
        id: data.id,
        locale: data.locale,
        token: data.token,
        type: data.type,
        user: data.user.toJSON(),
        version: 1,
    };
    /* eslint-enable camelcase */
}
//# sourceMappingURL=interaction.js.map