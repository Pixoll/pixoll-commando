/* eslint-disable new-cap */
import { ApplicationCommand, ApplicationCommandOption, Collection } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody as RestAPIApplicationCommand } from 'discord-api-types/rest/v9';
import path from 'path';
import requireAll from 'require-all';
import CommandoClient from './client';
import Command, { CommandInstances } from './commands/base';
import CommandGroup from './commands/group';
import CommandoMessage from './extensions/message';
import ArgumentType from './types/base';
import Util from './util';

declare function require(id: string): unknown;

interface RequireAllOptions {
    dirname: string;
    filter?: RegExp | ((name: string, path: string) => string | false);
    excludeDirs?: RegExp;
    map?: ((name: string, path: string) => string);
    resolve?: ((module: unknown) => unknown);
    recursive?: boolean;
}

/** Object specifying which types to register */
interface DefaultTypesOptions {
    /**
     * Whether to register the built-in string type
     * @default true
     */
    string?: boolean;
    /**
     * Whether to register the built-in integer type
     * @default true
     */
    integer?: boolean;
    /**
     * Whether to register the built-in float type
     * @default true
     */
    float?: boolean;
    /**
     * Whether to register the built-in boolean type
     * @default true
     */
    boolean?: boolean;
    /**
     * Whether to register the built-in duration type
     * @default true
     */
    duration?: boolean;
    /**
     * Whether to register the built-in date type
     * @default true
     */
    date?: boolean;
    /**
     * Whether to register the built-in time type
     * @default true
     */
    time?: boolean;
    /**
     * Whether to register the built-in user type
     * @default true
     */
    user?: boolean;
    /**
     * Whether to register the built-in member type
     * @default true
     */
    member?: boolean;
    /**
     * Whether to register the built-in role type
     * @default true
     */
    role?: boolean;
    /**
     * Whether to register the built-in channel type
     * @default true
     */
    channel?: boolean;
    /**
     * Whether to register the built-in text-channel type
     * @default true
     */
    textChannel?: boolean;
    /**
     * Whether to register the built-in thread-channel type
     * @default true
     */
    threadChannel?: boolean;
    /**
     * Whether to register the built-in voice-channel type
     * @default true
     */
    voiceChannel?: boolean;
    /**
     * Whether to register the built-in stage-channel type
     * @default true
     */
    stageChannel?: boolean;
    /**
     * Whether to register the built-in category-channel type
     * @default true
     */
    categoryChannel?: boolean;
    /**
     * Whether to register the built-in message type
     * @default true
     */
    message?: boolean;
    /**
     * Whether to register the built-in invite type
     * @default true
     */
    invite?: boolean;
    /**
     * Whether to register the built-in custom-emoji type
     * @default true
     */
    customEmoji?: boolean;
    /**
     * Whether to register the built-in default-emoji type
     * @default true
     */
    defaultEmoji?: boolean;
    /**
     * Whether to register the built-in command type
     * @default true
     */
    command?: boolean;
    /**
     * Whether to register the built-in group type
     * @default true
     */
    group?: boolean;
}

/**
 * A CommandResolvable can be:
 * - A {@link Command}
 * - A command name
 * - A {@link CommandoMessage}
 */
export type CommandResolvable = Command | CommandoMessage | string;

/**
 * A CommandGroupResolvable can be:
 * - A {@link CommandGroup}
 * - A group ID
 */
export type CommandGroupResolvable = CommandGroup | string;

/** Handles registration and searching of commands and groups */
export default class CommandoRegistry {
    /** The client this registry is for */
    public readonly client!: CommandoClient;
    /** Registered commands, mapped by their name */
    public commands: Collection<string, Command>;
    /** Registered command groups, mapped by their ID */
    public groups: Collection<string, CommandGroup>;
    /** Registered argument types, mapped by their ID */
    public types: Collection<string, ArgumentType>;
    /** Fully resolved path to the bot's commands directory */
    public commandsPath: string | null;
    /** Command to run when an unknown command is used */
    public unknownCommand: Command | null;

    /**
     * @param client - Client to use
     */
    public constructor(client: CommandoClient) {
        Object.defineProperty(this, 'client', { value: client });

        this.commands = new Collection();
        this.groups = new Collection();
        this.types = new Collection();
        this.commandsPath = null;
        this.unknownCommand = null;
    }

