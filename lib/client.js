"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const registry_1 = __importDefault(require("./registry"));
const dispatcher_1 = __importDefault(require("./dispatcher"));
const message_1 = __importDefault(require("./extensions/message"));
const guild_1 = __importDefault(require("./extensions/guild"));
const ClientDatabaseManager_1 = __importDefault(require("./database/ClientDatabaseManager"));
const Schemas_1 = __importDefault(require("./database/Schemas"));
const util_1 = __importDefault(require("./util"));
const initializeDB_1 = __importDefault(require("./database/initializeDB"));
const interaction_1 = __importDefault(require("./extensions/interaction"));
/** Discord.js Client with a command framework */
class CommandoClient extends discord_js_1.Client {
    /** Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter */
    _prefix;
    /** Invite for the bot */
    botInvite;
    /** The client's database manager */
    database;
    /** The guilds' database manager, mapped by the guilds ids */
    databases;
    /** Object containing all the schemas this client uses. */
    databaseSchemas;
    /** The client's command dispatcher */
    dispatcher;
    /** The client's command registry */
    registry;
    /**
     * @param options - Options for the client
     */
    constructor(options) {
        const { prefix, commandEditableDuration, nonCommandEditable, inviteOptions, owners } = options;
        if (typeof prefix === 'undefined')
            options.prefix = '!';
        if (prefix === null)
            options.prefix = '';
        if (typeof commandEditableDuration === 'undefined')
            options.commandEditableDuration = 30;
        if (typeof nonCommandEditable === 'undefined')
            options.nonCommandEditable = true;
        super(options);
        if (typeof inviteOptions === 'object') {
            const invitePerms = inviteOptions.permissions;
            inviteOptions.permissions = discord_js_1.PermissionsBitField.resolve(invitePerms);
        }
        this.botInvite = typeof inviteOptions === 'string' ? inviteOptions : null;
        if (!this.botInvite && typeof inviteOptions === 'object') {
            this.once('ready', () => {
                this.botInvite = this.generateInvite(inviteOptions);
            });
        }
        this.registry = new registry_1.default(this);
        this.dispatcher = new dispatcher_1.default(this, this.registry);
        this.database = new ClientDatabaseManager_1.default(this);
        this.databases = new discord_js_1.Collection();
        this.databaseSchemas = Schemas_1.default;
        this._prefix = null;
        this.initDefaultListeners();
        // Fetch the owner(s)
        this.once('ready', () => owners?.forEach(owner => this.users.fetch(owner).catch(err => {
            this.emit('warn', `Unable to fetch owner ${owner}.`);
            this.emit('error', err);
        })));
    }
    get emojis() {
        return super.emojis;
    }
    async fetchInvite(invite, options) {
        return await super.fetchInvite(invite, options);
    }
    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get prefix() {
        const { _prefix, options } = this;
        if (util_1.default.isNullish(_prefix))
            return options.prefix;
        return _prefix;
    }
    set prefix(prefix) {
        this._prefix = prefix;
        this.emit('commandPrefixChange', null, prefix);
    }
    /**
     * Owners of the bot, set by the {@link CommandoClientOptions#owners} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @readonly
     */
    get owners() {
        const { options, users } = this;
        const owners = options.owners && Array.from(options.owners);
        if (!owners)
            return null;
        return util_1.default.filterNullishItems(owners.map(user => users.resolve(user)));
    }
    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owners})
     * @param user - User to check for ownership
     */
    isOwner(user) {
        const { users, options } = this;
        const { owners: owner } = options;
        if (!owner)
            return false;
        const resolved = users.resolve(user);
        if (!resolved)
            throw new RangeError('Unable to resolve user.');
        const { id } = resolved;
        if (typeof owner === 'string')
            return id === owner;
        if (Array.isArray(owner))
            return owner.includes(id);
        if (owner instanceof Set)
            return owner.has(id);
        throw new RangeError('The client\'s "owner" option is an unknown value.');
    }
    isReady() {
        return super.isReady();
    }
    /** Initializes all default listeners that make the client work. */
    initDefaultListeners() {
        // Parses all the guild instances
        this.once('ready', this.parseGuilds);
        this.on('guildCreate', guild => {
            const commandoGuild = this.parseGuild(guild);
            this.emit('commandoGuildCreate', commandoGuild);
        });
        // Set up message command handling
        const catchErr = (err) => {
            this.emit('error', err);
        };
        this.on('messageCreate', async (message) => {
            if (message.channel.type === discord_js_1.ChannelType.GuildStageVoice)
                return;
            const commando = new message_1.default(this, message);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            if (newMessage.partial || newMessage.channel.type === discord_js_1.ChannelType.GuildStageVoice)
                return;
            const newCommando = new message_1.default(this, newMessage);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(newCommando, oldMessage).catch(catchErr);
        });
        this.on('messageDelete', message => {
            if (message.partial)
                return;
            const commando = new message_1.default(this, message);
            // @ts-expect-error: parseMessage is protected in CommandDispatcher
            const parsedMessage = this.dispatcher.parseMessage(commando) ?? commando;
            this.emit('commandoMessageDelete', parsedMessage);
        });
        // Set up slash command handling
        this.once('ready', () => 
        // @ts-expect-error: registerSlashCommands is protected in CommandoRegistry
        this.registry.registerSlashCommands());
        this.on('interactionCreate', interaction => {
            if (!interaction.isChatInputCommand() || interaction.channel?.type === discord_js_1.ChannelType.GuildStageVoice)
                return;
            try {
                const commando = new interaction_1.default(this, interaction);
                // @ts-expect-error: handleSlash is protected in CommandDispatcher
                this.dispatcher.handleSlash(commando).catch(catchErr);
            }
            catch (error) {
                console.error(error);
            }
        });
        // Establishes MongoDB connection and loads all modules
        this.once('guildsReady', initializeDB_1.default);
        this.on('channelDelete', channel => {
            if (channel.isDMBased())
                channel;
        });
    }
    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    parseGuilds(client) {
        this.guilds.cache.forEach(guild => this.parseGuild(guild));
        this.emit('guildsReady', client);
    }
    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param guild - The Guild to parse
     */
    parseGuild(guild) {
        const commandoGuild = new guild_1.default(this, guild);
        return util_1.default.mutateObjectInstance(guild, commandoGuild);
    }
}
exports.default = CommandoClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQWNvQjtBQUNwQiwwREFBMEM7QUFDMUMsOERBQTZDO0FBQzdDLG1FQUFtRDtBQUNuRCwrREFBK0M7QUFDL0MsNkZBQXFFO0FBQ3JFLGlFQUFnRTtBQUVoRSxrREFBMEI7QUFDMUIsMkVBQW1EO0FBQ25ELDJFQUEyRDtBQWtGM0QsaURBQWlEO0FBQ2pELE1BQXFCLGNBQWdELFNBQVEsbUJBQWE7SUFDdEYsb0dBQW9HO0lBQzFGLE9BQU8sQ0FBaUI7SUFFbEMseUJBQXlCO0lBQ2xCLFNBQVMsQ0FBZ0I7SUFDaEMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBd0I7SUFDdkMsNkRBQTZEO0lBQ3RELFNBQVMsQ0FBMkM7SUFDM0QsMERBQTBEO0lBQ25ELGVBQWUsQ0FBb0I7SUFDMUMsc0NBQXNDO0lBQy9CLFVBQVUsQ0FBb0I7SUFLckMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBbUI7SUFFbEM7O09BRUc7SUFDSCxZQUFtQixPQUE4QjtRQUM3QyxNQUFNLEVBQUUsTUFBTSxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFL0YsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXO1lBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDeEQsSUFBSSxNQUFNLEtBQUssSUFBSTtZQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLElBQUksT0FBTyx1QkFBdUIsS0FBSyxXQUFXO1lBQUUsT0FBTyxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztRQUN6RixJQUFJLE9BQU8sa0JBQWtCLEtBQUssV0FBVztZQUFFLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDakYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFD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