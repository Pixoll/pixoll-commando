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
    /** Internal global command prefix, controlled by the {@link CommandoClient.prefix prefix} getter/setter */
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
     * Setting to `null` means that the default prefix from {@link CommandoClient.options options} will be used instead.
     * @emits {@link CommandoClientEvents.commandPrefixChange commandPrefixChange}
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
     * Owners of the bot, set by the {@link CommandoClientOptions.owners owners} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient.isOwner isOwner}.</info>
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
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions.owners owners})
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
        // Add application owner to CommandoClient.options.owners
        this.once('ready', async (client) => {
            const { application, options } = client;
            const { owner } = await application.fetch();
            if (!owner)
                return;
            const ownerId = owner instanceof discord_js_1.User ? owner.id : owner.ownerId;
            if (!ownerId)
                return;
            options.owners ??= [];
            if (Array.isArray(options.owners))
                options.owners.push(ownerId);
            else
                options.owners.add(ownerId);
        });
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
            if (interaction.channel?.type === discord_js_1.ChannelType.GuildStageVoice)
                return;
            if (interaction.isAutocomplete()) {
                // @ts-expect-error: handleSlashAutocomplete is protected in CommandDispatcher
                this.dispatcher.handleSlashAutocomplete(interaction).catch(catchErr);
            }
            if (!interaction.isChatInputCommand())
                return;
            const commando = new interaction_1.default(this, interaction);
            // @ts-expect-error: handleSlashCommand is protected in CommandDispatcher
            this.dispatcher.handleSlashCommand(commando).catch(catchErr);
        });
        // Establishes MongoDB connection and loads all modules
        this.once('guildsReady', initializeDB_1.default);
    }
    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    async parseGuilds(client) {
        const rawGuilds = await this.guilds.fetch();
        const guilds = await Promise.all(rawGuilds.map(guild => guild.fetch()));
        guilds.forEach(guild => this.parseGuild(guild));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQWNvQjtBQUNwQiwwREFBMEM7QUFDMUMsOERBQTZDO0FBQzdDLG1FQUFtRDtBQUNuRCwrREFBK0M7QUFDL0MsNkZBQXFFO0FBQ3JFLGlFQUF5QztBQUV6QyxrREFBMEI7QUFDMUIsMkVBQW1EO0FBQ25ELDJFQUEyRDtBQWtGM0QsaURBQWlEO0FBQ2pELE1BQXFCLGNBQWdELFNBQVEsbUJBQWE7SUFDdEYsMkdBQTJHO0lBQ2pHLE9BQU8sQ0FBaUI7SUFFbEMseUJBQXlCO0lBQ2xCLFNBQVMsQ0FBZ0I7SUFDaEMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBd0I7SUFDdkMsNkRBQTZEO0lBQ3RELFNBQVMsQ0FBMkM7SUFDM0QsMERBQTBEO0lBQ25ELGVBQWUsQ0FBaUI7SUFDdkMsc0NBQXNDO0lBQy9CLFVBQVUsQ0FBb0I7SUFLckMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBbUI7SUFFbEM7O09BRUc7SUFDSCxZQUFtQixPQUE4QjtRQUM3QyxNQUFNLEVBQUUsTUFBTSxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFL0YsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXO1lBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDeEQsSUFBSSxNQUFNLEtBQUssSUFBSTtZQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLElBQUksT0FBTyx1QkFBdUIsS0FBSyxXQUFXO1lBQUUsT0FBTyxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztRQUN6RixJQUFJLE9BQU8sa0JBQWtCLEtBQUssV0FBVztZQUFFLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDakYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFD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