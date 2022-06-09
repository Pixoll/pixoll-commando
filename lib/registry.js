"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable new-cap */
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const require_all_1 = __importDefault(require("require-all"));
const base_1 = __importDefault(require("./commands/base"));
const group_1 = __importDefault(require("./commands/group"));
const message_1 = __importDefault(require("./extensions/message"));
const base_2 = __importDefault(require("./types/base"));
const util_1 = __importDefault(require("./util"));
/** Handles registration and searching of commands and groups */
class CommandoRegistry {
    /** The client this registry is for */
    client;
    /** Registered commands, mapped by their name */
    commands;
    /** Registered command groups, mapped by their ID */
    groups;
    /** Registered argument types, mapped by their ID */
    types;
    /** Fully resolved path to the bot's commands directory */
    commandsPath;
    /** Command to run when an unknown command is used */
    unknownCommand;
    /**
     * @param client - Client to use
     */
    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
        this.commands = new discord_js_1.Collection();
        this.groups = new discord_js_1.Collection();
        this.types = new discord_js_1.Collection();
        this.commandsPath = null;
        this.unknownCommand = null;
    }
    /** Registers every client and guild slash command available - this may only be called upon startup. */
    async registerSlashCommands() {
        const { commands, client } = this;
        const { application, options, guilds } = client;
        // @ts-expect-error: _slashToAPI should only be accessed inside of Command
        const testCommands = commands.filter(cmd => cmd.test && !!cmd.slash).map(cmd => cmd._slashToAPI);
        if (testCommands.length !== 0) {
            if (typeof options.testGuild !== 'string')
                throw new TypeError('Client testGuild must be a string.');
            const guild = guilds.resolve(options.testGuild);
            if (!guild)
                throw new TypeError('Client testGuild must be a valid Guild ID.');
            const current = await guild.commands.fetch();
            const [updated, removed] = getUpdatedSlashCommands(current.toJSON(), testCommands);
            const promises = [];
            for (const command of updated) {
                const match = current.find(cmd => cmd.name === command.name);
                if (match) {
                    promises.push(guild.commands.edit(match, command));
                }
                else {
                    promises.push(guild.commands.create(command));
                }
            }
            for (const command of removed) {
                const match = current.find(cmd => cmd.name === command.name);
                if (match)
                    promises.push(guild.commands.delete(match));
            }
            await Promise.all(promises);
            client.emit('debug', `Loaded ${testCommands.length} guild slash commands`);
        }
        // @ts-expect-error: _slashToAPI should only be accessed inside of Command
        const slashCommands = commands.filter(cmd => !cmd.test && !!cmd.slash).map(cmd => cmd._slashToAPI);
        if (slashCommands.length === 0)
            return;
        const current = await application.commands.fetch();
        const [updated, removed] = getUpdatedSlashCommands(current.toJSON(), slashCommands);
        const promises = [];
        for (const command of updated) {
            const match = current.find(cmd => cmd.name === command.name);
            if (match) {
                promises.push(application.commands.edit(match, command));
            }
            else {
                promises.push(application.commands.create(command));
            }
        }
        for (const command of removed) {
            const match = current.find(cmd => cmd.name === command.name);
            if (match)
                promises.push(application.commands.delete(match));
        }
        await Promise.all(promises);
        client.emit('debug', `Loaded ${slashCommands.length} public slash commands`);
    }
    /**
     * Registers a single group
     * @param group - A CommandGroup instance
     * or the constructor parameters (with ID, name, and guarded properties)
     * @see {@link CommandoRegistry#registerGroups}
     */
    registerGroup(group) {
        const { client, groups } = this;
        // @ts-expect-error: CommandGroup has "no construct signature"
        if (isConstructor(group, group_1.default))
            group = new group(client);
        else if (!(group instanceof group_1.default)) {
            group = new group_1.default(client, group.id, group.name, group.guarded);
        }
        const existing = groups.get(group.id);
        if (existing) {
            existing.name = group.name;
            client.emit('debug', `Group ${group.id} is already registered. Renamed it to "${group.name}".`);
        }
        else {
            groups.set(group.id, group);
            /**
             * Emitted when a group is registered
             * @event CommandoClient#groupRegister
             * @param {CommandGroup} group - Group that was registered
             * @param {CommandoRegistry} registry - Registry that the group was registered to
             */
            client.emit('groupRegister', group, this);
            client.emit('debug', `Registered group ${group.id}.`);
        }
        return this;
    }
    /**
     * Registers multiple groups
     * @param groups - An array of CommandGroup instances or the constructors parameters (with ID, name, and guarded
     * properties).
     * @example
     * registry.registerGroups([
     *     { id: 'fun', name: 'Fun' },
     *     { id: 'mod', name: 'Moderation' }
     * ]);
     */
    registerGroups(groups) {
        if (!Array.isArray(groups))
            throw new TypeError('Groups must be an Array.');
        for (const group of groups) {
            this.registerGroup(group);
        }
        return this;
    }
    /**
     * Registers a single command
     * @param command - Either a Command instance, or a constructor for one
     * @see {@link CommandoRegistry#registerCommands}
     */
    registerCommand(command) {
        const { client, commands, groups, unknownCommand } = this;
        // @ts-expect-error: Command has "no construct signature"
        if (isConstructor(command, base_1.default))
            command = new command(client);
        // @ts-expect-error: default doesn't exist in Command
        else if (isConstructor(command.default, base_1.default))
            command = new command.default(client);
        if (!(command instanceof base_1.default))
            throw new Error(`Invalid command object to register: ${command}`);
        const { name, aliases, groupId, memberName, unknown } = command;
        // Make sure there aren't any conflicts
        if (commands.some(cmd => cmd.name === name || cmd.aliases.includes(name))) {
            throw new Error(`A command with the name/alias "${name}" is already registered.`);
        }
        for (const alias of aliases) {
            if (commands.some(cmd => cmd.name === alias || cmd.aliases.includes(alias))) {
                throw new Error(`A command with the name/alias "${alias}" is already registered.`);
            }
        }
        const group = groups.find(grp => grp.id === groupId);
        if (!group)
            throw new Error(`Group "${groupId}" is not registered.`);
        if (group.commands.some(cmd => cmd.memberName === memberName)) {
            throw new Error(`A command with the member name "${memberName}" is already registered in ${group.id}`);
        }
        if (unknown && unknownCommand)
            throw new Error('An unknown command is already registered.');
        // Add the command
        command.group = group;
        group.commands.set(name, command);
        commands.set(name, command);
        if (unknown)
            this.unknownCommand = command;
        /**
         * Emitted when a command is registered
         * @event CommandoClient#commandRegister
         * @param {Command} command - Command that was registered
         * @param {CommandoRegistry} registry - Registry that the command was registered to
         */
        client.emit('commandRegister', command, this);
        client.emit('debug', `Registered command ${group.id}:${memberName}.`);
        return this;
    }
    /**
     * Registers multiple commands
     * @param commands - An array of Command instances or constructors
     * @param ignoreInvalid - Whether to skip over invalid objects without throwing an error
     */
    registerCommands(commands, ignoreInvalid = false) {
        if (!Array.isArray(commands))
            throw new TypeError('Commands must be an Array.');
        for (const command of commands) {
            // @ts-expect-error: ArgumentType not assignable to 'new () => unknown'
            const valid = isConstructor(command, base_1.default) || isConstructor(command.default, base_1.default)
                // @ts-expect-error: default doesn't exist in never
                || (command instanceof base_1.default) || (command.default instanceof base_1.default);
            if (ignoreInvalid && !valid) {
                this.client.emit('warn', `Attempting to register an invalid command object: ${command} skipping.`);
                continue;
            }
            this.registerCommand(command);
        }
        return this;
    }
    /**
     * Registers all commands in a directory. The files must export a Command class constructor or instance.
     * @param options - The path to the directory, or a require-all options object
     * @example
     * const path = require('path');
     * registry.registerCommandsIn(path.join(__dirname, 'commands'));
     */
    registerCommandsIn(options) {
        const obj = (0, require_all_1.default)(options);
        const commands = [];
        for (const group of Object.values(obj)) {
            for (const command of Object.values(group)) {
                commands.push(command);
            }
        }
        if (typeof options === 'string' && !this.commandsPath)
            this.commandsPath = options;
        else if (typeof options === 'object' && !this.commandsPath)
            this.commandsPath = options.dirname;
        return this.registerCommands(commands, true);
    }
    /**
     * Registers a single argument type
     * @param type - Either an ArgumentType instance, or a constructor for one
     * @see {@link CommandoRegistry#registerTypes}
     */
    registerType(type) {
        const { client, types } = this;
        // @ts-expect-error: ArgumentType has "no construct signature"
        if (isConstructor(type, base_2.default))
            type = new type(client);
        // @ts-expect-error: default doesn't exist in ArgumentType
        else if (isConstructor(type.default, base_2.default))
            type = new type.default(client);
        if (!(type instanceof base_2.default))
            throw new Error(`Invalid type object to register: ${type}`);
        // Make sure there aren't any conflicts
        if (types.has(type.id))
            throw new Error(`An argument type with the ID "${type.id}" is already registered.`);
        // Add the type
        types.set(type.id, type);
        /**
         * Emitted when an argument type is registered
         * @event CommandoClient#typeRegister
         * @param {ArgumentType} type - Argument type that was registered
         * @param {CommandoRegistry} registry - Registry that the type was registered to
         */
        client.emit('typeRegister', type, this);
        client.emit('debug', `Registered argument type ${type.id}.`);
        return this;
    }
    /**
     * Registers multiple argument types
     * @param types - An array of ArgumentType instances or constructors
     * @param ignoreInvalid - Whether to skip over invalid objects without throwing an error
     */
    registerTypes(types, ignoreInvalid = false) {
        if (!Array.isArray(types))
            throw new TypeError('Types must be an Array.');
        for (const type of types) {
            // @ts-expect-error: ArgumentType not assignable to 'new () => unknown'
            const valid = isConstructor(type, base_2.default) || isConstructor(type.default, base_2.default)
                // @ts-expect-error: default doesn't exist in never
                || (type instanceof base_2.default) || (type.default instanceof base_2.default);
            if (ignoreInvalid && !valid) {
                this.client.emit('warn', `Attempting to register an invalid argument type object: ${type} skipping.`);
                continue;
            }
            this.registerType(type);
        }
        return this;
    }
    /**
     * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
     * @param options - The path to the directory, or a require-all options object
     */
    registerTypesIn(options) {
        const obj = (0, require_all_1.default)(options);
        const types = [];
        for (const type of Object.values(obj))
            types.push(type);
        return this.registerTypes(types, true);
    }
    /**
     * Registers the default argument types to the registry
     * @param types - Object specifying which types to register
     */
    registerDefaultTypes(types = {}) {
        const defaultTypes = Object.keys((0, require_all_1.default)(path_1.default.join(__dirname, '/types')))
            .filter(k => k !== 'base' && k !== 'union')
            .reduce((obj, k) => {
            // @ts-expect-error: no string index
            obj[util_1.default.removeDashes(k)] = true;
            return obj;
        }, {});
        Object.assign(defaultTypes, types);
        for (let type in defaultTypes) {
            if (type !== type.toLowerCase()) {
                type = type.replace(/[A-Z]/g, '-$&').toLowerCase();
            }
            this.registerType(require(`./types/${type}`));
        }
        return this;
    }
    /**
     * Reregisters a command (does not support changing name, group, or memberName)
     * @param command - New command
     * @param oldCommand - Old command
     */
    reregisterCommand(command, oldCommand) {
        const { client, commands, unknownCommand } = this;
        // @ts-expect-error: Command has "no construct signature"
        if (isConstructor(command, base_1.default))
            command = new command(client);
        // @ts-expect-error: default doesn't exist in Command
        else if (isConstructor(command.default, base_1.default))
            command = new command.default(client);
        if (!(command instanceof base_1.default))
            throw new Error(`Invalid command object to register: ${command}`);
        const { name, groupId, memberName, unknown } = command;
        if (name !== oldCommand.name)
            throw new Error('Command name cannot change.');
        if (groupId !== oldCommand.groupId)
            throw new Error('Command group cannot change.');
        if (memberName !== oldCommand.memberName)
            throw new Error('Command memberName cannot change.');
        if (unknown && this.unknownCommand !== oldCommand) {
            throw new Error('An unknown command is already registered.');
        }
        command.group = this.resolveGroup(groupId);
        command.group.commands.set(name, command);
        commands.set(name, command);
        if (unknownCommand === oldCommand)
            this.unknownCommand = null;
        if (unknown)
            this.unknownCommand = command;
        /**
         * Emitted when a command is reregistered
         * @event CommandoClient#commandReregister
         * @param {Command} newCommand - New command
         * @param {Command} oldCommand - Old command
         */
        client.emit('commandReregister', command, oldCommand);
        client.emit('debug', `Reregistered command ${groupId}:${memberName}.`);
    }
    /**
     * Unregisters a command
     * @param command - Command to unregister
     */
    unregisterCommand(command) {
        const { commands, unknownCommand, client } = this;
        const { name, groupId, memberName } = command;
        commands.delete(name);
        command.group.commands.delete(name);
        if (unknownCommand === command)
            this.unknownCommand = null;
        /**
         * Emitted when a command is unregistered
         * @event CommandoClient#commandUnregister
         * @param {Command} command - Command that was unregistered
         */
        client.emit('commandUnregister', command);
        client.emit('debug', `Unregistered command ${groupId}:${memberName}.`);
    }
    /**
     * Finds all groups that match the search string
     * @param searchString - The string to search for
     * @param exact - Whether the search should be exact
     * @return All groups that are found
     */
    findGroups(searchString = null, exact = false) {
        const { groups } = this;
        if (!searchString)
            return groups.toJSON();
        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedGroups = groups.filter(exact ? groupFilterExact(lcSearch) : groupFilterInexact(lcSearch)).toJSON();
        if (exact)
            return matchedGroups;
        // See if there's an exact match
        for (const group of matchedGroups) {
            if (group.name.toLowerCase() === lcSearch || group.id === lcSearch)
                return [group];
        }
        return matchedGroups;
    }
    /**
     * Resolves a CommandGroupResolvable to a CommandGroup object
     * @param group - The group to resolve
     * @return The resolved CommandGroup
     */
    resolveGroup(group) {
        if (group instanceof group_1.default)
            return group;
        if (typeof group === 'string') {
            const groups = this.findGroups(group, true);
            if (groups.length === 1)
                return groups[0];
        }
        throw new Error('Unable to resolve group.');
    }
    /**
     * Finds all commands that match the search string
     * @param searchString - The string to search for
     * @param exact - Whether the search should be exact
     * @param instances - The instances to check usability against
     * @return All commands that are found
     */
    findCommands(searchString = null, exact = false, instances = {}) {
        const { commands } = this;
        const { message, interaction } = instances;
        if (!searchString) {
            return message ?? interaction ?
                commands.filter(cmd => cmd.isUsable({ message, interaction })).toJSON() :
                commands.toJSON();
        }
        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedCommands = commands.filter(exact ? commandFilterExact(lcSearch) : commandFilterInexact(lcSearch)).toJSON();
        if (exact)
            return matchedCommands;
        // See if there's an exact match
        for (const command of matchedCommands) {
            if (command.name === lcSearch || command.aliases?.some(ali => ali === lcSearch)) {
                return [command];
            }
        }
        return matchedCommands;
    }
    /**
     * Resolves a CommandResolvable to a Command object
     * @param command - The command to resolve
     * @return The resolved Command
     */
    resolveCommand(command) {
        if (command instanceof base_1.default)
            return command;
        if (command instanceof message_1.default && command.command)
            return command.command;
        if (typeof command === 'string') {
            const commands = this.findCommands(command, true);
            if (commands.length === 1)
                return commands[0];
        }
        throw new Error('Unable to resolve command.');
    }
    /**
     * Resolves a command file path from a command's group ID and memberName
     * @param group - ID of the command's group
     * @param memberName - Member name of the command
     * @return Fully-resolved path to the corresponding command file
     */
    resolveCommandPath(group, memberName) {
        return path_1.default.join(this.commandsPath, group, `${memberName}.js`);
    }
}
exports.default = CommandoRegistry;
function groupFilterExact(search) {
    return (grp) => grp.id === search || grp.name.toLowerCase() === search;
}
function groupFilterInexact(search) {
    return (grp) => grp.id.includes(search) || grp.name.toLowerCase().includes(search);
}
function commandFilterExact(search) {
    return (cmd) => cmd.name === search
        || cmd.aliases?.some(ali => ali === search)
        || `${cmd.groupId}:${cmd.memberName}` === search;
}
function commandFilterInexact(search) {
    return (cmd) => cmd.name.includes(search)
        || `${cmd.groupId}:${cmd.memberName}` === search
        || cmd.aliases?.some(ali => ali.includes(search));
}
function isConstructor(func, _class) {
    try {
        new new Proxy(func, {
            construct: () => Object.prototype
        })();
        if (!_class)
            return true;
        return func.prototype instanceof _class;
    }
    catch (err) {
        return false;
    }
}
const apiCmdOptionType = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10
};
const apiCmdOptChanType = {
    GUILD_TEXT: 0,
    GUILD_VOICE: 2,
    GUILD_CATEGORY: 4,
    GUILD_NEWS: 5,
    GUILD_NEWS_THREAD: 10,
    GUILD_PUBLIC_THREAD: 11,
    GUILD_PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13
};
/**
 * Compares and returns the difference between a set of arrays
 * @param oldCommands - The old array
 * @param newCommands - The new array
 * @returns `[updated, removed]`
 */
