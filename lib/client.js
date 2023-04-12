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
    get emojis() {
        return super.emojis;
    }
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
     * @param provider Provider to use
     */
    async setProvider(provider) {
        const newProvider = await provider;
        this.provider = newProvider;
        if (this.readyTimestamp) {
            this.emit('debug', `Provider set to ${newProvider.constructor.name} - initializing...`);
            await newProvider.init(this);
            this.emit('debug', 'Provider finished initialization.');
            return;
        }
        this.emit('debug', `Provider set to ${newProvider.constructor.name} - will initialize once ready.`);
        await this.awaitEvent('ready', async () => {
            this.emit('debug', 'Initializing provider...');
            await newProvider.init(this);
        });
        this.emit('providerReady', newProvider);
        this.emit('debug', 'Provider finished initialization.');
        return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQWFvQjtBQUNwQiwwREFBMEM7QUFDMUMsOERBQTZDO0FBQzdDLG1FQUFtRDtBQUNuRCwrREFBK0M7QUFDL0MsNkZBQXFFO0FBQ3JFLGlFQUF5QztBQUV6QyxrREFBd0M7QUFDeEMsMkVBQW1EO0FBQ25ELDJFQUEyRDtBQWEzRCxnRUFBcUQ7QUF3RXJELGlEQUFpRDtBQUNqRCxNQUFxQixjQUFnRCxTQUFRLG1CQUFhO0lBQ3RGOztPQUVHO0lBQ08sT0FBTyxDQUFpQjtJQUVsQyx5QkFBeUI7SUFDbEIsU0FBUyxDQUFnQjtJQUNoQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUF3QjtJQUN2Qyw2REFBNkQ7SUFDdEQsU0FBUyxDQUEyQztJQUMzRCwwREFBMEQ7SUFDbkQsZUFBZSxDQUFpQjtJQUN2QyxzQ0FBc0M7SUFDL0IsVUFBVSxDQUFvQjtJQUtyQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUFtQjtJQUNsQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUF5QjtJQUN4Qyx1RUFBdUU7SUFDaEUsUUFBUSxDQUFzQjtJQUVyQzs7T0FFRztJQUNILFlBQW1CLE9BQThCO1FBQzdDLE1BQU0sRUFBRSxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUUvRixJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVc7WUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUN4RCxJQUFJLE1BQU0sS0FBSyxJQUFJO1lBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDekMsSUFBSSxPQUFPLHVCQUF1QixLQUFLLFdBQVc7WUFBRSxPQUFPLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1FBQ3pGLElBQUksT0FBTyxrQkFBa0IsS0FBSyxX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