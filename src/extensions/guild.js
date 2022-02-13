/* eslint-disable no-unused-vars */
const { Guild, User, MessageEmbed } = require('discord.js');
const Command = require('../commands/base');
const GuildDatabaseManager = require('../database/GuildDatabaseManager');
/* eslint-enable no-unused-vars */

/**
 * A fancier Guild for fancier people.
 * @extends Guild
 */
class CommandoGuild extends Guild {
	/**
	 * @param {CommandoClient} client
	 * @param {Guild} data
	 */
	constructor(client, data) {
		super(client, { id: data.id });
		Object.assign(this, data);

		client.emit('debug', `Created new ${this.constructor.name} with ID ${this.id}`);

		/**
		 * The database manager for the guild
		 * @type {GuildDatabaseManager}
		 */
		this.database = new GuildDatabaseManager(this);

		/**
		 * The client the guild is for
		 * @type {CommandoClient}
		 */
		// eslint-disable-next-line no-unused-expressions
		this.client;

		/**
		 * The queued logs for this guild
		 * @type {MessageEmbed[]}
		 */
		this.queuedLogs = [];

		/**
		 * Internal command prefix for the guild, controlled by the {@link CommandoGuild#prefix}
		 * getter/setter
		 * @name CommandoGuild#_prefix
		 * @type {?string}
		 * @private
		 */
		this._prefix = null;
	}

	/**
	 * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
	 * Setting to `null` means that the prefix from {@link CommandoClient#prefix} will be used instead.
	 * @type {string}
	 * @emits {@link CommandoClient#commandPrefixChange}
	 */
	get prefix() {
		if (this._prefix === null) return this.client.prefix;
		return this._prefix;
	}

	set prefix(prefix) {
		this._prefix = prefix;
		this.client.emit('commandPrefixChange', this, this._prefix);
	}

	/**
	 * Sets whether a command is enabled in the guild
	 * @param {CommandResolvable} command Command to set status of
	 * @param {boolean} enabled Whether the command should be enabled
	 */
	setCommandEnabled(command, enabled) {
		const { client } = this;
		command = client.registry.resolveCommand(command);
		const { name, guarded } = command;
		if (guarded) throw new Error('The command is guarded.');
		if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
		enabled = !!enabled;
		if (!this._commandsEnabled) {
			/**
			 * Map object of internal command statuses, mapped by command name
			 * @type {Object}
			 * @private
			 */
			this._commandsEnabled = {};
		}
		this._commandsEnabled[name] = enabled;
		client.emit('commandStatusChange', this, command, enabled);
	}

	/**
	 * Checks whether a command is enabled in the guild (does not take the command's group status into account)
	 * @param {CommandResolvable} command Command to check status of
	 * @return {boolean}
	 */
	isCommandEnabled(command) {
		const { registry } = this.client;
		command = registry.resolveCommand(command);
		const { name, guarded, _globalEnabled } = command;
		if (guarded) return true;
		if (!this._commandsEnabled || typeof this._commandsEnabled[name] === 'undefined') {
			return _globalEnabled;
		}
		return this._commandsEnabled[name];
	}

	/**
	 * Sets whether a command group is enabled in the guild
	 * @param {CommandGroupResolvable} group Group to set status of
	 * @param {boolean} enabled Whether the group should be enabled
	 */
	setGroupEnabled(group, enabled) {
		const { client } = this;
		group = client.registry.resolveGroup(group);
		const { id, guarded } = group;
		if (guarded) throw new Error('The group is guarded.');
		if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
		enabled = !!enabled;
		if (!this._groupsEnabled) {
			/**
			 * Internal map object of group statuses, mapped by group ID
			 * @type {Object}
			 * @private
			 */
			this._groupsEnabled = {};
		}
		this._groupsEnabled[id] = enabled;
		client.emit('groupStatusChange', this, group, enabled);
	}

	/**
	 * Checks whether a command group is enabled in the guild
	 * @param {CommandGroupResolvable} group Group to check status of
	 * @return {boolean}
	 */
	isGroupEnabled(group) {
		const { registry } = this.client;
		group = registry.resolveGroup(group);
		const { id, guarded, _globalEnabled } = group;
		if (guarded) return true;
		if (!this._groupsEnabled || typeof this._groupsEnabled[id] === 'undefined') {
			return _globalEnabled;
		}
		return this._groupsEnabled[id];
	}

	/**
	 * Creates a command usage string using the guild's prefix
	 * @param {string} [command] A command + arg string
	 * @param {User} [user=this.client.user] User to use for the mention command format
	 * @return {string}
	 */
	commandUsage(command, user = this.client.user) {
		return Command.usage(command, this.prefix, user);
	}
}


module.exports = CommandoGuild;
