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
const helper_1 = __importDefault(require("./providers/helper"));
/** Discord.js Client with a command framework */
class CommandoClient extends discord_js_1.Client {
    /**
     * Internal global command prefix, controlled by the {@link CommandoClient.prefix CommandoClient#prefix} getter/setter
     */
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
    /** The client's setting provider */
    provider;
    /** Shortcut to use setting provider methods for the global settings */
    settings;
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
        this.provider = null;
        // @ts-expect-error: constructor is protected in GuildSettingsHelper
        this.settings = new helper_1.default(this, null);
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
    // @ts-expect-error: This is meant to override guild's emojis getter.
    get emojis() {
        // @ts-expect-error: BaseCommandoGuildEmojiManager extends BaseGuildEmojiManager
        return super.emojis;
    }
    // @ts-expect-error: This is meant to override the fetchInvite method type.
    async fetchInvite(invite, options) {
        return await super.fetchInvite(invite, options);
    }
    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient.options CommandoClient#options} will
     * be used instead.
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
     * Owners of the bot, set by the {@link CommandoClientOptions.owners CommandoClientOptions#owners} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient.isOwner CommandoClient#isOwner}.</info>
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
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions.owners CommandoClientOptions#owners})
     * @param user - User to check for ownership
     */
    isOwner(user) {
        const { users, options } = this;
        const { owners: owner } = options;
        if (!owner)
            return false;
        // @ts-expect-error: CommandoClient extends Client
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
    // @ts-expect-error: This is meant to override the isReady method type.
    isReady() {
        return super.isReady();
    }
    async destroy() {
        super.destroy();
        await this.provider?.destroy();
    }
    /**
     * Sets the setting provider to use, and initializes it once the client is ready
     * @param provider Provider to use
     */
    async setProvider(provider) {
        const newProvider = await provider;
        this.provider = newProvider;
        if (this.isReady()) {
            this.emit('debug', `Provider set to ${newProvider.constructor.name} - initializing...`);
            await newProvider.init(this);
            this.emit('debug', 'Provider finished initialization.');
            return;
        }
        this.emit('debug', `Provider set to ${newProvider.constructor.name} - will initialize once ready.`);
        await this.awaitEvent('ready', async (client) => {
            this.emit('debug', 'Initializing provider...');
            await newProvider.init(client);
        });
        this.emit('providerReady', newProvider);
        this.emit('debug', 'Provider finished initialization.');
        return;
    }
    isProviderReady() {
        return this.isReady() && !!this.provider;
    }
    async awaitEvent(event, listener) {
        const boundListener = listener.bind(this);
        return await new Promise(resolve => {
            this.once(event, async (...args) => {
                await boundListener(...args);
                resolve(this);
            });
        });
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
            const commando = new message_1.default(this, message);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            if (newMessage.partial)
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
        this.registry.registerApplicationCommands());
        this.on('interactionCreate', interaction => {
            const parsedInteraction = interaction.isChatInputCommand()
                ? new interaction_1.default(this, interaction)
                : interaction;
            // @ts-expect-error: handleInteraction is protected in CommandDispatcher
            this.dispatcher.handleInteraction(parsedInteraction).catch(catchErr);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQWFvQjtBQUNwQiwwREFBMEM7QUFDMUMsOERBQTZDO0FBQzdDLG1FQUFtRDtBQUNuRCwrREFBK0M7QUFDL0MsNkZBQXFFO0FBQ3JFLGlFQUF5QztBQUV6QyxrREFBd0M7QUFDeEMsMkVBQW1EO0FBQ25ELDJFQUEyRDtBQWMzRCxnRUFBcUQ7QUF3RXJELGlEQUFpRDtBQUNqRCxNQUFxQixjQUluQixTQUFRLG1CQUFtQjtJQUN6Qjs7T0FFRztJQUNPLE9BQU8sQ0FBaUI7SUFFbEMseUJBQXlCO0lBQ2xCLFNBQVMsQ0FBZ0I7SUFDaEMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBd0I7SUFDdkMsNkRBQTZEO0lBQ3RELFNBQVMsQ0FBMkM7SUFDM0QsMERBQTBEO0lBQ25ELGVBQWUsQ0FBaUI7SUFDdkMsc0NBQXNDO0lBQy9CLFVBQVUsQ0FBb0I7SUFPckMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBbUI7SUFDbEMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBdUQ7SUFDdEUsdUVBQXVFO0lBQ2hFLFFBQVEsQ0FBc0I7SUFFckM7O09BRUc7SUFDSCxZQUFtQixPQUE4QjtRQUM3QyxNQUFNLEVBQUUsTUFBTSxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFL0YsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXO1lBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDeEQsSUFBSSxNQUFNLEtBQUssSUFBSTtZQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLElBQUksT0FBTyx1QkFBdUIsS0FBSyxXQUFXO1lBQUUsT0FBTyxDQUFDLHVCQUF1QixHQUFHLEVBQUUsQ0FBQztRQUN6RixJQUFJLE9BQU8sa0JBQWtCLEtBQUss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