function getUpdatedSlashCommands(oldCommands = [], newCommands = []) {
    oldCommands = JSON.parse(JSON.stringify(oldCommands));
    newCommands = JSON.parse(JSON.stringify(newCommands));
    oldCommands.forEach(apiCommand => {
        for (const prop in apiCommand) {
            if (['name', 'description', 'options'].includes(prop))
                continue;
            // @ts-expect-error: no string index
            delete apiCommand[prop];
        }
        // @ts-expect-error: number is not assignable to property's type
        apiCommand.type = 1;
        parseApiCmdOptions(apiCommand.options);
        if (apiCommand.options.length === 0) {
            // @ts-expect-error: operand must be optional
            delete apiCommand.options;
        }
    });
    const map1 = new Map();
    // @ts-expect-error: no string index
    oldCommands.forEach(el => map1.set(JSON.stringify(orderObjProps(el)), true));
    // @ts-expect-error: no string index
    const updated = newCommands.filter(el => !map1.has(JSON.stringify(orderObjProps(el))));
    const map2 = new Map();
    newCommands.forEach(el => map2.set(el.name, true));
    // @ts-expect-error: conversion of types might be mistake because of insufficiently overlapping
    const removed = oldCommands.filter(el => !map2.has(el.name));
    return [updated, removed];
}
/**
 * @param options - The options to parse
 */