    /** Registers every client and guild slash command available - this may only be called upon startup. */
    protected async registerSlashCommands(): Promise<void> {
        const { commands, client } = this;
        const { application, options, guilds } = client;

        // @ts-expect-error: _slashToAPI should only be accessed inside of Command
        const testCommands = commands.filter(cmd => cmd.test && !!cmd.slash).map(cmd => cmd._slashToAPI!);
        if (testCommands.length !== 0) {
            if (typeof options.testGuild !== 'string') throw new TypeError('Client testGuild must be a string.');

            const guild = guilds.resolve(options.testGuild);
            if (!guild) throw new TypeError('Client testGuild must be a valid Guild ID.');

            const current = await guild.commands.fetch();
            const [updated, removed] = getUpdatedSlashCommands(current.toJSON(), testCommands);
            const promises: Array<Promise<ApplicationCommand | null>> = [];
            for (const command of updated) {
                const match = current.find(cmd => cmd.name === command.name);
                if (match) {
                    promises.push(guild.commands.edit(match, command));
                } else {
                    promises.push(guild.commands.create(command));
                }
            }
            for (const command of removed) {
                const match = current.find(cmd => cmd.name === command.name);
                if (match) promises.push(guild.commands.delete(match));
            }
            await Promise.all(promises);

            client.emit('debug', `Loaded ${testCommands.length} guild slash commands`);
        }

        // @ts-expect-error: _slashToAPI should only be accessed inside of Command
        const slashCommands = commands.filter(cmd => !cmd.test && !!cmd.slash).map(cmd => cmd._slashToAPI!);
        if (slashCommands.length === 0) return;

        const current = await application!.commands.fetch();
        const [updated, removed] = getUpdatedSlashCommands(current.toJSON(), slashCommands);
        const promises: Array<Promise<ApplicationCommand | null>> = [];
        for (const command of updated) {
            const match = current.find(cmd => cmd.name === command.name);
            if (match) {
                promises.push(application!.commands.edit(match, command));
            } else {
                promises.push(application!.commands.create(command));
            }
        }
        for (const command of removed) {
            const match = current.find(cmd => cmd.name === command.name);
            if (match) promises.push(application!.commands.delete(match));
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
    public registerGroup(group: CommandGroup | { id: string, name?: string, guarded?: boolean }): this {
        const { client, groups } = this;

        // @ts-expect-error: CommandGroup has "no construct signature"
        if (isConstructor(group, CommandGroup)) group = new group(client);
        else if (!(group instanceof CommandGroup)) {
            group = new CommandGroup(client, group.id, group.name, group.guarded);
        }

        const existing = groups.get(group.id);
        if (existing) {
            existing.name = group.name!;
            client.emit('debug', `Group ${group.id} is already registered. Renamed it to "${group.name}".`);
        } else {
            groups.set(group.id, group as CommandGroup);
            /**
             * Emitted when a group is registered
             * @event CommandoClient#groupRegister
             * @param {CommandGroup} group - Group that was registered
             * @param {CommandoRegistry} registry - Registry that the group was registered to
             */
            client.emit('groupRegister', group as CommandGroup, this);
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
    public registerGroups(groups: Array<CommandGroup | { id: string, name?: string, guarded?: boolean }>): this {
        if (!Array.isArray(groups)) throw new TypeError('Groups must be an Array.');
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
    public registerCommand(command: Command): this {
        const { client, commands, groups, unknownCommand } = this;

        // @ts-expect-error: Command has "no construct signature"
        if (isConstructor(command, Command)) command = new command(client);
        // @ts-expect-error: default doesn't exist in Command
        else if (isConstructor(command.default, Command)) command = new command.default(client);
        if (!(command instanceof Command)) throw new Error(`Invalid command object to register: ${command}`);

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
        if (!group) throw new Error(`Group "${groupId}" is not registered.`);
        if (group.commands.some(cmd => cmd.memberName === memberName)) {
            throw new Error(`A command with the member name "${memberName}" is already registered in ${group.id}`);
        }
        if (unknown && unknownCommand) throw new Error('An unknown command is already registered.');

        // Add the command
        command.group = group;
        group.commands.set(name, command);
        commands.set(name, command);
        if (unknown) this.unknownCommand = command;

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
    public registerCommands(commands: Command[], ignoreInvalid = false): this {
        if (!Array.isArray(commands)) throw new TypeError('Commands must be an Array.');
        for (const command of commands) {
            // @ts-expect-error: Command not assignable to 'new () => unknown'
            const valid = isConstructor(command, Command) || isConstructor(command.default, Command)
                // @ts-expect-error: default doesn't exist in never
                || (command instanceof Command) || (command.default instanceof Command);

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
    public registerCommandsIn(options: RequireAllOptions | string): this {
        const obj = requireAll(options) as Record<string, Record<string, Command>>;
        const commands: Command[] = [];
        for (const group of Object.values(obj)) {
            for (const command of Object.values(group)) {
                commands.push(command);
            }
        }
        if (typeof options === 'string' && !this.commandsPath) this.commandsPath = options;
        else if (typeof options === 'object' && !this.commandsPath) this.commandsPath = options.dirname;
        return this.registerCommands(commands, true);
    }

    /**
     * Registers a single argument type
     * @param type - Either an ArgumentType instance, or a constructor for one
     * @see {@link CommandoRegistry#registerTypes}
     */
    public registerType(type: ArgumentType): this {
        const { client, types } = this;

        // @ts-expect-error: ArgumentType has "no construct signature"
        if (isConstructor(type, ArgumentType)) type = new type(client);
        // @ts-expect-error: default doesn't exist in ArgumentType
        else if (isConstructor(type.default, ArgumentType)) type = new type.default(client);
        if (!(type instanceof ArgumentType)) throw new Error(`Invalid type object to register: ${type}`);

        // Make sure there aren't any conflicts
        if (types.has(type.id)) throw new Error(`An argument type with the ID "${type.id}" is already registered.`);

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
    public registerTypes(types: ArgumentType[], ignoreInvalid = false): this {
        if (!Array.isArray(types)) throw new TypeError('Types must be an Array.');
        for (const type of types) {
            // @ts-expect-error: ArgumentType not assignable to 'new () => unknown'
            const valid = isConstructor(type, ArgumentType) || isConstructor(type.default, ArgumentType)
                // @ts-expect-error: default doesn't exist in never
                || (type instanceof ArgumentType) || (type.default instanceof ArgumentType);

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
    public registerTypesIn(options: RequireAllOptions | string): this {
        const obj = requireAll(options);
        const types = [];
        for (const type of Object.values(obj)) types.push(type);
        return this.registerTypes(types, true);
    }

    /**
     * Registers the default argument types to the registry
     * @param types - Object specifying which types to register
     */
    public registerDefaultTypes(types: DefaultTypesOptions = {}): this {
        const defaultTypes = Object.keys(requireAll(path.join(__dirname, '/types')))
            .filter(k => k !== 'base' && k !== 'union')
            .reduce<DefaultTypesOptions>((obj, k) => {
                // @ts-expect-error: no string index
                obj[Util.removeDashes(k)] = true;
                return obj;
            }, {});
        Object.assign(defaultTypes, types);

        for (let type in defaultTypes) {
            if (type !== type.toLowerCase()) {
                type = type.replace(/[A-Z]/g, '-$&').toLowerCase();
            }

            this.registerType(require(`./types/${type}`) as ArgumentType);
        }

        return this;
    }

    /**
     * Reregisters a command (does not support changing name, group, or memberName)
     * @param command - New command
     * @param oldCommand - Old command
     */
    public reregisterCommand(command: Command, oldCommand: Command): void {
        const { client, commands, unknownCommand } = this;

        // @ts-expect-error: Command has "no construct signature"
        if (isConstructor(command, Command)) command = new command(client);
        // @ts-expect-error: default doesn't exist in Command
        else if (isConstructor(command.default, Command)) command = new command.default(client);
        if (!(command instanceof Command)) throw new Error(`Invalid command object to register: ${command}`);

        const { name, groupId, memberName, unknown } = command;

        if (name !== oldCommand.name) throw new Error('Command name cannot change.');
        if (groupId !== oldCommand.groupId) throw new Error('Command group cannot change.');
        if (memberName !== oldCommand.memberName) throw new Error('Command memberName cannot change.');
        if (unknown && this.unknownCommand !== oldCommand) {
            throw new Error('An unknown command is already registered.');
        }

        command.group = this.resolveGroup(groupId);
        command.group.commands.set(name, command);
        commands.set(name, command);
        if (unknownCommand === oldCommand) this.unknownCommand = null;
        if (unknown) this.unknownCommand = command;

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
    public unregisterCommand(command: Command): void {
        const { commands, unknownCommand, client } = this;
        const { name, groupId, memberName } = command;

        commands.delete(name);
        command.group!.commands.delete(name);
        if (unknownCommand === command) this.unknownCommand = null;

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
    public findGroups(searchString: string | null = null, exact = false): CommandGroup[] {
        const { groups } = this;
        if (!searchString) return groups.toJSON();

        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedGroups = groups.filter(
            exact ? groupFilterExact(lcSearch) : groupFilterInexact(lcSearch)
        ).toJSON();
        if (exact) return matchedGroups;

        // See if there's an exact match
        for (const group of matchedGroups) {
            if (group.name.toLowerCase() === lcSearch || group.id === lcSearch) return [group];
        }
        return matchedGroups;
    }

    /**
     * Resolves a CommandGroupResolvable to a CommandGroup object
     * @param group - The group to resolve
     * @return The resolved CommandGroup
     */
    public resolveGroup(group: CommandGroupResolvable): CommandGroup {
        if (group instanceof CommandGroup) return group;
        if (typeof group === 'string') {
            const groups = this.findGroups(group, true);
            if (groups.length === 1) return groups[0];
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
    public findCommands(searchString: string | null = null, exact = false, instances: CommandInstances = {}): Command[] {
        const { commands } = this;
        const { message, interaction } = instances;
        if (!searchString) {
            return message ?? interaction ?
                commands.filter(cmd => cmd.isUsable({ message, interaction })).toJSON() :
                commands.toJSON();
        }

        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedCommands = commands.filter(
            exact ? commandFilterExact(lcSearch) : commandFilterInexact(lcSearch)
        ).toJSON();
        if (exact) return matchedCommands;

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
    public resolveCommand(command: CommandResolvable): Command {
        if (command instanceof Command) return command;
        if (command instanceof CommandoMessage && command.command) return command.command;
        if (typeof command === 'string') {
            const commands = this.findCommands(command, true);
            if (commands.length === 1) return commands[0];
        }
        throw new Error('Unable to resolve command.');
    }

    /**
     * Resolves a command file path from a command's group ID and memberName
     * @param group - ID of the command's group
     * @param memberName - Member name of the command
     * @return Fully-resolved path to the corresponding command file
     */
    public resolveCommandPath(group: string, memberName: string): string {
        return path.join(this.commandsPath!, group, `${memberName}.js`);
    }
}

function groupFilterExact(search: string) {
    return (grp: CommandGroup): boolean => grp.id === search || grp.name.toLowerCase() === search;
}

function groupFilterInexact(search: string) {
    return (grp: CommandGroup): boolean => grp.id.includes(search) || grp.name.toLowerCase().includes(search);
}

function commandFilterExact(search: string) {
    return (cmd: Command): boolean =>
        cmd.name === search
        || cmd.aliases?.some(ali => ali === search)
        || `${cmd.groupId}:${cmd.memberName}` === search;
}

function commandFilterInexact(search: string) {
    return (cmd: Command): boolean =>
        cmd.name.includes(search)
        || `${cmd.groupId}:${cmd.memberName}` === search
        || cmd.aliases?.some(ali => ali.includes(search));
}

function isConstructor(func: { new(): unknown }, _class: () => unknown): boolean {
    try {
        new new Proxy(func, {
            construct: () => Object.prototype
        })();
        if (!_class) return true;
        return func.prototype instanceof _class;
    } catch (err) {
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
function getUpdatedSlashCommands(
    oldCommands: ApplicationCommand[] = [], newCommands: RestAPIApplicationCommand[] = []
): RestAPIApplicationCommand[][] {
    oldCommands = JSON.parse(JSON.stringify(oldCommands));
    newCommands = JSON.parse(JSON.stringify(newCommands));

    oldCommands.forEach(apiCommand => {
        for (const prop in apiCommand) {
            if (['name', 'description', 'options'].includes(prop)) continue;
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

    const map1 = new Map() as Map<string, boolean>;
    // @ts-expect-error: no string index
    oldCommands.forEach(el => map1.set(JSON.stringify(orderObjProps(el)), true));
    // @ts-expect-error: no string index
    const updated = newCommands.filter(el => !map1.has(JSON.stringify(orderObjProps(el))));

    const map2 = new Map() as Map<string, boolean>;
    newCommands.forEach(el => map2.set(el.name, true));
    // @ts-expect-error: conversion of types might be mistake because of insufficiently overlapping
    const removed = oldCommands.filter(el => !map2.has(el.name)) as RestAPIApplicationCommand[];

    return [updated, removed];
}

/**
 * @param options - The options to parse
 */
function parseApiCmdOptions(options: ApplicationCommandOption[]): void {
    options.forEach(option => {
        // @ts-expect-error: required does not exist in some sub-types
        if (option.required === false) delete option.required;

        for (const prop in option) {
            // @ts-expect-error: no string index
            if (typeof option[prop] === 'undefined') {
                // @ts-expect-error: no string index
                delete option[prop];
                continue;
            }
            if (prop.toLowerCase() === prop) continue;
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
        if ('options' in option && option.options) parseApiCmdOptions(option.options);
    });
}

type Obj = { [key: string]: (Obj | Obj[] | string) };

function orderObjProps(obj: Obj): Obj {
    const ordered: Obj = {};
    for (const key of Object.keys(obj).sort()) {
        const value = obj[key];
        if (Array.isArray(value)) {
            ordered[key] = [];
            value.forEach(nested => {
                (ordered[key] as Obj[]).push(orderObjProps(nested));
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
