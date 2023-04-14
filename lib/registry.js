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
        const guildOnlyAmount = appCommandsToRegister
            .filter(command => !command.global)
            .reduce((amount, entry) => amount + entry.commands.length, 0);
        const globalAmount = appCommandsToRegister
            .filter(command => command.global)
            .reduce((amount, entry) => amount + entry.commands.length, 0);
        if (guildOnlyAmount)
            client.emit('debug', `Loaded ${guildOnlyAmount} guild application commands`);
        if (globalAmount)
            client.emit('debug', `Loaded ${globalAmount} global application commands`);
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
        const removedAmount = removedCommands.size;
        if (removedAmount)
            client.emit('debug', `Deleted ${removedAmount} unused application commands`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0QkFBNEI7QUFDNUIsMkNBS29CO0FBQ3BCLGdEQUF3QjtBQUN4Qiw4REFBcUM7QUFHckMsMkRBQTJFO0FBQzNFLDZEQUE0QztBQUU1QyxtRUFBbUQ7QUFDbkQsd0RBQXdDO0FBQ3hDLGtEQUF1RTtBQTZFdkUsZ0VBQWdFO0FBQ2hFLE1BQXFCLGdCQUFnQjtJQUdqQyxnREFBZ0Q7SUFDekMsUUFBUSxDQUE4QjtJQUM3QyxvREFBb0Q7SUFDN0MsTUFBTSxDQUFtQztJQUNoRCxvREFBb0Q7SUFDN0MsS0FBSyxDQUFtQztJQUMvQywwREFBMEQ7SUFDbkQsWUFBWSxDQUFnQjtJQUNuQyxxREFBcUQ7SUFDOUMsY0FBYyxDQUFpQjtJQUV0Qzs7T0FFRztJQUNILFlBQW1CLE1BQXNCO1FBQ3JDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFFRCw2R0FBNkc7SUFDbkcsS0FBSyxDQUFDLDJCQUEyQjtRQUN2QyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNsQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUE4QixDQUFDO1FBRXhFLE1BQU0sWUFBWSxHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQXlCLENBQUM7UUFDL0csTUFBTSxrQkFBa0IsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDekMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDOUIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7U0FDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksdUJBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6RSxNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQTBCLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRixRQUFRLEVBQUUsY0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3pGLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjO1NBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBRUosTUFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMscUJBQXFCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN0RixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ2hELElBQUksQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQ2hGLENBQUMsQ0FBQztRQUVILE1BQU0sZUFBZSxHQUFHLHFCQUFxQjthQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7YUFDbEMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sWUFBWSxHQUFHLHFCQUFxQjthQUNyQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQ2pDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVsRSxJQUFJLGVBQWU7WUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLGVBQWUsNkJBQTZCLENBQUMsQ0FBQztRQUNsRyxJQUFJLFlBQVk7WUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLFlBQVksOEJBQThCLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsd0NBQXdDO0lBQzlCLEtBQUssQ0FBQywrQkFBK0IsQ0FDM0MsS0FBOEIsRUFDOUIsWUFBa0MsRUFDbEMsa0JBQTBEO1FBRTFELE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ25DLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTztRQUVsQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQThCLENBQUM7UUFDNUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFNLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBRTlGLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtZQUMzQyxNQUFNLFVBQVUsR0FBRyxhQUFhLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQy9GLE1BQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQ3BELEdBQUcsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxJQUFJLENBQzVELENBQUM7WUFDRixJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3BCLE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDeEMsT0FBTzthQUNWO1lBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxVQUFtQyxDQUFDLEVBQUU7Z0JBQ2hFLDZEQUE2RDtnQkFDN0QsTUFBTSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pDLE9BQU87YUFDVjtRQUNMLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsZ0ZBQWdGO0lBQ3RFLEtBQUssQ0FBQywrQkFBK0IsQ0FDM0MsZUFBNEQsRUFDNUQsa0JBQTBEO1FBRTFELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUE4QixDQUFDO1FBRW5ELE1BQU0sZUFBZSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN4RCxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsY0FBYyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDekUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEUsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQztRQUMzQyxJQUFJLGFBQWE7WUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLGFBQWEsOEJBQThCLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxhQUFhLENBQUMsS0FBc0U7UUFDdkYsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFaEMsSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFLGVBQVksQ0FBQztZQUFFLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM3RCxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksZUFBWSxDQUFDLEVBQUU7WUFDdkMsS0FBSyxHQUFHLElBQUksZUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsTUFBTSxVQUFVLEdBQUcsS0FBcUIsQ0FBQztRQUV6QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLFFBQVEsRUFBRTtZQUNWLFFBQVEsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztZQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLFVBQVUsQ0FBQyxFQUFFLDBDQUEwQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztTQUM3RzthQUFNO1lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsVUFBVSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDOUQ7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ksY0FBYyxDQUFDLE1BQThFO1FBQ2hHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUM1RSxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxlQUFlLENBQUMsT0FBZ0I7UUFDbkMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUUxRCxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsY0FBTyxDQUFDO1lBQUUsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlELElBQUksU0FBUyxJQUFJLE9BQU8sSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxjQUFPLENBQUMsRUFBRTtZQUN0RSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxDQUFDLENBQUMsT0FBTyxZQUFZLGNBQU8sQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFckcsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFaEUsdUNBQXVDO1FBQ3ZDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDdkUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsSUFBSSwwQkFBMEIsQ0FBQyxDQUFDO1NBQ3JGO1FBQ0QsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7WUFDekIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDekUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsS0FBSywwQkFBMEIsQ0FBQyxDQUFDO2FBQ3RGO1NBQ0o7UUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsS0FBSztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxPQUFPLHNCQUFzQixDQUFDLENBQUM7UUFDckUsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLEVBQUU7WUFDM0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsVUFBVSw4QkFBOEIsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDMUc7UUFDRCxJQUFJLE9BQU8sSUFBSSxjQUFjO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBRTVGLGtCQUFrQjtRQUNsQixPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN0QixLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUIsSUFBSSxPQUFPO1lBQUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7UUFFM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLEtBQUssQ0FBQyxFQUFFLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUV0RSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLGdCQUFnQixDQUFDLFFBQW1CLEVBQUUsYUFBYSxHQUFHLEtBQUs7UUFDOUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ2hGLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO1lBQzVCLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEVBQUUsY0FBTyxDQUFDO21CQUN0QyxDQUFDLFNBQVMsSUFBSSxPQUFPLElBQUksQ0FDeEIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsY0FBTyxDQUFDO3VCQUNwQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLFlBQVksY0FBTyxDQUFDLENBQzFDLENBQUM7bUJBQ0MsQ0FBQyxPQUFPLFlBQVksY0FBTyxDQUFDLENBQUM7WUFFcEMsSUFBSSxhQUFhLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxxREFBcUQsT0FBTyxZQUFZLENBQUMsQ0FBQztnQkFDbkcsU0FBUzthQUNaO1lBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxrQkFBa0IsQ0FBQyxPQUFtQztRQUN6RCxNQUFNLGNBQWMsR0FBNEMsSUFBQSxxQkFBVSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzlGLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7WUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQzthQUM5RSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZO1lBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2hHLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFlBQVksQ0FBQyxJQUFrQjtRQUNsQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztRQUUvQixJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUUsY0FBWSxDQUFDO1lBQUUsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFELElBQUksU0FBUyxJQUFJLElBQUksSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFZLENBQUMsRUFBRTtZQUNyRSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLGNBQVksQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLElBQUksRUFBRSxDQUFDLENBQUM7UUFFakcsdUNBQXVDO1FBQ3ZDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsSUFBSSxDQUFDLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztRQUU1RyxlQUFlO1FBQ2YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSw0QkFBNEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFN0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxhQUFhLENBQUMsS0FBcUIsRUFBRSxhQUFhLEdBQUcsS0FBSztRQUM3RCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDMUUsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDdEIsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxjQUFZLENBQUM7bUJBQ3hDLENBQUMsU0FBUyxJQUFJLElBQUksSUFBSSxDQUNyQixhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFZLENBQUM7dUJBQ3RDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxjQUFZLENBQUMsQ0FBQyxDQUM3QzttQkFDRSxDQUFDLElBQUksWUFBWSxjQUFZLENBQUMsQ0FBQztZQUV0QyxJQUFJLGFBQWEsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLDJEQUEyRCxJQUFJLFlBQVksQ0FBQyxDQUFDO2dCQUN0RyxTQUFTO2FBQ1o7WUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGVBQWUsQ0FBQyxPQUFtQztRQUN0RCxNQUFNLEdBQUcsR0FBRyxJQUFBLHFCQUFVLEVBQUMsT0FBTyxDQUFpQyxDQUFDO1FBQ2hFLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLGdCQUFnQjtRQUNuQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsRUFBRTthQUM3QixxQkFBcUIsRUFBRTthQUN2Qix1QkFBdUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFRCwyREFBMkQ7SUFDcEQscUJBQXFCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUN2QixFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO1lBQ25ELEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO1NBQ2xDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSSx1QkFBdUIsQ0FBQyxXQUFtQyxFQUFFO1FBQ2hFLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxLQUFLO1lBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQ25GLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxLQUFLO1lBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxLQUFLO1lBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQ25GLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxLQUFLO1lBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQ25GLElBQUksUUFBUSxDQUFDLGNBQWMsS0FBSyxLQUFLO1lBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO1FBQ3hHLElBQUksUUFBUSxDQUFDLFlBQVksS0FBSyxLQUFLLEVBQUU7WUFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO2dCQUNsQixPQUFPLENBQUMsNEJBQTRCLENBQUM7Z0JBQ3JDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQztnQkFDckMsT0FBTyxDQUFDLDZCQUE2QixDQUFDO2dCQUN0QyxPQUFPLENBQUMsNEJBQTRCLENBQUM7Z0JBQ3JDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQztnQkFDbkMsT0FBTyxDQUFDLDRCQUE0QixDQUFDO2FBQ3hDLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLG9CQUFvQixDQUFDLFFBQTZCLEVBQUU7UUFDdkQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFBLHFCQUFVLEVBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUN2RSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUM7YUFDMUMsTUFBTSxDQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxNQUFNLEdBQUcsR0FBRyxjQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBOEIsQ0FBQztZQUM5RCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFbkMsS0FBSyxJQUFJLElBQUksSUFBSSxZQUFZLEVBQUU7WUFDM0IsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUM3QixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDdEQ7WUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNqRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksaUJBQWlCLENBQUMsT0FBZ0IsRUFBRSxVQUFtQjtRQUMxRCxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFbEQsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLGNBQU8sQ0FBQztZQUFFLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM5RCxJQUFJLFNBQVMsSUFBSSxPQUFPLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsY0FBTyxDQUFDLEVBQUU7WUFDdEUsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QztRQUNELElBQUksQ0FBQyxDQUFDLE9BQU8sWUFBWSxjQUFPLENBQUM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXJHLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFdkQsSUFBSSxJQUFJLEtBQUssVUFBVSxDQUFDLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDN0UsSUFBSSxPQUFPLEtBQUssVUFBVSxDQUFDLE9BQU87WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDcEYsSUFBSSxVQUFVLEtBQUssVUFBVSxDQUFDLFVBQVU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFDL0YsSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxVQUFVLEVBQUU7WUFDL0MsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1NBQ2hFO1FBRUQsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUIsSUFBSSxjQUFjLEtBQUssVUFBVTtZQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzlELElBQUksT0FBTztZQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHdCQUF3QixPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRDs7O09BR0c7SUFDSSxpQkFBaUIsQ0FBQyxPQUFnQjtRQUNyQyxNQUFNLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDbEQsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUV6QixRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLGNBQWMsS0FBSyxPQUFPO1lBQUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFFM0QsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxVQUFVLENBQUMsZUFBOEIsSUFBSSxFQUFFLEtBQUssR0FBRyxLQUFLO1FBQy9ELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUUxQyxtQkFBbUI7UUFDbkIsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQy9CLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUNwRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1gsSUFBSSxLQUFLO1lBQUUsT0FBTyxhQUFhLENBQUM7UUFFaEMsZ0NBQWdDO1FBQ2hDLEtBQUssTUFBTSxLQUFLLElBQUksYUFBYSxFQUFFO1lBQy9CLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxRQUFRO2dCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN0RjtRQUNELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksWUFBWSxDQUFDLEtBQTZCO1FBQzdDLElBQUksS0FBSyxZQUFZLGVBQVk7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNoRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3QztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksWUFBWSxDQUFDLGVBQThCLElBQUksRUFBRSxLQUFLLEdBQUcsS0FBSyxFQUFFLE9BQXdCO1FBQzNGLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDMUIsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPLE9BQU87Z0JBQzdCLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDeEQsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUV4QixtQkFBbUI7UUFDbkIsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQ25DLEtBQUssQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUN4RSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ1gsSUFBSSxLQUFLO1lBQUUsT0FBTyxlQUFlLENBQUM7UUFFbEMsZ0NBQWdDO1FBQ2hDLEtBQUssTUFBTSxPQUFPLElBQUksZUFBZSxFQUFFO1lBQ25DLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFDLEVBQUU7Z0JBQzdFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNwQjtTQUNKO1FBRUQsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxjQUFjLENBQUMsT0FBMEI7UUFDNUMsSUFBSSxPQUFPLFlBQVksY0FBTztZQUFFLE9BQU8sT0FBTyxDQUFDO1FBQy9DLElBQUksT0FBTyxZQUFZLGlCQUFlLElBQUksT0FBTyxDQUFDLE9BQU87WUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDbEYsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakQ7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksa0JBQWtCLENBQUMsS0FBYSxFQUFFLFVBQWtCO1FBQ3ZELE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLFlBQVk7WUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7UUFDckYsT0FBTyxjQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsR0FBRyxVQUFVLEtBQUssQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDSjtBQTVmRCxtQ0E0ZkM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLE1BQWM7SUFDcEMsT0FBTyxDQUFDLEdBQWlCLEVBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDO0FBQ2xHLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLE1BQWM7SUFDdEMsT0FBTyxDQUFDLEdBQWlCLEVBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlHLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLE1BQWM7SUFDdEMsT0FBTyxDQUFDLEdBQVksRUFBVyxFQUFFLENBQzdCLEdBQUcsQ0FBQyxJQUFJLEtBQUssTUFBTTtXQUNoQixHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLENBQUM7V0FDeEMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU0sQ0FBQztBQUNyQyxDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxNQUFjO0lBQ3hDLE9BQU8sQ0FBQyxHQUFZLEVBQVcsRUFBRSxDQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7V0FDdEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLE1BQU07V0FDekIsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUNsQixLQUErQixFQUFFLFNBQTJCO0lBRTVELElBQUk7UUFDQSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQTJCLEVBQUU7WUFDdkMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO1NBQ3BDLENBQUMsRUFBRSxDQUFDO1FBQ0wsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUM1QixPQUFRLEtBQTRCLENBQUMsU0FBUyxZQUFZLFNBQVMsQ0FBQztLQUN2RTtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDIn0=