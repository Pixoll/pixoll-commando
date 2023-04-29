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
    /** Registers every global and guild application command available - this may only be called upon startup. */
    async registerApplicationCommands() {
        const { client, commands } = this;
        const { application, options, guilds } = client;
        const testAppGuild = await guilds.fetch(options.testAppGuild ?? '0').catch(() => null);
        const registeredCommands = await Promise.all([
            testAppGuild?.commands.fetch(),
            application.commands.fetch(),
        ]).then(commands => commands[1].concat(commands[0] ?? new discord_js_1.Collection()));
        const appCommandsToRegister = commands.mapValues(command => ({
            commands: util_1.default.filterNullishItems([command.slashCommand, ...command.contextMenuCommands]),
            global: !command.testAppCommand,
        }));
        await this.deleteUnusedApplicationCommands(appCommandsToRegister, registeredCommands);
        await Promise.all(appCommandsToRegister.map(entry => this.registerApplicationCommandEntry(entry, testAppGuild, registeredCommands)));
        const [globalCounts, guildOnlyCounts] = appCommandsToRegister
            .partition(command => command.global)
            .map(entries => commandsCountByType(entries.toJSON().flatMap(entry => entry.commands)));
        logCommandsCounts(client, guildOnlyCounts, 'Loaded', 'guild');
        logCommandsCounts(client, globalCounts, 'Loaded', 'global');
    }
    /** Registers an application command. */
    async registerApplicationCommandEntry(entry, testAppGuild, registeredCommands) {
        const { commands, global } = entry;
        if (commands.length === 0)
            return;
        const { application } = this.client;
        const commandManager = !global && testAppGuild ? testAppGuild.commands : application.commands;
        await Promise.all(commands.map(async (command) => {
            const rawCommand = 'description' in command ? util_1.default.omit(command, ['deferEphemeral']) : command;
            const registeredCommand = registeredCommands.find(cmd => cmd.name === command.name && cmd.type === rawCommand.type);
            if (!registeredCommand) {
                await commandManager.create(rawCommand);
                return;
            }
            if (!registeredCommand.equals(rawCommand)) {
                // @ts-expect-error: ChannelType.GuildDirectory is never used
                await registeredCommand.edit(rawCommand);
                return;
            }
        }));
    }
    /** Deletes any application commands that have been removed from the program. */
    async deleteUnusedApplicationCommands(currentCommands, registeredCommands) {
        const client = this.client;
        const removedCommands = registeredCommands.filter(command => {
            const currentCommand = currentCommands.get(command.name);
            if (!currentCommand || currentCommand.commands.length === 0)
                return true;
            return !currentCommand.commands.some(cmd => cmd.type === command.type);
        });
        await Promise.all(removedCommands.map(command => command.delete()));
        const commandCounts = commandsCountByType(removedCommands.toJSON());
        logCommandsCounts(client, commandCounts, 'Deleted', 'unused');
    }
    /**
     * Registers a single group
     * @param group - A CommandGroup instance
     * or the constructor parameters (with ID, name, and guarded properties)
     * @see {@link CommandoRegistry.registerGroups CommandoRegistry#registerGroups}
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
     * @see {@link CommandoRegistry.registerCommands CommandoRegistry#registerCommands}
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
        const commandsFolder = (0, require_all_1.default)(options);
        const commands = Object.values(commandsFolder).flatMap(subFolder => Object.values(subFolder));
        if (typeof options === 'string' && !this.commandsPath)
            this.commandsPath = options;
        else if (typeof options === 'object' && !this.commandsPath)
            this.commandsPath = options.dirname;
        return this.registerCommands(commands, true);
    }
    /**
     * Registers a single argument type
     * @param type - Either an ArgumentType instance, or a constructor for one
     * @see {@link CommandoRegistry.registerTypes CommandoRegistry#registerTypes}
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
        const types = Object.values(obj);
        return this.registerTypes(types, true);
    }
    /**
     * Registers the default argument types, groups, and commands. This is equivalent to:
     * ```js
     * registry.registerDefaultTypes()
     *     .registerDefaultGroups()
     *     .registerDefaultCommands();
     * ```
     */
    registerDefaults() {
        return this.registerDefaultTypes()
            .registerDefaultGroups()
            .registerDefaultCommands();
    }
    /** Registers the default groups ("util" and "commands") */
    registerDefaultGroups() {
        return this.registerGroups([
            { id: 'commands', name: 'Commands', guarded: true },
            { id: 'util', name: 'Utility' },
        ]);
    }
    /**
     * Registers the default commands to the registry
     * @param commands - Object specifying which commands to register
     */
    registerDefaultCommands(commands = {}) {
        if (commands.help !== false)
            this.registerCommand(require('./commands/util/help'));
        if (commands.prefix !== false)
            this.registerCommand(require('./commands/util/prefix'));
        if (commands.ping !== false)
            this.registerCommand(require('./commands/util/ping'));
        if (commands.eval !== false)
            this.registerCommand(require('./commands/util/eval'));
        if (commands.unknownCommand !== false)
            this.registerCommand(require('./commands/util/unknown-command'));
        if (commands.commandState !== false) {
            this.registerCommands([
                require('./commands/commands/groups'),
                require('./commands/commands/enable'),
                require('./commands/commands/disable'),
                require('./commands/commands/reload'),
                require('./commands/commands/load'),
                require('./commands/commands/unload'),
            ]);
        }
        return this;
    }
    /**
     * Registers the default argument types to the registry
     * @param types - Object specifying which types to register
     */
    registerDefaultTypes(types = {}) {
        const defaultTypes = Object.keys((0, require_all_1.default)(path_1.default.join(__dirname, '/types')))
            .filter(k => k !== 'base' && k !== 'union')
            .reduce((obj, k) => {
            const key = util_1.default.kebabToCamelCase(k);
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
        client.emit('debug', `Reregistered command ${command.toString()}.`);
    }
    /**
     * Unregisters a command
     * @param command - Command to unregister
     */
    unregisterCommand(command) {
        const { commands, unknownCommand, client } = this;
        const { name } = command;
        commands.delete(name);
        command.group.commands.delete(name);
        if (unknownCommand === command)
            this.unknownCommand = null;
        client.emit('commandUnregister', command);
        client.emit('debug', `Unregistered command ${command.toString()}.`);
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
        if (!searchString)
            return context
                ? commands.filter(cmd => cmd.isUsable(context)).toJSON()
                : commands.toJSON();
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
        || cmd.toString() === search;
}
function commandFilterInexact(search) {
    return (cmd) => cmd.name.includes(search)
        || cmd.toString() === search
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
/**
 * `0`: Chat input
 * `1`: User context
 * `2`: Message context
 */
function commandsCountByType(commands) {
    return commands.reduce((grouped, command) => {
        const index = (command.type?.valueOf() ?? 1) - 1;
        grouped[index]++;
        return grouped;
    }, [0, 0, 0]);
}
function logCommandsCounts(client, counts, prefix, suffix) {
    if (counts[0])
        client.emit('debug', `${prefix} ${counts[0]} ${suffix} chat input commands`);
    if (counts[1])
        client.emit('debug', `${prefix} ${counts[1]} ${suffix} user context commands`);
    if (counts[2])
        client.emit('debug', `${prefix} ${counts[2]} ${suffix} message context commands`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0QkFBNEI7QUFDNUIsMkNBS29CO0FBQ3BCLGdEQUF3QjtBQUN4Qiw4REFBcUM7QUFHckMsMkRBQTJFO0FBQzNFLDZEQUE0QztBQUU1QyxtRUFBbUQ7QUFDbkQsd0RBQXdDO0FBQ3hDLGtEQUE4RTtBQTZFOUUsZ0VBQWdFO0FBQ2hFLE1BQXFCLGdCQUFnQjtJQUdqQyxnREFBZ0Q7SUFDekMsUUFBUSxDQUE4QjtJQUM3QyxvREFBb0Q7SUFDN0MsTUFBTSxDQUFtQztJQUNoRCxvREFBb0Q7SUFDN0MsS0FBSyxDQUFtQztJQUMvQywwREFBMEQ7SUFDbkQsWUFBWSxDQUFnQjtJQUNuQyxxREFBcUQ7SUFDOUMsY0FBYyxDQUFpQjtJQUV0Qzs7T0FFRztJQUNILFlBQW1CLE1BQXNCO1FBQ3JDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFRCw2R0FBNkc7SUFDbkcsS0FBSyxDQUFDLDJCQUEyQjtRQUN2QyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNsQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUE4QixDQUFDO1FBRXhFLE1B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