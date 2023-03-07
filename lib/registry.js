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
        if (isConstructor(command, base_1.default))
            command = new command(client);
        else if ('default' in command && isConstructor(command.default, base_1.default)) {
            command = new command.default(client);
        }
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
            const valid = isConstructor(command, base_1.default)
                || ('default' in command && (isConstructor(command.default, base_1.default)
                    || (command.default instanceof base_1.default)))
                || (command instanceof base_1.default);
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
        if (isConstructor(type, base_2.default))
            type = new type(client);
        else if ('default' in type && isConstructor(type.default, base_2.default)) {
            type = new type.default(client);
        }
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
            const valid = isConstructor(type, base_2.default)
                || ('default' in type && (isConstructor(type.default, base_2.default)
                    || (type.default instanceof base_2.default)))
                || (type instanceof base_2.default);
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
        if (isConstructor(command, base_1.default))
            command = new command(client);
        else if ('default' in command && isConstructor(command.default, base_1.default)) {
            command = new command.default(client);
        }
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
     * @param context - The context to check usability against
     * @return All commands that are found
     */
    findCommands(searchString = null, exact = false, context) {
        const { commands } = this;
        if (!searchString) {
            return context
                ? commands.filter(cmd => cmd.isUsable(context)).toJSON()
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
function isConstructor(value, construct) {
    try {
        new new Proxy(value, {
            construct: () => Object.prototype,
        })();
        if (!construct)
            return true;
        return value.prototype instanceof construct;
    }
    catch (err) {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0QkFBNEI7QUFDNUIsMkNBQXdDO0FBQ3hDLGdEQUF3QjtBQUN4Qiw4REFBcUM7QUFHckMsMkRBQTJFO0FBQzNFLDZEQUE0QztBQUM1QyxtRUFBbUQ7QUFDbkQsd0RBQXdDO0FBQ3hDLGtEQUF1RTtBQTJDdkUsZ0VBQWdFO0FBQ2hFLE1BQXFCLGdCQUFnQjtJQUdqQyxnREFBZ0Q7SUFDekMsUUFBUSxDQUE4QjtJQUM3QyxvREFBb0Q7SUFDN0MsTUFBTSxDQUFtQztJQUNoRCxvREFBb0Q7SUFDN0MsS0FBSyxDQUFtQztJQUMvQywwREFBMEQ7SUFDbkQsWUFBWSxDQUFnQjtJQUNuQyxxREFBcUQ7SUFDOUMsY0FBYyxDQUFpQjtJQUV0Qzs7T0FFRztJQUNILFlBQW1CLE1BQXNCO1FBQ3JDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFRCx1R0FBdUc7SUFDN0YsS0FBSyxDQUFDLHFCQUFxQjtRQUNqQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVsQyxNQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENB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