function parseApiCmdOptions(options) {
    options.forEach(option => {
        // @ts-expect-error: required does not exist in some sub-types
        if (option.required === false)
            delete option.required;
        for (const prop in option) {
            // @ts-expect-error: no string index
            if (typeof option[prop] === 'undefined') {
                // @ts-expect-error: no string index
                delete option[prop];
                continue;
            }
            if (prop.toLowerCase() === prop)
                continue;
            const toApply = prop.replace(/[A-Z]/g, '_$&').toLowerCase();
            // @ts-expect-error: no string index
            option[toApply] = option[prop];
            // @ts-expect-error: no string index
            delete option[prop];
            if (toApply === 'channel_types') {
                // @ts-expect-error: channel_types "does not exist" in APIApplicationCommandOption
                for (let i = 0; i < option[toApply].length; i++) {
                    // @ts-expect-error: channel_types "does not exist" in APIApplicationCommandOption
                    option[toApply][i] = apiCmdOptChanType[option[toApply][i]];
                }
            }
        }
        // @ts-expect-error: no number index
        option.type = apiCmdOptionType[option.type];
        if ('options' in option && option.options)
            parseApiCmdOptions(option.options);
    });
}
function orderObjProps(obj) {
    const ordered = {};
    for (const key of Object.keys(obj).sort()) {
        const value = obj[key];
        if (Array.isArray(value)) {
            ordered[key] = [];
            value.forEach(nested => {
                ordered[key].push(orderObjProps(nested));
            });
            continue;
        }
        if (typeof value === 'object') {
            ordered[key] = orderObjProps(value);
            continue;
        }
        ordered[key] = value;
    }
    return ordered;
}
//# sourceMappingURL=registry.js.map