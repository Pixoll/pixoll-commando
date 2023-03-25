/* eslint-disable new-cap */
import {
    Collection,
    RESTPostAPIContextMenuApplicationCommandsJSONBody as APIContextMenuCommand,
    APIApplicationCommand,
    ApplicationCommand,
} from 'discord.js';
import path from 'path';
import requireAll from 'require-all';
import CommandoClient from './client';
import { ArgumentTypeString } from './commands/argument';
import Command, { APISlashCommand, CommandContext } from './commands/base';
import CommandGroup from './commands/group';
import CommandoGuild from './extensions/guild';
import CommandoMessage from './extensions/message';
import ArgumentType from './types/base';
import Util, { Constructable, NonAbstractConstructable } from './util';

declare function require<T>(id: string): T;

export interface RequireAllOptions {
    dirname: string;
    filter?: RegExp | ((name: string, path: string) => string | false);
    excludeDirs?: RegExp;
    map?: ((name: string, path: string) => string);
    resolve?: ((module: unknown) => unknown);
    recursive?: boolean;
}

/** Object specifying which types to register. All default to `true` */
export type DefaultTypesOptions = {
    [T in ArgumentTypeString]?: boolean;
};

/**
 * A CommandResolvable can be:
 * - A {@link Command}
 * - A command name
 * - A {@link CommandoMessage}
 */
export type CommandResolvable =
    | Command
    | CommandoMessage
    | string;

/**
 * A CommandGroupResolvable can be:
 * - A {@link CommandGroup}
 * - A group ID
 */
export type CommandGroupResolvable =
    | CommandGroup
    | string;

interface ApplicationCommandEntry {
    commands: Array<APIContextMenuCommand | APISlashCommand>;
    global: boolean;
}

/** Handles registration and searching of commands and groups */
export default class CommandoRegistry {
    /** The client this registry is for */
    declare public readonly client: CommandoClient;
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

    /** Registers every global and guild application command available - this may only be called upon startup. */
    protected async registerApplicationCommands(): Promise<void> {
        const { client, commands } = this;
        const { application, options, guilds } = client as CommandoClient<true>;

        const testAppGuild = await guilds.fetch(options.testAppGuild ?? '0').catch(() => null);
        const registeredCommands = await Promise.all([
            testAppGuild?.commands.fetch(),
            application.commands.fetch(),
        ]).then(commands => commands[1].concat(commands[0] ?? new Collection()));

        const appCommandsToRegister = commands.mapValues<ApplicationCommandEntry>(command => ({
            commands: Util.filterNullishItems([command.slashCommand, ...command.contextMenuCommands]),
            global: !command.testAppCommand,
        }));

        await this.deleteUnusedApplicationCommands(appCommandsToRegister, registeredCommands);
        await Promise.all(appCommandsToRegister.map(entry =>
            this.registerApplicationCommandEntry(entry, testAppGuild, registeredCommands)
        ));

        const guildOnlyAmount = appCommandsToRegister
            .filter(command => !command.global)
            .reduce((amount, entry) => amount + entry.commands.length, 0);
        const globalAmount = appCommandsToRegister
            .filter(command => command.global)
            .reduce((amount, entry) => amount + entry.commands.length, 0);

        if (guildOnlyAmount) client.emit('debug', `Loaded ${guildOnlyAmount} guild application commands`);
        if (globalAmount) client.emit('debug', `Loaded ${globalAmount} global application commands`);
    }

    /** Registers an application command. */
    protected async registerApplicationCommandEntry(
        entry: ApplicationCommandEntry,
        testAppGuild: CommandoGuild | null,
        registeredCommands: Collection<string, ApplicationCommand>
    ): Promise<void> {
        const { commands, global } = entry;
        if (commands.length === 0) return;

        const { application } = this.client as CommandoClient<true>;
        const commandManager = !global && testAppGuild ? testAppGuild.commands : application.commands;

        await Promise.all(commands.map(async command => {
            const rawCommand = 'description' in command ? Util.omit(command, ['deferEphemeral']) : command;
            const registeredCommand = registeredCommands.find(cmd =>
                cmd.name === command.name && cmd.type === rawCommand.type
            );
            if (!registeredCommand) {
                await commandManager.create(rawCommand);
                return;
            }
            if (!registeredCommand.equals(rawCommand as APIApplicationCommand)) {
                // @ts-expect-error: ChannelType.GuildDirectory is never used
                await registeredCommand.edit(rawCommand);
                return;
            }
        }));
    }

    /** Deletes any application commands that have been removed from the program. */
    protected async deleteUnusedApplicationCommands(
        currentCommands: Collection<string, ApplicationCommandEntry>,
        registeredCommands: Collection<string, ApplicationCommand>
    ): Promise<void> {
        const client = this.client as CommandoClient<true>;

        const removedCommands = registeredCommands.filter(command => {
            const currentCommand = currentCommands.get(command.name);
            if (!currentCommand || currentCommand.commands.length === 0) return true;
            return !currentCommand.commands.some(cmd => cmd.type === command.type);
        });
        await Promise.all(removedCommands.map(command => command.delete()));
        const removedAmount = removedCommands.size;
        if (removedAmount) client.emit('debug', `Deleted ${removedAmount} unused application commands`);
    }

