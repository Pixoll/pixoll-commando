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
        const { client, commands } = this;
        const slashCommands = util_1.default.filterNullishValues(commands.mapValues(command => ({
            command: command.slashInfo,
            global: !command.testEnv,
        }))).filter((command) => !util_1.default.isNullish(command.command));
        await Promise.all(slashCommands.map(({ command, global }) => this.registerSlashCommand(util_1.default.omit(command, ['deferEphemeral']), global)));
        await this.deleteUnusedSlashCommands(slashCommands);
        const guildOnlyAmount = slashCommands.filter(command => !command.global).size;
        const globalAmount = slashCommands.filter(command => command.global).size;
        if (guildOnlyAmount)
            client.emit('debug', `Loaded ${guildOnlyAmount} guild slash commands`);
        if (globalAmount)
            client.emit('debug', `Loaded ${globalAmount} global slash commands`);
    }
    /** Registers a slash command. */
    async registerSlashCommand(command, global) {
        const { application, options, guilds } = this.client;
        const guild = !global && options.testGuild ? await guilds.fetch(options.testGuild) : null;
        const commandManager = !global && guild ? guild.commands : application.commands;
        const allCommands = await commandManager.fetch({});
        const registeredCommand = allCommands.find(cmd => cmd.name === command.name);
        if (!registeredCommand) {
            await commandManager.create(command);
            return;
        }
        if (!registeredCommand.equals(command)) {
            await registeredCommand.edit(command);
            return;
        }
    }
    /** Deletes any slash commands that have been removed from the program. */
    async deleteUnusedSlashCommands(currentCommands) {
        const client = this.client;
        const { application, options, guilds } = client;
        const guild = !global && options.testGuild ? await guilds.fetch(options.testGuild) : null;
        const registeredCommands = await Promise.all([
            guild?.commands.fetch(),
            application.commands.fetch(),
        ]).then(commands => commands[1].concat(commands[0] ?? new discord_js_1.Collection()));
        const removedCommands = registeredCommands.filter(command => !currentCommands.has(command.name));
        await Promise.all(removedCommands.map(command => command.delete()));
        client.emit('debug', `Deleted ${removedCommands.size} unused slash commands`);
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
    findCommands(searchString = null, exact = false, instances) {
        const { commands } = this;
        if (!searchString) {
            return instances && util_1.default.getInstanceFrom(instances)
                ? commands.filter(cmd => cmd.isUsable(instances)).toJSON()
                : commands.toJSON();
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
        const { commandsPath } = this;
        if (!commandsPath)
            throw new TypeError('Commands path cannot be null or undefined.');
        return path_1.default.join(commandsPath, group, `${memberName}.js`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0QkFBNEI7QUFDNUIsMkNBQXdDO0FBQ3hDLGdEQUF3QjtBQUN4Qiw4REFBcUM7QUFHckMsMkRBQTZFO0FBQzdFLDZEQUE0QztBQUM1QyxtRUFBbUQ7QUFDbkQsd0RBQXdDO0FBQ3hDLGtEQUEwQjtBQTJDMUIsZ0VBQWdFO0FBQ2hFLE1BQXFCLGdCQUFnQjtJQUdqQyxnREFBZ0Q7SUFDekMsUUFBUSxDQUE4QjtJQUM3QyxvREFBb0Q7SUFDN0MsTUFBTSxDQUFtQztJQUNoRCxvREFBb0Q7SUFDN0MsS0FBSyxDQUFtQztJQUMvQywwREFBMEQ7SUFDbkQsWUFBWSxDQUFnQjtJQUNuQyxxREFBcUQ7SUFDOUMsY0FBYyxDQUFpQjtJQUV0Qzs7T0FFRztJQUNILFlBQW1CLE1BQXNCO1FBQ3JDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFRCx1R0FBdUc7SUFDN0YsS0FBSyxDQUFDLHFCQUFxQjtRQUNqQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVsQyxNQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENB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