// eslint-disable-next-line no-unused-vars
const { Client, Permissions, Collection, ClientOptions, InviteGenerationOptions } = require('discord.js');
const CommandoRegistry = require('./registry');
const CommandDispatcher = require('./dispatcher');
const CommandoMessage = require('./extensions/message');
const CommandoGuild = require('./extensions/guild');
const ClientDatabaseManager = require('./database/ClientDatabaseManager');
const databaseSchemas = require('./database/util/schemas');

/**
 * Discord.js Client with a command framework
 * @extends {Client}
 */
class CommandoClient extends Client {
    /**
     * Options for a CommandoClient
     * @typedef {object} CommandoClientOptions
     * @property {string} [prefix=!] - Default command prefix
     * @property {number} [commandEditableDuration=30] - Time in seconds that command messages should be editable
     * @property {boolean} [nonCommandEditable=true] - Whether messages without commands can be edited to a command
     * @property {string|string[]|Set<string>} [owner] - ID of the bot owner's Discord user, or multiple IDs
     * @property {string} [serverInvite] - Invite URL to the bot's support server
     * @property {InviteGenerationOptions|string} [inviteOptions] - Invite options for the bot
     * @property {string} [testGuild] - The test guild ID or the slash commands
     * @property {string} [mongoDbURI] - The URI which will establish your connection with MongoDB
     * @property {string} [modulesDir] - The directory in which your modules are stored in
     * @property {string[]} [excludeModules] - The names of the modules to exclude
     */

    /**
     * @param {CommandoClientOptions & ClientOptions} [options] - Options for the client
     */
    constructor(options = {}) {
        const { prefix, commandEditableDuration, nonCommandEditable, inviteOptions, owner } = options;

        if (typeof prefix === 'undefined') options.prefix = '!';
        if (prefix === null) options.prefix = '';
        if (typeof commandEditableDuration === 'undefined') options.commandEditableDuration = 30;
        if (typeof nonCommandEditable === 'undefined') options.nonCommandEditable = true;
        super(options);

        /**
         * Options for the client
         * @type {CommandoClientOptions}
         */
        // eslint-disable-next-line no-unused-expressions
        this.options;

        if (typeof inviteOptions === 'object') {
            const invitePerms = inviteOptions.permissions;
            inviteOptions.permissions = Permissions.resolve(invitePerms);
        }

        /**
         * Invite for the bot
         * @type {?string}
         */
        this.botInvite = typeof inviteOptions === 'string' ? inviteOptions : null;
        if (!this.botInvite && typeof inviteOptions === 'object') {
            this.once('ready', () => {
                this.botInvite = this.generateInvite(inviteOptions);
            });
        }

        /**
         * @type {CommandoGuildManager}
         */
        // eslint-disable-next-line no-unused-expressions
        this.guilds;

        /**
         * The client's command registry
         * @type {CommandoRegistry}
         */
        this.registry = new CommandoRegistry(this);

        /**
         * The client's command dispatcher
         * @type {CommandDispatcher}
         */
        this.dispatcher = new CommandDispatcher(this, this.registry);

        /**
         * The client's database manager
         * @type {ClientDatabaseManager}
         */
        this.database = new ClientDatabaseManager(this);

        /**
         * The guilds' database manager, mapped by the guilds ids
         * @type {Collection<string, GuildDatabaseManager>}
         */
        this.databases = new Collection();

        /**
         * Object containing all the schemas this client uses.
         * @type {{ [key: string]: Model }}
         */
        this.databaseSchemas = databaseSchemas;

        /**
         * Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter
         * @type {?string}
         * @private
         */
        this._prefix = null;

        // Parses all the guild instances
        this.once('ready', this.parseGuilds);
        this.on('guildCreate', this.parseGuild);

        // Set up message command handling
        const catchErr = err => {
            this.emit('error', err);
        };
        this.on('messageCreate', async message => {
            const commando = new CommandoMessage(this, message);
            this.emit('commandoMessageCreate', commando);
            await this.dispatcher.handleMessage(commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            const commando = new CommandoMessage(this, newMessage);
            await this.dispatcher.handleMessage(commando, oldMessage).catch(catchErr);
        });

        // Set up slash command handling
        this.once('ready', async () => {
            await this.registry.registerSlashCommands();
        });
        this.on('interactionCreate', async interaction => {
            await this.dispatcher.handleSlash(interaction).catch(catchErr);
        });

        // Fetch the owner(s)
        if (options.owner) {
            this.once('ready', () => {
                if (Array.isArray(owner) || owner instanceof Set) {
                    for (const user of owner) {
                        this.users.fetch(user).catch(err => {
                            this.emit('warn', `Unable to fetch owner ${user}.`);
                            this.emit('error', err);
                        });
                    }
                } else {
                    this.users.fetch(owner).catch(err => {
                        this.emit('warn', `Unable to fetch owner ${owner}.`);
                        this.emit('error', err);
                    });
                }
            });
        }

        // Establishes MongoDB connection and loads all modules
        this.once('guildsReady', async () =>
            await require('./database/util/modules-loader')(this)
        );
    }

    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @type {string}
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get prefix() {
        const { _prefix, options } = this;
        if (typeof _prefix === 'undefined' || _prefix === null) return options.prefix;
        return _prefix;
    }

    set prefix(prefix) {
        this._prefix = prefix;
        this.emit('commandPrefixChange', null, prefix);
    }

    /**
     * Owners of the bot, set by the {@link CommandoClientOptions#owner} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @type {?Array<User>}
     * @readonly
     */
    get owners() {
        const { options, users } = this;
        const { cache } = users;
        const { owner } = options;

        if (!owner) return null;
        if (typeof owner === 'string') return [cache.get(owner)];
        const owners = [];
        for (const user of owner) owners.push(cache.get(user));
        return owners;
    }

    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
     * @param {UserResolvable} user - User to check for ownership
     * @return {boolean}
     */
    isOwner(user) {
        const { users, options } = this;
        const { owner } = options;

        if (!owner) return false;
        user = users.resolve(user);
        if (!user) throw new RangeError('Unable to resolve user.');
        const { id } = user;

        if (typeof owner === 'string') return id === owner;
        if (Array.isArray(owner)) return owner.includes(id);
        if (owner instanceof Set) return owner.has(id);
        throw new RangeError('The client\'s "owner" option is an unknown value.');
    }

    /**
     * Parses all {@link Guild} instances into {@link CommandoGuild}s.
     * @private
     */
    parseGuilds() {
        this.guilds.cache.forEach(guild => this.parseGuild(guild));
        this.emit('guildsReady', this);
    }

    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param {Guild} guild The {@link Guild} to parse
     * @private
     */
    parseGuild(guild) {
        const commandoGuild = new CommandoGuild(this, guild);
        Object.assign(guild, commandoGuild);
        guild.setCommandEnabled = commandoGuild.setCommandEnabled;
        guild.isCommandEnabled = commandoGuild.isCommandEnabled;
        guild.setGroupEnabled = commandoGuild.setGroupEnabled;
        guild.isGroupEnabled = commandoGuild.isGroupEnabled;
        guild.commandUsage = commandoGuild.commandUsage;
        Object.defineProperty(guild, 'prefix', {
            get() {
                if (this._prefix === null) return this.client.prefix;
                return this._prefix;
            },
            set(prefix) {
                this._prefix = prefix;
                this.client.emit('commandPrefixChange', this, this._prefix);
            }
        });
        this.emit('commandoGuildCreate', guild);
    }
}

module.exports = CommandoClient;
