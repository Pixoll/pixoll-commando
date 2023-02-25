"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const friendly_1 = __importDefault(require("../errors/friendly"));
const util_1 = __importDefault(require("../util"));
const APISlashCommandOptionTypeMap = Object.fromEntries(util_1.default.getEnumEntries(discord_js_1.ApplicationCommandOptionType)
    .map(([key, value]) => [value, util_1.default.equals(key, ['Subcommand', 'SubcommandGroup']) ? false : key]));
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
    /** Whether this interaction is able to been edited (has been previously deferred or replied to) */
    isEditable() {
        return this.deferred || this.replied;
    }
    /**
     * Parses the options data into usable arguments
     * @see Command#run
     */
    parseArgs(options) {
        const optionsManager = this.options;
        const args = {};
        if (!options) {
            return args;
        }
        for (const { name, type } of options) {
            const getOptionName = `get${APISlashCommandOptionTypeMap[type]}`;
            const apiName = name.replace(/[A-Z]/g, '-$&').toLowerCase();
            const value = optionsManager[getOptionName](apiName);
            args[name] = value;
        }
        return args;
    }
    /** Runs the command */
    async run() {
        const { command, channelId, channel: tempChannel, guild, author, guildId, client } = this;
        const { groupId, memberName } = command;
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
        if (command.nsfw && !channel.isDMBased() && channel.isTextBased() && !channel.isThread() && !channel.nsfw) {
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
        const args = this.parseArgs(this.command.slashInfo?.options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5zaW9ucy9pbnRlcmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUEwQztBQUMxQywyQ0FZb0I7QUFHcEIsa0VBQStDO0FBUy9DLG1EQUE2QztBQTJCN0MsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLGNBQUksQ0FBQyxjQUFjLENBQUMseUNBQXNCLENBQUM7S0FDOUYsR0FBRyxDQUF3RSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FDekYsQ0FBQyxLQUFLLEVBQUUsY0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUM3RSxDQUc0RixDQUFDO0FBRWxHLGtIQUFrSDtBQUNsSCxNQUFxQixtQkFBdUQsU0FBUSx3Q0FBMkI7SUFJM0csNENBQTRDO0lBQ2xDLFFBQVEsQ0FBbUI7SUFFckM7OztPQUdHO0lBQ0gsWUFBbUIsTUFBNEIsRUFBRSxJQUF5QztRQUN0RixLQUFLLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFxQixDQUFDO0lBQ3pGLENBQUM7SUFFRCxJQUFXLE1BQU07UUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELCtDQUErQztJQUMvQyxJQUFXLE9BQU87UUFDZCxPQUFPLEtBQUssQ0FBQyxPQUFpRCxDQUFDO0lBQ25FLENB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