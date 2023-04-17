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
        const { prefix, inviteOptions, owners } = options;
        options.prefix ??= prefix === null ? '' : '!';
        options.commandEditableDuration ??= 30;
        options.nonCommandEditable ??= true;
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
        // Fetch the owners
        this.once('ready', () => owners?.forEach(owner => this.users.fetch(owner).catch(err => {
            this.emit('warn', `Unable to fetch owner ${owner}.`);
            this.emit('error', err);
        })));
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
            return options.prefix ?? undefined;
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
    async destroy() {
        super.destroy();
        await this.provider?.destroy();
    }
    /**
     * Sets the setting provider to use, and initializes it once the client is ready
     * @param provider - Provider to use
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
        await this.awaitEvent('guildsReady', async (client) => {
            this.emit('debug', 'Initializing provider...');
            await newProvider.init(client);
        });
        this.emit('providerReady', newProvider);
        this.emit('debug', 'Provider finished initialization.');
        return;
    }
    /** Checks if the provider is ready. */
    isProviderReady() {
        return this.isReady() && !!this.provider;
    }
    /**
     * Await an event **once**, and get a resolved result from the `listener`.
     * @param event - The event to listen to.
     * @param listener - Listener function.
     * @returns Resolved result from `listener`.
     */
    async awaitEvent(event, listener) {
        const boundListener = listener.bind(this);
        return await new Promise(resolve => {
            this.once(event, async (...args) => {
                const result = await boundListener(...args);
                resolve(result);
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
            await this.dispatcher['handleMessage'](commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            if (newMessage.partial || oldMessage.partial)
                return;
            const newCommando = new message_1.default(this, newMessage);
            await this.dispatcher['handleMessage'](newCommando, oldMessage).catch(catchErr);
        });
        this.on('messageDelete', message => {
            if (message.partial)
                return;
            const commando = new message_1.default(this, message);
            const parsedMessage = this.dispatcher['parseMessage'](commando) ?? commando;
            this.emit('commandoMessageDelete', parsedMessage);
        });
        // Set up slash command handling
        this.once('ready', () => this.registry['registerApplicationCommands']());
        this.on('interactionCreate', interaction => {
            const parsedInteraction = interaction.isChatInputCommand()
                ? new interaction_1.default(this, interaction)
                : interaction;
            this.dispatcher['handleInteraction'](parsedInteraction).catch(catchErr);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQVlvQjtBQUNwQiwwREFBMEM7QUFDMUMsOERBQTZDO0FBQzdDLG1FQUFnRjtBQUNoRiwrREFBK0M7QUFDL0MsNkZBQXFFO0FBQ3JFLGlFQUF5QztBQUV6QyxrREFBd0M7QUFDeEMsMkVBQW1EO0FBQ25ELDJFQUEyRDtBQVUzRCxnRUFBcUQ7QUF3RXJELGlEQUFpRDtBQUNqRCxNQUFxQixjQUluQixTQUFRLG1CQUFtQjtJQUN6Qjs7T0FFRztJQUNPLE9BQU8sQ0FBaUI7SUFFbEMseUJBQXlCO0lBQ2xCLFNBQVMsQ0FBZ0I7SUFDaEMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBd0I7SUFDdkMsNkRBQTZEO0lBQ3RELFNBQVMsQ0FBMkM7SUFDM0QsMERBQTBEO0lBQ25ELGVBQWUsQ0FBaUI7SUFDdkMsc0NBQXNDO0lBQy9CLFVBQVUsQ0FBb0I7SUFHckMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBbUI7SUFDbEMsb0NBQW9DO0lBQzdCLFFBQVEsQ0FBOEI7SUFDN0MsdUVBQXVFO0lBQ2hFLFFBQVEsQ0FBc0I7SUFFckM7O09BRUc7SUFDSCxZQUFtQixPQUE4QjtRQUM3QyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFbEQsT0FBTyxDQUFDLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM5QyxPQUFPLENBQUMsdUJBQXVCLEtBQUssRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLENBQUM7UUFDcEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsSUFBSSxPQUFPLGFBQWEsS0FBSyxRQUFRLEVBQUU7WUFDbkMsTUFBTSxXQUFXLEdBQUcs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