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