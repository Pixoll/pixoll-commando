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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQVlvQjtBQUNwQiwwREFBMEM7QUFDMUMsOERBQTZDO0FBQzdDLG1FQUFtRDtBQUNuRCwrREFBK0M7QUFDL0MsNkZBQXFFO0FBQ3JFLGlFQUF5QztBQUV6QyxrREFBd0M7QUFDeEMsMkVBQW1EO0FBQ25ELDJFQUEyRDtBQWMzRCxnRUFBcUQ7QUF3RXJELGlEQUFpRDtBQUNqRCxNQUFxQixjQUFnRCxTQUFRLG1CQUFhO0lBQ3RGOztPQUVHO0lBQ08sT0FBTyxDQUFpQjtJQUVsQyx5QkFBeUI7SUFDbEIsU0FBUyxDQUFnQjtJQUNoQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUF3QjtJQUN2Qyw2REFBNkQ7SUFDdEQsU0FBUyxDQUEyQztJQUMzRCwwREFBMEQ7SUFDbkQsZUFBZSxDQUFpQjtJQUN2QyxzQ0FBc0M7SUFDL0IsVUFBVSxDQUFvQjtJQU9yQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUFtQjtJQUNsQyxvQ0FBb0M7SUFDN0IsUUFBUSxDQUF5QjtJQUN4Qyx1RUFBdUU7SUFDaEUsUUFBUSxDQUFzQjtJQUVyQzs7T0FFRztJQUNILFlBQW1CLE9BQThCO1FBQzdDLE1BQU0sRUFBRSxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUUvRixJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVc7WUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUN4RCxJQUFJLE1BQU0sS0FBSyxJQUFJO1lBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDekMsSUFBSSxPQUFPLHVCQUF1QixLQUFLLFdBQVc7WUFBRSxPQUFPLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1FBQ3pGLElBQUksT0FBTyxrQkFBa0IsS0FBSyxX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