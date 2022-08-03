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
        const testCommands = commands.filter(cmd => cmd.testEnv && !!cmd.slashInfo)
            .mapValues(cmd => cmd.slashInfo);
        if (testCommands.size !== 0) {
            if (typeof options.testGuild !== 'string')
                throw new TypeError('Client testGuild must be a string.');
            const guild = guilds.resolve(options.testGuild);
            if (!guild)
                throw new TypeError('Client testGuild must be a valid Guild ID.');
            const current = await guild.commands.fetch();
            const { created, updated, removed } = getUpdatedSlashCommands(current.toJSON(), testCommands);
            const promises = [];
            for (const command of created) {
                promises.push(guild.commands.create(command));
            }
            for (const [id, command] of updated) {
                promises.push(guild.commands.edit(id, command));
            }
            for (const command of removed) {
                promises.push(guild.commands.delete(command));
            }
            await Promise.all(promises);
            client.emit('debug', `Loaded ${testCommands.size} guild slash commands`);
        }
        const slashCommands = commands.filter(cmd => !cmd.testEnv && !!cmd.slashInfo)
            .mapValues(cmd => cmd.slashInfo);
        if (slashCommands.size === 0)
            return;
        const current = await application.commands.fetch();
        const { created, updated, removed } = getUpdatedSlashCommands(current.toJSON(), slashCommands);
        const promises = [];
        for (const command of created) {
            promises.push(application.commands.create(command));
        }
        for (const [id, command] of updated) {
            promises.push(application.commands.edit(id, command));
        }
        for (const command of removed) {
            promises.push(application.commands.delete(command));
        }
        await Promise.all(promises);
        client.emit('debug', `Loaded ${slashCommands.size} public slash commands`);
    }
    /**
     * Registers a single group
     * @param group - A CommandGroup instance
     * or the constructor parameters (with ID, name, and guarded properties)
     * @see CommandoRegistry#registerGroups
     */
    registerGroup(group) {
        const { client, groups } = this;
        // @ts-expect-error: CommandGroup has "no construct signature"
        if (isConstructor(group, group_1.default))
            group = new group(client);
        else if (!(group instanceof group_1.default)) {
            group = new group_1.default(client, group.id, group.name, group.guarded);
        }
        const builtGroup = group;
        const existing = groups.get(builtGroup.id);
        if (existing) {
            existing.name = builtGroup.name;
            client.emit('debug', `Group ${builtGroup.id} is already registered. Renamed it to "${builtGroup.name}".`);
        }
        else {
            groups.set(builtGroup.id, builtGroup);
            client.emit('groupRegister', builtGroup, this);
            client.emit('debug', `Registered group ${builtGroup.id}.`);
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
            throw new TypeError('Groups must be an array.');
        for (const group of groups) {
            this.registerGroup(group);
        }
        return this;
    }
    /**
     * Registers a single command
     * @param command - Either a Command instance, or a constructor for one
     * @see CommandoRegistry#registerCommands
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
            throw new TypeError('Commands must be an array.');
        for (const command of commands) {
            // @ts-expect-error: Command not assignable to 'new () => unknown'
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
     * @see CommandoRegistry#registerTypes
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
            throw new TypeError('Types must be an array.');
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
            const key = util_1.default.removeDashes(k);
            obj[key] = true;
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
            construct: () => Object.prototype,
        })();
        if (!_class)
            return true;
        return func.prototype instanceof _class;
    }
    catch (err) {
        return false;
    }
}
/**
 * Compares old and new slash commands
 * @param oldCommands - The old commands
 * @param newCommands - The new commands
 * @returns `[updated, removed]`
 */
function getUpdatedSlashCommands(oldCommands, newCommands) {
    const created = [];
    const updated = new Map();
    for (const [, newCommand] of newCommands) {
        const appCommand = oldCommands.find(cmd => cmd.name === newCommand.name);
        if (!appCommand) {
            created.push(newCommand);
            continue;
        }
        if (!appCommand.equals(newCommand)) {
            updated.set(appCommand.id, newCommand);
        }
    }
    const removed = oldCommands.filter(cmd => !newCommands.has(cmd.name));
    return {
        created,
        updated,
        removed,
    };
}
//# sourceMappingURL=registry.js.map