    /**
     * Registers a single group
     * @param group - A CommandGroup instance
     * or the constructor parameters (with ID, name, and guarded properties)
     * @see {@link CommandoRegistry.registerGroups CommandoRegistry#registerGroups}
     */
    public registerGroup(group: CommandGroup | { id: string; name?: string; guarded?: boolean }): this {
        const { client, groups } = this;

        if (isConstructor(group, CommandGroup)) group = new group(client);
        else if (!(group instanceof CommandGroup)) {
            group = new CommandGroup(client, group.id, group.name, group.guarded);
        }

        const builtGroup = group as CommandGroup;

        const existing = groups.get(builtGroup.id);
        if (existing) {
            existing.name = builtGroup.name;
            client.emit('debug', `Group ${builtGroup.id} is already registered. Renamed it to "${builtGroup.name}".`);
        } else {
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
    public registerGroups(groups: Array<CommandGroup | { id: string; name?: string; guarded?: boolean }>): this {
        if (!Array.isArray(groups)) throw new TypeError('Groups must be an array.');
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
    public registerCommand(command: Command): this {
        const { client, commands, groups, unknownCommand } = this;

        if (isConstructor(command, Command)) command = new command(client);
        else if ('default' in command && isConstructor(command.default, Command)) {
            command = new command.default(client);
        }
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
        if (!Array.isArray(commands)) throw new TypeError('Commands must be an array.');
        for (const command of commands) {
            const valid = isConstructor(command, Command)
                || ('default' in command && (
                    isConstructor(command.default, Command)
                    || (command.default instanceof Command)
                ))
                || (command instanceof Command);

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
        const obj: Record<string, Record<string, Command>> = requireAll(options);
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
     * @see {@link CommandoRegistry.registerTypes CommandoRegistry#registerTypes}
     */
    public registerType(type: ArgumentType): this {
        const { client, types } = this;

        if (isConstructor(type, ArgumentType)) type = new type(client);
        else if ('default' in type && isConstructor(type.default, ArgumentType)) {
            type = new type.default(client);
        }
        if (!(type instanceof ArgumentType)) throw new Error(`Invalid type object to register: ${type}`);

        // Make sure there aren't any conflicts
        if (types.has(type.id)) throw new Error(`An argument type with the ID "${type.id}" is already registered.`);

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
    public registerTypes(types: ArgumentType[], ignoreInvalid = false): this {
        if (!Array.isArray(types)) throw new TypeError('Types must be an array.');
        for (const type of types) {
            const valid = isConstructor(type, ArgumentType)
                || ('default' in type && (
                    isConstructor(type.default, ArgumentType)
                    || (type.default instanceof ArgumentType))
                )
                || (type instanceof ArgumentType);

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
        const obj = requireAll(options) as Record<string, ArgumentType>;
        const types: ArgumentType[] = [];
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
                const key = Util.removeDashes(k) as keyof DefaultTypesOptions;
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
    public reregisterCommand(command: Command, oldCommand: Command): void {
        const { client, commands, unknownCommand } = this;

        if (isConstructor(command, Command)) command = new command(client);
        else if ('default' in command && isConstructor(command.default, Command)) {
            command = new command.default(client);
        }
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

        client.emit('commandReregister', command, oldCommand);
        client.emit('debug', `Reregistered command ${command.toString()}.`);
    }

    /**
     * Unregisters a command
     * @param command - Command to unregister
     */
    public unregisterCommand(command: Command): void {
        const { commands, unknownCommand, client } = this;
        const { name } = command;

        commands.delete(name);
        command.group.commands.delete(name);
        if (unknownCommand === command) this.unknownCommand = null;

        client.emit('commandUnregister', command);
        client.emit('debug', `Unregistered command ${command.toString()}.`);
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
     * @param context - The context to check usability against
     * @return All commands that are found
     */
    public findCommands(searchString: string | null = null, exact = false, context?: CommandContext): Command[] {
        const { commands } = this;
        if (!searchString) return context
            ? commands.filter(cmd => cmd.isUsable(context)).toJSON()
            : commands.toJSON();

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
        const { commandsPath } = this;
        if (!commandsPath) throw new TypeError('Commands path cannot be null or undefined.');
        return path.join(commandsPath, group, `${memberName}.js`);
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
        || cmd.toString() === search;
}

function commandFilterInexact(search: string) {
    return (cmd: Command): boolean =>
        cmd.name.includes(search)
        || cmd.toString() === search
        || cmd.aliases?.some(ali => ali.includes(search));
}

function isConstructor<T, U>(
    value: Constructable<T> | T | U, construct: Constructable<T>
): value is NonAbstractConstructable<T> {
    try {
        new new Proxy(value as { new(): unknown }, {
            construct: () => Object.prototype,
        })();
        if (!construct) return true;
        return (value as { new(): unknown }).prototype instanceof construct;
    } catch (err) {
        return false;
    }
}
