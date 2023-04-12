import { Collection, RESTPostAPIContextMenuApplicationCommandsJSONBody as APIContextMenuCommand, ApplicationCommand } from 'discord.js';
import CommandoClient from './client';
import { ArgumentTypeString } from './commands/argument';
import Command, { APISlashCommand, CommandContext } from './commands/base';
import CommandGroup from './commands/group';
import CommandoGuild from './extensions/guild';
import CommandoMessage from './extensions/message';
import ArgumentType from './types/base';
export interface RequireAllOptions {
    dirname: string;
    filter?: RegExp | ((name: string, path: string) => string | false);
    excludeDirs?: RegExp;
    map?: ((name: string, path: string) => string);
    resolve?: ((module: unknown) => unknown);
    recursive?: boolean;
}
export interface DefaultCommandsOptions {
    /**
     * Whether to register the built-in help command (requires "util" group and "string" type)
     * @default true
     */
    help?: boolean;
    /**
     * Whether to register the built-in prefix command (requires "util" group and "string" type)
     * @default true
     */
    prefix?: boolean;
    /**
     * Whether to register the built-in eval command (requires "util" group and "string" type)
     * @default true
     */
    eval?: boolean;
    /**
     * Whether to register the built-in ping command (requires "util" group)
     * @default true
     */
    ping?: boolean;
    /**
     * Whether to register the built-in unknown command (requires "util" group)
     * @default true
     */
    unknownCommand?: boolean;
    /**
     * Whether to register the built-in command state commands
     * (enable, disable, load, unload, reload, list groups - requires "commands" group, "command" type, and "group" type)
     * @default true
     */
    commandState?: boolean;
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
export type CommandResolvable = Command | CommandoMessage | string;
/**
 * A CommandGroupResolvable can be:
 * - A {@link CommandGroup}
 * - A group ID
 */
export type CommandGroupResolvable = CommandGroup | string;
interface ApplicationCommandEntry {
    commands: Array<APIContextMenuCommand | APISlashCommand>;
    global: boolean;
}
/** Handles registration and searching of commands and groups */
export default class CommandoRegistry {
    /** The client this registry is for */
    readonly client: CommandoClient;
    /** Registered commands, mapped by their name */
    commands: Collection<string, Command>;
    /** Registered command groups, mapped by their ID */
    groups: Collection<string, CommandGroup>;
    /** Registered argument types, mapped by their ID */
    types: Collection<string, ArgumentType>;
    /** Fully resolved path to the bot's commands directory */
    commandsPath: string | null;
    /** Command to run when an unknown command is used */
    unknownCommand: Command | null;
    /**
     * @param client - Client to use
     */
    constructor(client: CommandoClient);
    /** Registers every global and guild application command available - this may only be called upon startup. */
    protected registerApplicationCommands(): Promise<void>;
    /** Registers an application command. */
    protected registerApplicationCommandEntry(entry: ApplicationCommandEntry, testAppGuild: CommandoGuild | null, registeredCommands: Collection<string, ApplicationCommand>): Promise<void>;
    /** Deletes any application commands that have been removed from the program. */
    protected deleteUnusedApplicationCommands(currentCommands: Collection<string, ApplicationCommandEntry>, registeredCommands: Collection<string, ApplicationCommand>): Promise<void>;
    /**
     * Registers a single group
     * @param group - A CommandGroup instance
     * or the constructor parameters (with ID, name, and guarded properties)
     * @see {@link CommandoRegistry.registerGroups CommandoRegistry#registerGroups}
     */
    registerGroup(group: CommandGroup | {
        id: string;
        name?: string;
        guarded?: boolean;
    }): this;
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
    registerGroups(groups: Array<CommandGroup | {
        id: string;
        name?: string;
        guarded?: boolean;
    }>): this;
    /**
     * Registers a single command
     * @param command - Either a Command instance, or a constructor for one
     * @see {@link CommandoRegistry.registerCommands CommandoRegistry#registerCommands}
     */
    registerCommand(command: Command): this;
    /**
     * Registers multiple commands
     * @param commands - An array of Command instances or constructors
     * @param ignoreInvalid - Whether to skip over invalid objects without throwing an error
     */
    registerCommands(commands: Command[], ignoreInvalid?: boolean): this;
    /**
     * Registers all commands in a directory. The files must export a Command class constructor or instance.
     * @param options - The path to the directory, or a require-all options object
     * @example
     * const path = require('path');
     * registry.registerCommandsIn(path.join(__dirname, 'commands'));
     */
    registerCommandsIn(options: RequireAllOptions | string): this;
    /**
     * Registers a single argument type
     * @param type - Either an ArgumentType instance, or a constructor for one
     * @see {@link CommandoRegistry.registerTypes CommandoRegistry#registerTypes}
     */
    registerType(type: ArgumentType): this;
    /**
     * Registers multiple argument types
     * @param types - An array of ArgumentType instances or constructors
     * @param ignoreInvalid - Whether to skip over invalid objects without throwing an error
     */
    registerTypes(types: ArgumentType[], ignoreInvalid?: boolean): this;
    /**
     * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
     * @param options - The path to the directory, or a require-all options object
     */
    registerTypesIn(options: RequireAllOptions | string): this;
    /**
     * Registers the default argument types, groups, and commands. This is equivalent to:
     * ```js
     * registry.registerDefaultTypes()
     *     .registerDefaultGroups()
     *     .registerDefaultCommands();
     * ```
     */
    registerDefaults(): this;
    /** Registers the default groups ("util" and "commands") */
    registerDefaultGroups(): this;
    /**
     * Registers the default commands to the registry
     * @param commands - Object specifying which commands to register
     */
    registerDefaultCommands(commands?: DefaultCommandsOptions): this;
    /**
     * Registers the default argument types to the registry
     * @param types - Object specifying which types to register
     */
    registerDefaultTypes(types?: DefaultTypesOptions): this;
    /**
     * Reregisters a command (does not support changing name, group, or memberName)
     * @param command - New command
     * @param oldCommand - Old command
     */
    reregisterCommand(command: Command, oldCommand: Command): void;
    /**
     * Unregisters a command
     * @param command - Command to unregister
     */
    unregisterCommand(command: Command): void;
    /**
     * Finds all groups that match the search string
     * @param searchString - The string to search for
     * @param exact - Whether the search should be exact
     * @return All groups that are found
     */
    findGroups(searchString?: string | null, exact?: boolean): CommandGroup[];
    /**
     * Resolves a CommandGroupResolvable to a CommandGroup object
     * @param group - The group to resolve
     * @return The resolved CommandGroup
     */
    resolveGroup(group: CommandGroupResolvable): CommandGroup;
    /**
     * Finds all commands that match the search string
     * @param searchString - The string to search for
     * @param exact - Whether the search should be exact
     * @param context - The context to check usability against
     * @return All commands that are found
     */
    findCommands(searchString?: string | null, exact?: boolean, context?: CommandContext): Command[];
    /**
     * Resolves a CommandResolvable to a Command object
     * @param command - The command to resolve
     * @return The resolved Command
     */
    resolveCommand(command: CommandResolvable): Command;
    /**
     * Resolves a command file path from a command's group ID and memberName
     * @param group - ID of the command's group
     * @param memberName - Member name of the command
     * @return Fully-resolved path to the corresponding command file
     */
    resolveCommandPath(group: string, memberName: string): string;
}
export {};
