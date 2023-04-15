"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const friendly_1 = __importDefault(require("../errors/friendly"));
const util_1 = __importDefault(require("../util"));
const lodash_1 = require("lodash");
const APISlashCommandOptionTypeMap = Object.fromEntries(util_1.default.getEnumEntries(discord_js_1.ApplicationCommandOptionType)
    .map(([key, value]) => [value, key]));
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
    // @ts-expect-error: This is meant to narrow this extension's types
    inGuild() {
        return super.inGuild();
    }
    // @ts-expect-error: This is meant to narrow this extension's types
    isChatInputCommand() {
        return super.isChatInputCommand();
    }
    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    isEditable() {
        return this.deferred || this.replied;
    }
    isInteraction() {
        return true;
    }
    isMessage() {
        return false;
    }
    /**
     * Parses the options data into usable arguments
     * @see {@link Command.run Command#run}
     */
    parseArgs(options) {
        const optionsManager = this.options;
        const args = {};
        if (!options) {
            return args;
        }
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const { name, type } = option;
            const getOptionName = `get${APISlashCommandOptionTypeMap[type]}`;
            const isSubCommand = util_1.default.equals(getOptionName, ['getSubcommand', 'getSubcommandGroup']);
            const argName = getOptionName === 'getSubcommand' ? 'subCommand'
                : getOptionName === 'getSubcommandGroup' ? 'subCommandGroup'
                    : name.split('-').map((s, i) => i === 0 ? s : (0, lodash_1.capitalize)(s)).join('');
            const apiName = name.replace(/[A-Z]/g, '-$&').toLowerCase();
            const value = isSubCommand
                ? optionsManager[getOptionName]()
                // @ts-expect-error: signatures are compatible
                : optionsManager[getOptionName](apiName);
            if (args[argName] || (isSubCommand && name !== value))
                continue;
            args[argName] = value;
            if (value && 'options' in option) {
                const nestedValues = this.parseArgs(option.options);
                Object.assign(args, nestedValues);
            }
        }
        return args;
    }
    /** Runs the command */
    async run() {
        const { command, channelId, channel: tempChannel, guild, author, guildId, client } = this;
        const clientUser = client.user;
        const channel = tempChannel ?? await client.channels.fetch(channelId);
        if (guild && !channel.isDMBased()) {
            const { members } = guild;
            // Obtain the member for the ClientUser if it doesn't already exist
            const me = members.me ?? await members.fetch(clientUser.id);
            const clientPerms = me.permissionsIn(channel.id).serialize();
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
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Gold)
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
        }
        catch (err) {
            client.emit('commandError', command, err, this, args);
            if (err instanceof friendly_1.default) {
                if (this.isEditable()) {
                    await this.editReply({ content: err.message, components: [], embeds: [] });
                }
                else {
                    await this.reply(err.message);
                }
            }
            await command.onError(err, this, args);
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
        channel: {
            id: data.channelId,
            type: data.channel?.type ?? 0,
        },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5zaW9ucy9pbnRlcmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUEwQztBQUMxQywyQ0Fhb0I7QUFHcEIsa0VBQStDO0FBUy9DLG1EQUE2QztBQUc3QyxtQ0FBb0M7QUEwQnBDLE1BQU0sNEJBQTRCLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxjQUFJLENBQUMsY0FBYyxDQUFDLHlDQUFzQixDQUFDO0tBQzlGLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFMUMsa0hBQWtIO0FBQ2xILE1BQXFCLG1CQUF1RCxTQUFRLHdDQUEyQjtJQUszRyw0Q0FBNEM7SUFDbEMsUUFBUSxDQUFtQjtJQUVyQzs7O09BR0c7SUFDSCxZQUFtQixNQUE0QixFQUFFLElBQXlDO1FBQ3RGLEtBQUssQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxQixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQXFCLENBQUM7SUFDekYsQ0FBQztJQUVELElBQVcsTUFBTTtRQUNiLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQsK0NBQStDO0lBQy9DLElBQVcsT0FBTztRQUNkLE9BQU8sS0FBSyxDQUFDLE9BQStDLENBQUM7SUFDakUsQ0FBQztJQUVELDRDQUE0QztJQUM1QyxtRkFBbUY7SUFDbkYsSUFBVyxPQUFPO1FBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFF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