"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const databaseSchemas = __importStar(require("./database/util/schemas"));
const modules_loader_1 = __importDefault(require("./database/util/modules-loader"));
/**
 * Discord.js Client with a command framework
 * @augments Client
 */
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
        const { prefix, commandEditableDuration, nonCommandEditable, inviteOptions, owner } = options;
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
            inviteOptions.permissions = discord_js_1.Permissions.resolve(invitePerms);
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
        this.databaseSchemas = databaseSchemas;
        this._prefix = null;
        // Parses all the guild instances
        this.once('ready', this.parseGuilds);
        this.on('guildCreate', this.parseGuild);
        // Set up message command handling
        const catchErr = (err) => {
            this.emit('error', err);
        };
        this.on('messageCreate', async (message) => {
            const commando = new message_1.default(this, message);
            this.emit('commandoMessageCreate', commando);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando).catch(catchErr);
        });
        this.on('messageUpdate', async (oldMessage, newMessage) => {
            const commando = new message_1.default(this, newMessage);
            // @ts-expect-error: handleMessage is protected in CommandDispatcher
            await this.dispatcher.handleMessage(commando, oldMessage).catch(catchErr);
        });
        // Set up slash command handling
        this.once('ready', async () => {
            // @ts-expect-error: registerSlashCommands is protected in CommandoRegistry
            await this.registry.registerSlashCommands();
        });
        this.on('interactionCreate', async (interaction) => {
            // @ts-expect-error: handleSlash is protected in CommandDispatcher
            await this.dispatcher.handleSlash(interaction).catch(catchErr);
        });
        // Fetch the owner(s)
        if (owner) {
            this.once('ready', () => {
                if (Array.isArray(owner) || owner instanceof Set) {
                    for (const user of owner) {
                        this.users.fetch(user).catch(err => {
                            this.emit('warn', `Unable to fetch owner ${user}.`);
                            this.emit('error', err);
                        });
                    }
                    return;
                }
                this.users.fetch(owner).catch(err => {
                    this.emit('warn', `Unable to fetch owner ${owner}.`);
                    this.emit('error', err);
                });
            });
        }
        // Establishes MongoDB connection and loads all modules
        this.once('guildsReady', async () => await (0, modules_loader_1.default)(this));
    }
    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get prefix() {
        const { _prefix, options } = this;
        if (typeof _prefix === 'undefined' || _prefix === null)
            return options.prefix;
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
     * @readonly
     */
    get owners() {
        const { options, users } = this;
        const { cache } = users;
        const { owner } = options;
        if (!owner)
            return null;
        if (typeof owner === 'string')
            return [cache.get(owner)].filter(u => u);
        const owners = [];
        for (const user of owner)
            owners.push(cache.get(user));
        return owners.filter(u => u);
    }
    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
     * @param user - User to check for ownership
     */
    isOwner(user) {
        const { users, options } = this;
        const { owner } = options;
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
    /** Parses all {@link Guild} instances into {@link CommandoGuild}s. */
    parseGuilds() {
        // @ts-expect-error: CommandoGuild is not assignable to Guild
        this.guilds.cache.forEach(guild => this.parseGuild(guild));
        this.emit('guildsReady', this);
    }
    /**
     * Parses a {@link Guild} instance into a {@link CommandoGuild}.
     * @param guild - The {@link Guild} to parse
     */
    parseGuild(guild) {
        const commandoGuild = new guild_1.default(this, guild);
        Object.assign(guild, commandoGuild);
        // @ts-expect-error: Prop. does not exist in Guild
        guild.setCommandEnabled = commandoGuild.setCommandEnabled;
        // @ts-expect-error: Prop. does not exist in Guild
        guild.isCommandEnabled = commandoGuild.isCommandEnabled;
        // @ts-expect-error: Prop. does not exist in Guild
        guild.setGroupEnabled = commandoGuild.setGroupEnabled;
        // @ts-expect-error: Prop. does not exist in Guild
        guild.isGroupEnabled = commandoGuild.isGroupEnabled;
        // @ts-expect-error: Prop. does not exist in Guild
        guild.commandUsage = commandoGuild.commandUsage;
        Object.defineProperty(guild, 'prefix', {
            get() {
                if (this._prefix === null)
                    return this.client.prefix;
                return this._prefix;
            },
            set(prefix) {
                this._prefix = prefix;
                this.client.emit('commandPrefixChange', this, this._prefix);
            }
        });
        // @ts-expect-error: Guild is not assignable to CommandoGuild
        this.emit('commandoGuildCreate', guild);
    }
}
exports.default = CommandoClient;
//# sourceMappingURL=client.js.map