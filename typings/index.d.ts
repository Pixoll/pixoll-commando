declare module 'pixoll-commando' {
	import {
		Client, ClientEvents, ClientOptions, Collection, Guild, GuildResolvable, Message, MessageEditOptions, MessageEmbed,
		MessageOptions, PermissionResolvable, PermissionString, User, UserResolvable, InviteGenerationOptions, GuildMember,
		Snowflake, CachedManager, FetchGuildOptions, FetchGuildsOptions, CommandInteraction, GuildCreateOptions
	} from 'discord.js';
	import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/rest/v9';
	import { FilterQuery, Model, UpdateQuery, UpdateAggregationStage } from 'mongoose';

	/** A fancy argument */
	export class Argument {
		/**
		 * @param client Client the argument is for
		 * @param info Information for the command argument
		 */
		private constructor(client: CommandoClient, info: ArgumentInfo);

		/**
		 * Prompts the user and obtains multiple values for the argument
		 * @param msg Message that triggered the command
		 * @param vals Pre-provided values for the argument
		 * @param promptLimit Maximum number of times to prompt for the argument
		 */
		private obtainInfinite(msg: CommandoMessage, vals?: string[], promptLimit?: number): Promise<ArgumentResult>;

		/**
		 * Validates the constructor parameters
		 * @param client Client to validate
		 * @param info Info to validate
		 */
		private static validateInfo(client: CommandoClient, info: ArgumentInfo): void;

		/**
		 * Whether the argument is required or not
		 * @default true
		 */
		public required: boolean;
		/**
		 * Whether the argument's validation is skipped or not
		 * @default false
		 */
		public skipValidation: boolean;
		/** The default value for the argument */
		public default: ArgumentDefault;
		/** Function to check whether a raw value is considered empty */
		public emptyChecker: Function;
		/**
		 * Error message for when a value is invalid
		 *  @see {@link ArgumentType#isEmpty}
		 */
		public error: string;
		/** Whether the argument accepts an infinite number of values */
		public infinite: boolean;
		/** Key for the argument */
		public key: string;
		/** Label for the argument */
		public label: string;
		/**
		 * - If type is `integer` or `float`, this is the maximum value of the number.
		 * - If type is `string`, this is the maximum length of the string.
		 */
		public max: number;
		/**
		 * - If type is `integer` or `float`, this is the minimum value of the number.
		 * - If type is `string`, this is the minimum length of the string.
		 */
		public min: number;
		/**
		 * Values the user can choose from.
		 * - If type is `string`, this will be case-insensitive.
		 * - If type is `channel`, `member`, `role`, or `user`, this will be the ids.
		 */
		public oneOf: string[];
		/**
		 * Parser function for parsing a value for the argument
		 *  @see {@link ArgumentType#parse}
		 */
		public parser: Function;
		/** Question prompt for the argument */
		public prompt: string;
		/** Type of the argument */
		public type: ArgumentType;
		/**
		 * Validator function for validating a value for the argument
		 * @see {@link ArgumentType#validate}
		 */
		public validator: Function;
		/** How long to wait for input (in seconds) */
		public wait: number;

		/**
		 * Checks whether a value for the argument is considered to be empty
		 * @param val Value to check for emptiness
		 * @param msg Message that triggered the command
		 */
		public isEmpty(val: string, msg: CommandoMessage): boolean;
		/**
		 * Prompts the user and obtains the value for the argument
		 * @param msg Message that triggered the command
		 * @param val Pre-provided value for the argument
		 * @param promptLimit Maximum number of times to prompt for the argument
		 */
		public obtain(msg: CommandoMessage, val?: string, promptLimit?: number): Promise<ArgumentResult>;
		/**
		 * Parses a value string into a proper value for the argument
		 * @param val Value to parse
		 * @param msg Message that triggered the command
		 */
		public parse(val: string, msg: CommandoMessage): unknown | Promise<unknown>;
		/**
		 * Checks if a value is valid for the argument
		 * @param val Value to check
		 * @param msg Message that triggered the command
		 */
		public validate(val: string, msg: CommandoMessage): boolean | string | Promise<boolean | string>;
	}

	/** Obtains, validates, and prompts for argument values */
	export class ArgumentCollector {
		/**
		 * @param client Client the collector will use
		 * @param args Arguments for the collector
		 * @param promptLimit Maximum number of times to prompt for a single argument
		 */
		public constructor(client: CommandoClient, args: ArgumentInfo[], promptLimit?: number);

		/** Arguments the collector handles */
		public args: Argument[];
		/** Client this collector is for */
		public readonly client: CommandoClient;
		/** Maximum number of times to prompt for a single argument */
		public promptLimit: number;

		/**
		 * Obtains values for the arguments, prompting if necessary.
		 * @param msg Message that the collector is being triggered by
		 * @param provided Values that are already available
		 * @param promptLimit Maximum number of times to prompt for a single argument
		 */
		public obtain(msg: CommandoMessage, provided?: unknown[], promptLimit?: number): Promise<ArgumentCollectorResult>;
	}

	/** A type for command arguments */
	export abstract class ArgumentType {
		/**
		 * @param client The client the argument type is for
		 * @param id The argument type ID (this is what you specify in {@link ArgumentInfo#type})
		 */
		public constructor(client: CommandoClient, id: string);

		/** Client that this argument type is for */
		public readonly client: CommandoClient;
		/** ID of this argument type (this is what you specify in {@link ArgumentInfo#type}) */
		public id: string;

		/**
		 * Checks whether a value is considered to be empty.
		 * This determines whether the default value for an argument should be
		 * used and changesthe response to the user under certain circumstances.
		 * @param val Value to check for emptiness
		 * @param msg Message that triggered the command
		 * @param arg Argument the value was obtained from
		 * @returns Whether the value is empty
		 */
		public isEmpty(val: string, msg: CommandoMessage, arg: Argument): boolean;
		/**
		 * Parses the raw value string into a usable value
		 * @param val Value to parse
		 * @param msg Message that triggered the command
		 * @param arg Argument the value was obtained from
		 * @returns Usable value
		 */
		public abstract parse(val: string, msg: CommandoMessage, arg: Argument): unknown | Promise<unknown>;
		/**
		 * Validates a value string against the type
		 * @param val Value to validate
		 * @param msg Message that triggered the command
		 * @param arg Argument the value was obtained from
		 * @returns Whether the value is valid, or an error message
		 */
		public abstract validate(val: string, msg: CommandoMessage, arg: Argument):
			boolean | string | Promise<boolean | string>;
	}

	/** A type for command arguments that handles multiple other types */
	export class ArgumentUnionType extends ArgumentType {
		/** Types to handle, in order of priority */
		public types: ArgumentType[];

		/**
		 * Parses the raw value string into a usable value
		 * @param val Value to parse
		 * @param msg Message that triggered the command
		 * @param arg Argument the value was obtained from
		 * @returns Usable value
		 */
		public parse(val: string, msg: CommandoMessage, arg: Argument): unknown | Promise<unknown>;
		/**
		 * Validates a value string against the type
		 * @param val Value to validate
		 * @param msg Message that triggered the command
		 * @param arg Argument the value was obtained from
		 * @returns Whether the value is valid, or an error message
		 */
		public validate(val: string, msg: CommandoMessage, arg: Argument): string | boolean | Promise<string | boolean>;
	}

	/** The client's database manager (MongoDB) */
	export class ClientDatabaseManager {
		/**
		 * @param client The client this database is for
		 */
		constructor(client: CommandoClient)

		/** Client for this database */
		public client: CommandoClient

		public disabled: DatabaseManager<DisabledSchema>
		public errors: DatabaseManager<ErrorSchema>
		public faq: DatabaseManager<FaqSchema>
		public prefixes: DatabaseManager<PrefixSchema>
		public reminders: DatabaseManager<ReminderSchema>
		public todo: DatabaseManager<TodoSchema>

		/** Initializes the caching of this guild's data */
		private init(data: Collection<string, Collection<string, DataModel<unknown>>>): this
	}

	/** A command that can be run in a client */
	export abstract class Command {
		/**
		 * @param client The client the command is for
		 * @param info The command information
		 */
		public constructor(client: CommandoClient, info: CommandInfo);

		/** Whether the command is enabled globally */
		private _globalEnabled: boolean;
		/** Current throttle objects for the command, mapped by user ID */
		private _throttles: Map<string, object>;
		/** The slash command data to send to the API */
		private _slashToAPI: RESTPostAPIChatInputApplicationCommandsJSONBody;

		/**
		 * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
		 * @param userId ID of the user to throttle for
		 */
		private throttle(userId: string): Throttle | null;

		/**
		 * Validates the constructor parameters
		 * @param client Client to validate
		 * @param info Info to validate
		 */
		private static validateInfo(client: CommandoClient, info: CommandInfo);

		/** Aliases for this command */
		public aliases: string[];
		/** The argument collector for the command */
		public argsCollector: ArgumentCollector;
		/**
		 * Maximum number of arguments that will be split
		 * @default 0
		 */
		public argsCount: number;
		/**
		 * Whether single quotes are allowed to encapsulate an argument
		 * @default true
		 */
		public argsSingleQuotes: boolean;
		/**
		 * How the arguments are split when passed to the command's run method
		 * @default 'single'
		 */
		public argsType: string;
		/** Client that this command is for */
		public readonly client: CommandoClient;
		/** Permissions required by the client to use the command. */
		public clientPermissions: PermissionResolvable[];
		/**
		 * Whether the default command handling is enabled for the command
		 * @default true
		 */
		public defaultHandling: boolean;
		/** Short description of the command */
		public description: string;
		/** Long description of the command */
		public details: string;
		/**
		 * Whether the command can only be run in direct messages
		 * @default false
		 */
		public dmOnly: boolean;
		/** Example usage strings */
		public examples: string[];
		/** Usage format string of the command */
		public format: string;
		/** The group the command belongs to, assigned upon registration */
		public group: CommandGroup;
		/** ID of the group the command belongs to */
		public groupId: string;
		/**
		 * Whether the command is protected from being disabled
		 * @default false
		 */
		public guarded: boolean;
		/**
		 * Whether the command can only be run in a guild channel
		 * @default false
		 */
		public guildOnly: boolean;
		/**
		 * Whether the command should be hidden from the help command
		 * @default false
		 */
		public hidden: boolean;
		/**
		 * Name of the command within the group
		 * @default this.name
		 */
		public memberName: string;
		/** Whether this command's user permissions are based on "moderator" permissions */
		public modPermissions: boolean;
		/** Name of this command */
		public name: string;
		/**
		 * Whether the command can only be used in NSFW channels
		 * @default false
		 */
		public nsfw: boolean;
		/**
		 * Whether the command can only be used by an owner
		 * @default false
		 */
		public ownerOnly: boolean;
		/** Regular expression triggers */
		public patterns: RegExp[];
		/**
		 * Whether the command can only be run by the server's owner
		 * @default false
		 */
		public guildOwnerOnly: boolean;
		/** Options for throttling command usages */
		public throttling: ThrottlingOptions;
		/**
		 * Whether the command will be run when an unknown command is used
		 * @default false
		 */
		public unknown: boolean;
		/** Permissions required by the user to use the command */
		public userPermissions: PermissionResolvable[];
		/**
		 * Whether the command is marked as deprecated
		 * @default false
		 */
		public deprecated: boolean;
		/**
		 * The name or alias of the command that is replacing the deprecated command.
		 * Required if `deprecated` is `true`.
		 */
		public replacing: string;
		/**
		 * The data for the slash command, or `true` to use the same information as the message command
		 * @default false
		 */
		public slash: SlashCommandInfo;
		/**
		 * Whether the slash command will be registered in the test guild only or not
		 * @default false
		 */
		public test: boolean;

		/**
		 * Checks whether the user has permission to use the command
		 * @param instances The triggering command instances
		 * @param ownerOverride Whether the bot owner(s) will always have permission
		 */
		public hasPermission(instances: CommandInstances, ownerOverride?: boolean):
			true | 'ownerOnly' | 'guildOwnerOnly' | 'modPermissions' | PermissionString[];
		/**
		 * Checks if the command is enabled in a guild
		 * @param guild Guild to check in
		 * @param bypassGroup Whether to bypass checking the group's status
		 */
		public isEnabledIn(guild?: GuildResolvable, bypassGroup?: boolean): boolean;
		/**
		 * Checks if the command is usable for an instance
		 * @param instances The instances
		 */
		public isUsable(instances?: CommandInstances): boolean;
		/**
		 * Called when the command is prevented from running
		 * @param instances The instances the command is being run for
		 * @param reason Reason that the command was blocked (built-in reasons are `guildOnly`, `nsfw`, `permission`,
		 * `throttling`, and `clientPermissions`)
		 * @param data Additional data associated with the block. Built-in reason data properties:
		 * - guildOnly & nsfw & dmOnly: none
		 * - throttling: `throttle` ({@link Throttle}), `remaining` (number) time in seconds
		 * - userPermissions & clientPermissions: `missing` ({@link PermissionString}[]) permission names
		 */
		public onBlock(instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData): Promise<Message>;
		/**
		 * Called when the command produces an error while running
		 * @param err Error that was thrown
		 * @param instances The instances the command is being run for
		 * @param args Arguments for the command (see {@link Command#run})
		 * @param fromPattern Whether the args are pattern matches (see {@link Command#run})
		 * @param result Result from obtaining the arguments from the collector (if applicable - see {@link Command#run})
		 */
		public onError(
			err: Error,
			instances: CommandInstances,
			args: object | string | string[],
			fromPattern?: boolean,
			result?: ArgumentCollectorResult
		): Promise<Message>;
		/** Reloads the command */
		public reload(): void;
		/**
		 * Runs the command
		 * @param instances The instances the command is being run forr
		 * @param args The arguments for the command, or the matches from a pattern.
		 * - If args is specified on the command, thise will be the argument values object.
		 * - If argsType is single, then only one string will be passed.
		 * - If multiple, an array of strings will be passed.
		 * - When fromPattern is true, this is the matches array from the pattern match (see {@link RegExp#exec}).
		 * @param fromPattern Whether or not the command is being run from a pattern match
		 * @param result Result from obtaining the arguments from the collector (if applicable)
		 */
		public abstract run(
			instances: CommandInstances,
			args: object | string | string[],
			fromPattern?: boolean,
			result?: ArgumentCollectorResult
		): Promise<Message | Message[] | null> | null;
		/**
		 * Enables or disables the command in a guild
		 * @param guild Guild to enable/disable the command in
		 * @param enabled Whether the command should be enabled or disabled
		 */
		public setEnabledIn(guild: GuildResolvable | null, enabled: boolean): void;
		/** Unloads the command */
		public unload(): void;
		/**
		 * Creates a usage string for the command
		 * @param argString A string of arguments for the command
		 * @param prefix Prefix to use for the prefixed command format
		 * @param user User to use for the mention command format
		 */
		public usage(argString?: string, prefix?: string, user?: User): string;

		/**
		 * Creates a usage string for a command
		 * @param command A command + arg string
		 * @param prefix Prefix to use for the prefixed command format
		 * @param user User to use for the mention command format
		 */
		public static usage(command: string, prefix?: string, user?: User): string;
	}

	/** Handles parsing messages and running commands from them */
	export class CommandDispatcher {
		/**
		 * @param client Client the dispatcher is for
		 * @param registry Registry the dispatcher will use
		 */
		public constructor(client: CommandoClient, registry: CommandoRegistry);

		/** Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a channel */
		private _awaiting: Set<string>;
		/** Map of {@link RegExp}s that match command messages, mapped by string prefix */
		private _commandPatterns: Map<string, RegExp>;
		/** Old command message results, mapped by original message ID */
		private _results: Map<string, CommandoMessage>;

		/**
		 * Creates a regular expression to match the command prefix and name in a message
		 * @param prefix Prefix to build the pattern for
		 */
		private buildCommandPattern(prefix: string): RegExp;
		/**
		 * Caches a command message to be editable
		 * @param message Triggering message
		 * @param oldMessage Triggering message's old version
		 * @param cmdMsg Command message to cache
		 * @param responses Responses to the message
		 */
		private cacheCommandoMessage(
			message: Message,
			oldMessage: Message,
			cmdMsg: CommandoMessage,
			responses: Message | Message[]
		): void;
		/**
		 * Handle a new message or a message update
		 * @param message The message to handle
		 * @param oldMessage The old message before the update
		 */
		private handleMessage(message: Message, oldMessage?: Message): Promise<void>;
		/**
		 * Handle a slash command interaction
		 * @param interaction The interaction to handle
		 */
		private handleSlash(interaction: CommandInteraction): Promise<void>;
		/**
		 * Inhibits a command message
		 * @param cmdMsg Command message to inhibit
		 */
		private inhibit(cmdMsg: CommandoMessage): Inhibition;
		/**
		 * Matches a message against a guild command pattern
		 * @param message The message
		 * @param pattern The pattern to match against
		 * @param commandNameIndex The index of the command name in the pattern matches
		 * @param prefixless Whether the match is happening for a prefixless usage
		 */
		private matchDefault(message: Message, pattern: RegExp, commandNameIndex?: number, prefixless?: boolean):
			CommandoMessage;
		/**
		 * Parses a message to find details about command usage in it
		 * @param message The message
		 */
		private parseMessage(message: Message): CommandoMessage;
		/**
		 * Check whether a message should be handled
		 * @param message The message to handle
		 * @param oldMessage The old message before the update
		 */
		private shouldHandleMessage(message: Message, oldMessage?: Message): boolean;

		/** Client this dispatcher handles messages for */
		public readonly client: CommandoClient;
		/** Functions that can block commands from running */
		public inhibitors: Set<Inhibitor>;
		/** Registry this dispatcher uses */
		public registry: CommandoRegistry;

		/**
		 * Adds an inhibitor
		 * @param inhibitor The inhibitor function to add
		 * @returns Whether the addition was successful
		 * @example
		 * client.dispatcher.addInhibitor(msg => {
			 *	if(blacklistedUsers.has(msg.author.id)) return 'blacklisted'
		 * })
		 * @example
		 * client.dispatcher.addInhibitor(msg => {
		 * 	if(!coolUsers.has(msg.author.id)) return {
		 * 		reason: 'cool',
		 * 		response: msg.reply('You\'re not cool enough!')
		 * 	}
		 * })
		 */
		public addInhibitor(inhibitor: Inhibitor): boolean;
		/**
		 * Removes an inhibitor
		 * @param inhibitor The inhibitor function to remove
		 * @returns Whether the removal was successful
		 */
		public removeInhibitor(inhibitor: Inhibitor): boolean;
	}

	/** A database schema manager (MongoDB) */
	export class DatabaseManager<T> {
		/**
		 * @param schema The schema of this manager
		 * @param guild The guild this manager is for
		 */
		public constructor(schema: Model<T, {}, {}>, guild: CommandoGuild)

		/** Guild for this database */
		public guild?: CommandoGuild
		/** The name of the schema this manager is for */
		public schema: DataModel<T>
		/** The cache for this manager */
		public cache: Collection<string, T>

		/**
		 * Add a single document to the database, or updates it if there's an existing one
		 * @param doc The document to add
		 * @returns The added document
		 */
		public add(doc: T): Promise<T>
		/**
		 * Delete a single document from the database
		 * @param doc The document to delete or its ID
		 * @returns The deleted document
		 */
		public delete(doc: T | string): Promise<T>
		/**
		 * Update a single document of the database
		 * @param toUpdate The document to update or its ID
		 * @param options The options for this update
		 * @returns The updated document
		 */
		public update(toUpdate: T | string, options: UpdateAggregationStage | UpdateQuery<T> | T): Promise<T>
		/**
		 * Fetch a single document
		 * @param filter The ID or fetching filter for the document
		 * @returns The fetched document
		 */
		public fetch(filter?: string | FilterQuery<T>): Promise<T>
		/**
		 * Fetch a multiple documents
		 * @param filter The fetching filter for the documents
		 * @returns The fetched documents
		 */
		public fetchMany(filter?: FilterQuery<T>): Promise<Collection<string, T>>
	}

	export interface DataModel<T> extends Model<T> {
		find(filter: FilterQuery<T>): Promise<T[]>
		findOne(filter: FilterQuery<T>): Promise<T>
		findById(id: string): Promise<T>
		updateOne(filter: FilterQuery<T>): Promise<T>
	}

	/** Has a descriptive message for a command not having proper format */
	export class CommandFormatError extends FriendlyError {
		/**
		 * @param msg The command message the error is for
		 */
		public constructor(msg: CommandoMessage);
	}

	/** A group for commands. Whodathunkit? */
	export class CommandGroup {
		/**
		 * @param client The client the group is for
		 * @param id The ID for the group
		 * @param name The name of the group
		 * @param guarded Whether the group should be protected from disabling
		 */
		public constructor(client: CommandoClient, id: string, name?: string, guarded?: boolean);

		/** Whether the group is enabled globally */
		private _globalEnabled: boolean;
		/** Client that this group is for */
		public readonly client: CommandoClient;
		/** The commands in this group (added upon their registration) */
		public commands: Collection<string, Command>;
		/** Whether or not this group is protected from being disabled */
		public guarded: boolean;
		/** ID of this group */
		public id: string;
		/** Name of this group */
		public name: string;

		/**
		 * Checks if the group is enabled in a guild
		 * @param guild Guild to check in
		 * @returns Whether or not the group is enabled
		 */
		public isEnabledIn(guild?: GuildResolvable): boolean;
		/** Reloads all of the group's commands */
		public reload(): void;
		/**
		 * Enables or disables the group in a guild
		 * @param guild Guild to enable/disable the group in
		 * @param enabled Whether the group should be enabled or disabled
		 */
		public setEnabledIn(guild: GuildResolvable | null, enabled: boolean): void;
	}

	/** An extension of the base Discord.js Message class to add command-related functionality. */
	export class CommandoMessage extends Message {
		/** The client this message is for */
		public readonly client: CommandoClient;
		/** Argument string for the command */
		public argString: string | null;
		/** Command that the message triggers, if any */
		public command: Command | null;
		/** Whether the message contains a command (even an unknown one) */
		public isCommand: boolean;
		/** Pattern matches (if from a pattern trigger) */
		public patternMatches: string[] | null;
		/** Index of the current response that will be edited, mapped by channel ID */
		public responsePositions: { [key: string]: number } | null;
		/** Response messages sent, mapped by channel ID (set by the dispatcher after running the command) */
		public responses: { [key: string]: CommandoMessage[] } | null;
		/** The guild the message was sent in (if in a guild channel) */
		public readonly guild: CommandoGuild;

		/** Deletes any prior responses that haven't been updated */
		private deleteRemainingResponses(): void;
		/**
		 * Edits the current response
		 * @param id The ID of the channel the response is in ("DM" for direct messages)
		 * @param options Options for the response
		 */
		private editCurrentResponse(id: string, options: MessageEditOptions): Promise<CommandoMessage | CommandoMessage[]>;
		/**
		 * Edits a response to the command message
		 * @param response The response message(s) to edit
		 * @param options Options for the response
		 */
		private editResponse(response: CommandoMessage | CommandoMessage[], options: RespondEditOptions):
			Promise<CommandoMessage | CommandoMessage[]>;
		/**
		 * Finalizes the command message by setting the responses and deleting any remaining prior ones
		 * @param responses Responses to the message
		 */
		private finalize(responses: (CommandoMessage | CommandoMessage[])[]): void;
		/**
		 * Responds to the command message
		 * @param options Options for the response
		 */
		private respond(options: RespondOptions): Promise<CommandoMessage | CommandoMessage[]>;

		/**
		 * Creates a usage string for any command
		 * @param argString A command + arg string
		 * @param prefix Prefix to use for the prefixed command format
		 * @param user User to use for the mention command format
		 */
		public anyUsage(argString?: string, prefix?: string, user?: User): string;
		/**
		 * Initialises the message for a command
		 * @param command Command the message triggers
		 * @param argString Argument string for the command
		 * @param patternMatches Command pattern matches (if from a pattern trigger)
		 */
		public initCommand(command?: Command, argString?: string[], patternMatches?: string[]): this;
		/**
		 * Parses the argString into usable arguments, based on the argsType and argsCount of the command
		 *  @see {@link Command#run}
		 */
		public parseArgs(): string | string[];
		/** Runs the command */
		public run(): Promise<null | Message | CommandoMessage | (Message | CommandoMessage)[]>;
		/**
		 * Responds with a plain message
		 * @param content Content for the message
		 * @param options Options for the message
		 */
		public say(
			content: StringResolvable | MessageOptions,
			options?: MessageOptions
		): Promise<CommandoMessage>;
		/**
		 * Responds with a direct message
		 * @param content Content for the message
		 * @param options Options for the message
		 */
		public direct(
			content: StringResolvable | MessageOptions,
			options?: MessageOptions
		): Promise<CommandoMessage>;
		/**
		 * Responds with a code message
		 * @param lang Language for the code block
		 * @param content Content for the message
		 * @param options Options for the message
		 */
		public code(
			lang: string,
			content: StringResolvable | MessageOptions,
			options?: MessageOptions
		): Promise<CommandoMessage>;
		/**
		 * Responds with an embed
		 * @param embed Embed to send
		 * @param content Content for the message
		 * @param options Options for the message
		 */
		public embed(
			embed: MessageEmbed | MessageEmbed[],
			content?: StringResolvable | MessageOptions,
			options?: MessageOptions
		): Promise<CommandoMessage>;
		/**
		 * Responds with a reply + embed
		 * @param embed Embed to send
		 * @param content Content for the message
		 * @param options Options for the message
		 */
		public replyEmbed(
			embed: MessageEmbed | MessageEmbed[],
			content?: StringResolvable | MessageOptions,
			options?: MessageOptions
		): Promise<CommandoMessage>;
		/**
		 * Creates a usage string for the message's command
		 * @param argString A string of arguments for the command
		 * @param prefix Prefix to use for the prefixed command format
		 * @param user User to use for the mention command format
		 */
		public usage(argString?: string, prefix?: string, user?: User): string;

		/**
		 * Parses an argument string into an array of arguments
		 * @param argString The argument string to parse
		 * @param argCount The number of arguments to extract from the string
		 * @param allowSingleQuote Whether or not single quotes should be allowed to wrap arguments,
		 * in addition to double quotes
		 */
		public static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[];
	}

	/** Discord.js Client with a command framework */
	export class CommandoClient extends Client {
		/**
		 * @param options Options for the client
		 */
		public constructor(options?: CommandoClientOptions);

		/** Internal global command prefix, controlled by the {@link CommandoClient#prefix} getter/setter */
		private _prefix: string;

		/**
		 * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
		 * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
		 */
		public prefix: string;
		/** The client's command dispatcher */
		public dispatcher: CommandDispatcher;
		/** Options for the client */
		public options: CommandoClientOptions;
		/** Invite for the bot */
		public botInvite: string;
		/**
		 * Owners of the bot, set by the {@link CommandoClientOptions#owner} option
		 * - If you simply need to check if a user is an owner of the bot,
		 * please instead use {@link CommandoClient#isOwner}.
		 */
		public readonly owners: User[];
		/** The client's command registry */
		public registry: CommandoRegistry;
		/** The client's database manager */
		public database: ClientDatabaseManager;
		/** The guilds' database manager, mapped by the guilds ids */
		public databases: Collection<string, GuildDatabaseManager>;
		public guilds: CommandoGuildManager;

		/**
		 * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
		 * @param user User to check for ownership
		 */
		public isOwner(user: UserResolvable): boolean;

		public on<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void):
			this;
		public once<K extends keyof CommandoClientEvents>(event: K, listener: (...args: CommandoClientEvents[K]) => void):
			this;
		public emit<K extends keyof CommandoClientEvents>(event: K, ...args: CommandoClientEvents[K]): boolean;
	}

	/** A fancier Guild for fancier people. */
	export class CommandoGuild extends Guild {
		/** Internal command prefix for the guild, controlled by the {@link CommandoGuild#prefix} getter/setter */
		private _prefix: string;
		/** Map object of internal command statuses, mapped by command name */
		private _commandsEnabled: object;
		/** Internal map object of group statuses, mapped by group ID */
		private _groupsEnabled: object;

		/** The client of this guild */
		public client: CommandoClient;
		/**
		 * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
		 * Setting to `null` means that the prefix from {@link CommandoClient#prefix} will be used instead.
		 */
		public prefix: string;
		/** The queued logs for this guild */
		public queuedLogs: MessageEmbed[];

		/**
		 * Creates a command usage string using the guild's prefix
		 * @param command A command + arg string
		 * @param user User to use for the mention command format
		 */
		public commandUsage(command?: string, user?: User): string;
		/**
		 * Checks whether a command is enabled in the guild (does not take the command's group status into account)
		 * @param command Command to check status of
		 */
		public isCommandEnabled(command: CommandResolvable): boolean;
		/**
		 * Checks whether a command group is enabled in the guild
		 * @param group Group to check status of
		 */
		public isGroupEnabled(group: CommandGroupResolvable): boolean;
		/**
		 * Sets whether a command is enabled in the guild
		 * @param command Command to set status of
		 * @param enabled Whether the command should be enabled
		 */
		public setCommandEnabled(command: CommandResolvable, enabled: boolean): void;
		/**
		 * Sets whether a command group is enabled in the guild
		 * @param group Group to set status of
		 * @param enabled Whether the group should be enabled
		 */
		public setGroupEnabled(group: CommandGroupResolvable, enabled: boolean): void;
	}

	export class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, GuildResolvable> {
		public create(name: string, options?: GuildCreateOptions): Promise<CommandoGuild>;
		public fetch(options: Snowflake | FetchGuildOptions): Promise<CommandoGuild>;
		public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, CommandoGuild>>;
	}

	export class CommandoInteraction extends CommandInteraction {
		public client: CommandoClient;
		public guild?: CommandoGuild;
		public member?: CommandoMember;
	}

	export class CommandoMember extends GuildMember {
		public guild: CommandoGuild;
	}

	/** Handles registration and searching of commands and groups */
	export class CommandoRegistry {
		/**
		 * @param client Client to use
		 */
		public constructor(client?: CommandoClient);

		/** Registers every client and guild slash command available - this may only be called upon startup. */
		private registerSlashCommands(): Promise<void>;

		/** The client this registry is for */
		public readonly client: CommandoClient;
		/** Registered commands, mapped by their name */
		public commands: Collection<string, Command>;
		/** Fully resolved path to the bot's commands directory */
		public commandsPath: string;
		/** Registered command groups, mapped by their ID */
		public groups: Collection<string, CommandGroup>;
		/** Registered argument types, mapped by their ID */
		public types: Collection<string, ArgumentType>;
		/** Command to run when an unknown command is used */
		public unknownCommand?: Command;

		/**
		 * Finds all commands that match the search string
		 * @param searchString The string to search for
		 * @param exact Whether the search should be exact
		 * @param instances The instances to check usability against
		 * @returns All commands that are found
		 */
		public findCommands(searchString?: string, exact?: boolean, instances?: CommandInstances): Command[];
		/**
		 * Finds all groups that match the search string
		 * @param searchString The string to search for
		 * @param exact Whether the search should be exact
		 * @returns All groups that are found
		 */
		public findGroups(searchString?: string, exact?: boolean): CommandGroup[];
		/**
		 * Registers a single command
		 * @param command Either a Command instance
		 * @see {@link CommandoRegistry#registerCommands}
		 */
		public registerCommand(command: Command): this;
		/**
		 * Registers multiple commands
		 * @param commands An array of Command instances
		 * @param ignoreInvalid Whether to skip over invalid objects without throwing an error
		 */
		public registerCommands(commands: Command[], ignoreInvalid?: boolean): this;
		/**
		 * Registers all commands in a directory. The files must export a Command class constructor or instance.
		 * @param options The path to the directory, or a require-all options object
		 * @example
		 * const path = require('path')
		 * registry.registerCommandsIn(path.join(__dirname, 'commands'))
		 */
		public registerCommandsIn(options: string | RequireAllOptions): this;
		/**
		 * Registers the default commands to the registry
		 * @param commands Object specifying which commands to register
		 */
		/**
		 * Registers the default argument types to the registry
		 * @param types Object specifying which types to register
		 */
		public registerDefaultTypes(types?: DefaultTypesOptions): this;
		/**
		 * Registers a single group
		 * @param group A CommandGroup instance or the constructor parameters (with ID, name, and guarded properties)
		 *  @see {@link CommandoRegistry#registerGroups}
		 */
		public registerGroup(group: CommandGroup | { id: string, name?: string, guarded?: boolean }): this;
		/**
		 * Registers multiple groups
		 * @param groups An array of CommandGroup instances or the constructors parameters
		 * (with ID, name, and guarded properties), or arrays of {@link CommandoRegistry#registerGroup} parameters
		 * @example
		 * registry.registerGroups([
		 * 	{ id: 'fun', name: 'Fun' },
		 * 	{ id: 'mod', name: 'Moderation' }
		 * ])
		 */
		public registerGroups(groups: (CommandGroup | { id: string, name?: string, guarded?: boolean })[]): this;
		/**
		 * Registers a single argument type
		 * @param type Either an ArgumentType instance, or a constructor for one
		 *  @see {@link CommandoRegistry#registerTypes}
		 */
		public registerType(type: ArgumentType | Function): this;
		/**
		 * Registers multiple argument types
		 * @param type An array of ArgumentType instances or constructors
		 * @param ignoreInvalid Whether to skip over invalid objects without throwing an error
		 */
		public registerTypes(type: ArgumentType[] | Function[], ignoreInvalid?: boolean): this;
		/**
		 * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
		 * @param options The path to the directory, or a require-all options object
		 */
		public registerTypesIn(options: string | RequireAllOptions): this;
		/**
		 * Reregisters a command (does not support changing name, group, or memberName)
		 * @param command New command
		 * @param oldCommand Old command
		 */
		public reregisterCommand(command: Command | Function, oldCommand: Command): void;
		/**
		 * Resolves a CommandResolvable to a Command object
		 * @param command The command to resolve
		 * @returns The resolved Command
		 */
		public resolveCommand(command: CommandResolvable): Command;
		/**
		 * Resolves a command file path from a command's group ID and memberName
		 * @param group ID of the command's group
		 * @param memberName Member name of the command
		 * @returns Fully-resolved path to the corresponding command file
		 */
		public resolveCommandPath(group: string, memberName: string): string;
		/**
		 * Resolves a CommandGroupResolvable to a CommandGroup object
		 * @param group The group to resolve
		 * @returns The resolved CommandGroup
		 */
		public resolveGroup(group: CommandGroupResolvable): CommandGroup;
		/**
		 * Unregisters a command
		 * @param command Command to unregister
		 */
		public unregisterCommand(command: Command): void;
	}

	/** Has a message that can be considered user-friendly */
	export class FriendlyError extends Error {
		/**
		 * @param message The error message
		 */
		public constructor(message: string);
	}

	/** All guilds' database manager (MongoDB) */
	export class GuildDatabaseManager {
		/**
		 * @param guild The guild this database is for
		 */
		public constructor(guild: CommandoGuild)

		/** Guild for this database */
		public guild: CommandoGuild

		public active: DatabaseManager<ActiveSchema>
		public afk: DatabaseManager<AfkSchema>
		public disabled: DatabaseManager<DisabledSchema>
		public mcIps: DatabaseManager<McIpSchema>
		public moderations: DatabaseManager<ModerationSchema>
		public modules: DatabaseManager<ModuleSchema>
		public polls: DatabaseManager<PollSchema>
		public prefixes: DatabaseManager<PrefixSchema>
		public reactionRoles: DatabaseManager<ReactionRoleSchema>
		public rules: DatabaseManager<RuleSchema>
		public setup: DatabaseManager<SetupSchema>
		public stickyRoles: DatabaseManager<StickyRoleSchema>
		public welcome: DatabaseManager<WelcomeSchema>

		/** Initializes the caching of this guild's data */
		private init(data: Collection<string, Collection<string, DataModel<unknown>>>): this
	}

	export class GuildSettingsHelper {
		public constructor(client: CommandoClient, guild: CommandoGuild);

		public readonly client: CommandoClient;
		public guild: CommandoGuild;

		public clear(): Promise<void>;
		public get(key: string, defVal?: unknown): unknown;
		public remove(key: string): Promise<unknown>;
		public set(key: string, val: unknown): Promise<unknown>;
	}

	export abstract class SettingProvider {
		public abstract clear(guild: Guild | string): Promise<void>;
		public abstract destroy(): Promise<void>;
		public abstract get(guild: Guild | string, key: string, defVal?: unknown): unknown;
		public abstract init(client: CommandoClient): Promise<void>;
		public abstract remove(guild: Guild | string, key: string): Promise<unknown>;
		public abstract set(guild: Guild | string, key: string, val: unknown): Promise<unknown>;

		public static getGuildID(guild: Guild | string): string;
	}

	export class SQLiteProvider extends SettingProvider {
		public constructor(db: unknown | Promise<unknown>);

		public readonly client: CommandoClient;
		public db: unknown;
		private deleteStmt: unknown;
		private insertOrReplaceStmt: unknown;
		private listeners: Map<unknown, unknown>;
		private settings: Map<unknown, unknown>;

		public clear(guild: Guild | string): Promise<void>;
		public destroy(): Promise<void>;
		public get(guild: Guild | string, key: string, defVal?: unknown): unknown;
		public init(client: CommandoClient): Promise<void>;
		public remove(guild: Guild | string, key: string): Promise<unknown>;
		public set(guild: Guild | string, key: string, val: unknown): Promise<unknown>;
		private setupGuild(guild: string, settings: object): void;
		private setupGuildCommand(guild: CommandoGuild, command: Command, settings: object): void;
		private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: object): void;
		private updateOtherShards(key: string, val: unknown): void;
	}

	export class SyncSQLiteProvider extends SettingProvider {
		public constructor(db: unknown | Promise<unknown>);

		public readonly client: CommandoClient;
		public db: unknown;
		private deleteStmt: unknown;
		private insertOrReplaceStmt: unknown;
		private listeners: Map<unknown, unknown>;
		private settings: Map<unknown, unknown>;

		public clear(guild: Guild | string): Promise<void>;
		public destroy(): Promise<void>;
		public get(guild: Guild | string, key: string, defVal?: unknown): unknown;
		public init(client: CommandoClient): Promise<void>;
		public remove(guild: Guild | string, key: string): Promise<unknown>;
		public set(guild: Guild | string, key: string, val: unknown): Promise<unknown>;
		private setupGuild(guild: string, settings: object): void;
		private setupGuildCommand(guild: CommandoGuild, command: Command, settings: object): void;
		private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: object): void;
		private updateOtherShards(key: string, val: unknown): void;
	}

	export class util {
		public static disambiguation(items: unknown[], label: string, property?: string): string;
		public static escapeRegex(str: string): string;
		public static readonly permissions: { [K in PermissionString]: string };
		public static removeDashes(str: string): string;
	}

	/** The version of Discord.js Commando */
	export const version: string;

	/** Result object from obtaining argument values from an {@link ArgumentCollector} */
	export interface ArgumentCollectorResult<T = object> {
		/** Final values for the arguments, mapped by their keys */
		values: T | null;
		/**
		 * One of:
		 * - `user` (user cancelled)
		 * - `time` (wait time exceeded)
		 * - `promptLimit` (prompt limit exceeded)
		 */
		cancelled?: 'user' | 'time' | 'promptLimit';
		/** All messages that were sent to prompt the user */
		prompts: Message[];
		/** All of the user's messages that answered a prompt */
		answers: Message[];
	}

	/** Either a value or a function that returns a value. The function is passed the CommandoMessage and the Argument. */
	export type ArgumentDefault = unknown | Function;

	type ArgumentCheckerParams = [
		val: string,
		originalMsg: CommandoMessage,
		arg: Argument,
		currentMsg?: CommandoMessage
	]

	/** Information for the command argument */
	export interface ArgumentInfo {
		/** Key for the argument */
		key: string;
		/**
		 * Label for the argument
		 * @default this.key;
		 */
		label?: string;
		/** First prompt for the argument when it wasn't specified */
		prompt: string;
		/** Predefined error message to output for the argument when it isn't valid */
		error?: string;
		/**
		 * Type of the argument (must be the ID of one of the registered argument
		 * types or multiple ids in order of priority separated by `|` for a union type -
		 * see {@link CommandoRegistry#registerDefaultTypes} for the built-in types) */
		type?: ArgumentTypes | ArgumentTypes[];
		/**
		 * If type is `integer` or `float`, this is the maximum value of the number.
		 * If type is `string`, this is the maximum length of the string.
		 */
		max?: number;
		/**
		 * If type is `integer` or `float`, this is the minimum value of the number.
		 * If type is `string`, this is the minimum length of the string.
		 */
		min?: number;
		/** Default value for the argument (makes the arg optional - cannot be `null`) */
		oneOf?: string[];
		/**
		 * Whether the argument is required or not
		 * @default true
		 */
		required?: boolean;
		/**
		 * Whether the argument's validation is skipped or not
		 * @default false
		 */
		skipValidation?: boolean;
		/** An array of values that are allowed to be used */
		default?: ArgumentDefault;
		/**
		 * Whether the argument accepts infinite values
		 * @default false;
		 */
		infinite?: boolean;
		/** Validator function for the argument (see {@link ArgumentType#validate}) */
		validate?: (...args: ArgumentCheckerParams) => boolean | string;
		/** Parser function for the argument (see {@link ArgumentType#parse}) */
		parse?: (...args: ArgumentCheckerParams) => unknown;
		/** Empty checker for the argument (see {@link ArgumentType#isEmpty}) */
		isEmpty?: (...args: ArgumentCheckerParams) => boolean;
		/**
		 * How long to wait for input (in seconds)
		 * @default 30
		 */
		wait?: number;
	}

	/** Result object from obtaining a single {@link Argument}'s value(s) */
	export interface ArgumentResult {
		/** Final value(s) for the argument */
		value: unknown | unknown[];
		/**
		 * One of:
		 * - `user` (user cancelled)
		 * - `time` (wait time exceeded)
		 * - `promptLimit` (prompt limit exceeded)
		 */
		cancelled?: 'user' | 'time' | 'promptLimit';
		/** All messages that were sent to prompt the user */
		prompts: Message[];
		/** All of the user's messages that answered a prompt */
		answers: Message[];
	}

	export type ArgumentTypes =
		| 'string'
		| 'integer'
		| 'float'
		| 'boolean'
		| 'duration'
		| 'date'
		| 'time'
		| 'user'
		| 'member'
		| 'role'
		| 'channel'
		| 'text-channel'
		| 'thread-channel'
		| 'voice-channel'
		| 'stage-channel'
		| 'category-channel'
		| 'message'
		| 'invite'
		| 'custom-emoji'
		| 'default-emoji'
		| 'command'
		| 'group';

	/**
	 * A CommandGroupResolvable can be:
	 * - A {@link CommandGroup}
	 * - A group ID
	 */
	export type CommandGroupResolvable = CommandGroup | string;

	/** The command information */
	export interface CommandInfo {
		/** The name of the command (must be lowercase) */
		name: string;
		/** Alternative names for the command (all must be lowercase) */
		aliases?: string[];
		/**
		 * Whether automatic aliases should be added
		 * @default false
		 */
		autoAliases?: boolean;
		/** The ID of the group the command belongs to (must be lowercase) */
		group: string;
		/**
		 * The member name of the command in the group (must be lowercase)
		 * @default this.name
		 */
		memberName: string;
		/** A short description of the command */
		description: string;
		/** The command usage format string - will be automatically generated if not specified, and `args` is specified */
		format?: string;
		/** A detailed description of the command and its functionality */
		details?: string;
		/** Usage examples of the command */
		examples?: string[];
		/**
		 * Whether the command is usable only in NSFW channels.
		 * @default false
		 */
		nsfw?: boolean;
		/**
		 * Whether or not the command should only function in direct messages
		 * @default false
		 */
		dmOnly?: boolean;
		/**
		 * Whether or not the command should only function in a guild channel
		 * @default false
		 */
		guildOnly?: boolean;
		/**
		 * Whether or not the command is usable only by a server owner
		 * @default false
		 */
		guildOwnerOnly?: boolean;
		/**
		 * Whether or not the command is usable only by an owner
		 * @default false
		 */
		ownerOnly?: boolean;
		/** Permissions required by the client to use the command. */
		clientPermissions?: PermissionResolvable[];
		/** Permissions required by the user to use the command. */
		userPermissions?: PermissionResolvable[];
		/**
		 * Whether this command's user permissions are based on "moderator" permissions
		 * @default false
		 */
		modPermissions?: boolean;
		/**
		 * Whether or not the default command handling should be used.
		 * If false, then only patterns will trigger the command.
		 * @default true
		 */
		defaultHandling?: boolean;
		/** Options for throttling usages of the command. */
		throttling?: ThrottlingOptions;
		/**
		 * The data for the slash command, or `true` to use the same information as the message command
		 * @default false
		 */
		slash?: SlashCommandInfo | boolean;
		/**
		 * Whether the slash command will be registered in the test guild only or not
		 * @default false
		 */
		test?: boolean;
		/** Arguments for the command */
		args?: ArgumentInfo[];
		/**
		 * Maximum number of times to prompt a user for a single argument. Only applicable if `args` is specified.
		 * @default Infinity
		 */
		argsPromptLimit?: number;
		/**
		 * One of 'single' or 'multiple'. Only applicable if `args` is not specified.
		 * When 'single', the entire argument string will be passed to run as one argument.
		 * When 'multiple', it will be passed as multiple arguments.
		 * @default 'single'
		 */
		argsType?: string;
		/**
		 * The number of arguments to parse from the command string. Only applicable when argsType is 'multiple'.
		 * If nonzero, it should be at least 2. When this is 0, the command argument string will be split into as
		 * many arguments as it can be. When nonzero, it will be split into a maximum of this number of arguments.
		 * @default 0
		 */
		argsCount?: number;
		/**
		 * Whether or not single quotes should be allowed to box-in arguments in the command string.
		 * @default true
		 */
		argsSingleQuotes?: boolean;
		/** Patterns to use for triggering the command */
		patterns?: RegExp[];
		/**
		 * Whether the command should be protected from disabling
		 * @default false
		 */
		guarded?: boolean;
		/**
		 * Whether the command should be protected from disabling
		 * @default false
		 */
		hidden?: boolean;
		/**
		 * Whether the command should be run when an unknown command is used -
		 * there may only be one command registered with this property as `true`.
		 * @default false
		 */
		unknown?: boolean;
		/**
		 * Whether the command is marked as deprecated.
		 * @default false
		 */
		deprecated?: boolean;
		/**
		 * The name or alias of the command that is replacing the deprecated command.
		 * Required if `deprecated` is `true`.
		 */
		replacing?: string;
	}

	interface CommandoClientEvents extends ClientEvents {
		commandBlock: [instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData];
		commandCancel: [command: Command, reason: string, message: CommandoMessage, result?: ArgumentCollectorResult];
		commandError: [
			command: Command, error: Error, instances: CommandInstances, args: object | string | string[],
			fromPattern: boolean, result?: ArgumentCollectorResult
		];
		commandoGuildCreate: [guild: CommandoGuild];
		commandoMessageCreate: [message: CommandoMessage];
		commandoMessageUpdate: [oldMessage: Message, newMessage: CommandoMessage];
		commandPrefixChange: [guild?: CommandoGuild, prefix?: string];
		commandRegister: [command: Command, registry: CommandoRegistry];
		commandReregister: [newCommand: Command, oldCommand: Command];
		commandRun: [
			command: Command, promise: Promise<unknown>, instances: CommandInstances,
			args: object | string | string[], fromPattern?: boolean, result?: ArgumentCollectorResult
		];
		commandStatusChange: [guild: CommandoGuild | null, command: Command, enabled: boolean];
		commandUnregister: [command: Command];
		groupRegister: [group: CommandGroup, registry: CommandoRegistry];
		groupStatusChange: [guild: CommandoGuild | null, group: CommandGroup, enabled: boolean];
		guildsReady: [client: CommandoClient];
		typeRegister: [type: ArgumentType, registry: CommandoRegistry];
		unknownCommand: [message: CommandoMessage];
	}

	/** Options for a CommandoClient */
	export interface CommandoClientOptions extends ClientOptions {
		/**
		 * Default command prefix
		 * @default '!'
		 */
		prefix?: string;
		/**
		 * Time in seconds that command messages should be editable
		 * @default 30
		 */
		commandEditableDuration?: number;
		/**
		 * Whether messages without commands can be edited to a command
		 * @default true
		 */
		nonCommandEditable?: boolean;
		/** ID of the bot owner's Discord user, or multiple ids */
		owner?: string | string[] | Set<string>;
		/** Invite URL to the bot's support server */
		serverInvite?: string;
		/** Invite options for the bot */
		inviteOptions?: InviteGenerationOptions | string;
		/** The test guild ID or the slash commands */
		testGuild?: string;
		/** The URI which will establish your connection with MongoDB */
		mongoDBURI?: string;
		/** The directory in which your modules are stored in */
		modulesDir?: string;
	}

	/** Additional data associated with the block */
	export type CommandBlockData = {
		/**
		 * Built-in reason: `throttling`
		 * - The throttle object
		 */
		throttle?: Throttle;
		/**
		 * Built-in reason: `throttling`
		 * - Remaining time in seconds
		 */
		remaining?: number;
		/**
		 * Built-in reasons: `userPermissions` & `clientPermissions`
		 * - Missing permissions names
		 */
		missing?: PermissionString[];
	}

	/** The reason of {@link Command#onBlock} */
	export type CommandBlockReason =
		| 'guildOnly'
		| 'nsfw'
		| 'dmOnly'
		| 'guildOwnerOnly'
		| 'ownerOnly'
		| 'userPermissions'
		| 'modPermissions'
		| 'clientPermissions'
		| 'throttling';

	/**
	 * A CommandResolvable can be:
	 * - A {@link Command}
	 * - A command name
	 * - A {@link CommandoMessage}
	 */
	export type CommandResolvable = Command | string;

	/** The instances the command is being run for */
	export interface CommandInstances {
		/** The message the command is being run for */
		message?: CommandoMessage | null;
		/** The interaction the command is being run for */
		interaction?: CommandoInteraction | null;
	}

	/** Object specifying which commands to register */
	export interface DefaultCommandsOptions {
		/**
		 * Whether to register the built-in help command
		 * @default true
		 */
		help?: boolean;
		/**
		 * Whether to register the built-in prefix command
		 * @default true
		 */
		prefix?: boolean;
		/**
		 * Whether to register the built-in eval command
		 * @default true
		 */
		eval?: boolean;
		/**
		 * Whether to register the built-in ping command
		 * @default true
		 */
		ping?: boolean;
		/**
		 * Whether to register the built-in unknown command
		 * @default true
		 */
		unknown?: boolean;
		/**
		 * Whether to register the built-in command state commands (load, unload, reload)
		 * @default true
		 */
		commandState?: boolean;
	}

	/** Object specifying which types to register */
	export interface DefaultTypesOptions {
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
	 * A function that decides whether the usage of a command should be blocked
	 * @param msg Message triggering the command
	 */
	export type Inhibitor = (msg: CommandoMessage) => false | string | Inhibition;

	export interface Inhibition {
		/** Identifier for the reason the command is being blocked */
		reason: string;
		/** Response being sent to the user */
		response?: Promise<Message>;
	}

	/** Throttling object of the command. */
	export interface Throttle {
		/** Time when the throttle started */
		start: number;
		/** Amount usages of the command */
		usages: number;
		/** Timeout function for this throttle */
		timeout: NodeJS.Timeout;
	}

	/** Options for throttling usages of the command. */
	export interface ThrottlingOptions {
		/** Maximum number of usages of the command allowed in the time frame */
		usages: number;
		/** Amount of time to count the usages of the command within (in seconds) */
		duration: number;
	}

	export type ResponseType = 'reply' | 'plain' | 'direct' | 'code';

	export interface RespondOptions {
		content: StringResolvable | MessageOptions;
		fromEdit?: boolean;
		options?: MessageOptions;
		lang?: string;
		type?: ResponseType;
	}

	export interface RespondEditOptions {
		content: StringResolvable | MessageEditOptions;
		options?: MessageEditOptions;
		type?: ResponseType;
	}

	/** The slash command information */
	export interface SlashCommandInfo {
		/** The name of the command (must be lowercase) - defaults to {@link CommandInfo}'s `name` */
		name?: string;
		/** A short description of the command - defaults to {@link CommandInfo}'s `description` */
		description?: string;
		/** Options for the command */
		options?: SlashCommandOptionInfo[];
		/**
		 * Whether the reply of the slash command should be ephemeral or not
		 * @default false
		 */
		ephemeral?: boolean;
	}

	export interface SlashCommandOptionInfo {
		/** The type of the option */
		type: SlashCommandOptionType;
		/** The name of the option */
		name: string;
		/** The description of the option - required if `type` is `blah blh blahafuhijkge` */
		description: string;
		/**
		 * Whether the option is required or not
		 * @default false
		 */
		required?: boolean;
		/** The minimum value permitted - only usable if `type` is `integer` or `number` */
		minValue?: number;
		/** The maxmum value permitted - only usable if `type` is `integer` or `number` */
		maxValue?: number;
		/** The choices options for the option - only usable if `type` is `string`, `integer` or `number` */
		choices?: { name: string, value: string | number }[];
		/** The type options for the option - only usable if `type` is `channel` */
		channelTypes?: SlashCommandChannelType[];
		/** The options for the sub-command - only usable if `type` is `subcommand` */
		options?: SlashCommandOptionInfo[];
		/** Enable autocomplete interactions for this option - may not be set to true if `choices` are present */
		autocomplete?: boolean;
	}

	export type SlashCommandOptionType =
		| 'subcommand'
		| 'subcommand-group'
		| 'string'
		| 'integer'
		| 'boolean'
		| 'user'
		| 'channel'
		| 'role'
		| 'mentionable'
		| 'number';

	export type SlashCommandChannelType =
		| 'guild-text'
		| 'guild-voice'
		| 'guild-category'
		| 'guild-news'
		| 'guild-news-thread'
		| 'guild-public-thread'
		| 'guild-private-thread'
		| 'guild-stage-voice';

	export type StringResolvable = string | string[] | object;

	export interface RequireAllOptions {
		dirname: string;
		filter?: ((name: string, path: string) => string | false) | RegExp;
		excludeDirs?: RegExp;
		map?: ((name: string, path: string) => string);
		resolve?: ((module: unknown) => unknown);
		recursive?: boolean;
	}
}

/**
 * A [Twitter snowflake](https://developer.twitter.com/en/docs/twitter-ids),
 * except the epoch is 2015-01-01T00:00:00.000Z.
 *
 * If we have a snowflake '266241948824764416' we can represent it as binary:
 * ```
 * 64                                          22     17     12          0
 *  000000111011000111100001101001000101000000  00001  00000  000000000000
 *       number of ms since Discord epoch       worker  pid    increment
 * ```
 */
type Snowflake = string

interface BaseSchema { // extends Document
	readonly _id: string
	readonly createdAt?: Date
	readonly updatedAt?: Date
}

type TimeBasedModeration = 'mute' | 'temp-ban' | 'time-out'

interface ActiveSchema extends BaseSchema {
	type: TimeBasedModeration | 'temp-role'
	guild: Snowflake
	userId: Snowflake
	userTag: string
	role: Snowflake
	duration: number
}

interface AfkSchema extends BaseSchema {
	guild: Snowflake
	user: Snowflake
	status: string
}

interface DisabledSchema extends BaseSchema {
	guild?: Snowflake
	global: boolean
	commands: string[]
	groups: string[]
}

interface ErrorSchema extends BaseSchema {
	type: string
	name: string
	message: string
	command: string
	files: string
}

interface FaqSchema extends BaseSchema {
	question: string
	answer: string
}

interface ModerationSchema extends BaseSchema {
	type: 'warn' | 'ban' | 'kick' | 'soft-ban' | TimeBasedModeration
	guild: Snowflake
	userId: Snowflake
	userTag: string
	modId: Snowflake
	modTag: string
	reason: string
	duration: string
}

interface McIpSchema extends BaseSchema {
	guild: Snowflake
	type: 'java' | 'bedrock'
	ip: string
	port: number
}

interface ModuleSchema extends BaseSchema {
	guild: Snowflake
	// chatFilter: boolean
	// scamDetector: boolean
	stickyRoles: boolean
	welcome: boolean
	auditLogs: {
		boosts: boolean
		channels: boolean
		commands: boolean
		emojis: boolean
		events: boolean
		invites: boolean
		members: boolean
		messages: boolean
		moderation: boolean
		modules: boolean
		roles: boolean
		server: boolean
		stickers: boolean
		threads: boolean
		users: boolean
		voice: boolean
	}
}

type Module =
	| 'auto-mod'
	| 'audit-logs'
	| 'chat-filter'
	| 'sticky-roles'
	| 'welcome'
// | 'scam-detector'

type AuditLog =
	| 'boosts'
	| 'channels'
	| 'commands'
	| 'emojis'
	| 'events'
	| 'invites'
	| 'members'
	| 'messages'
	| 'moderation'
	| 'modules'
	| 'roles'
	| 'server'
	| 'stickers'
	| 'threads'
	| 'users'
	| 'voice'

interface PrefixSchema extends BaseSchema {
	global: boolean
	guild?: Snowflake
	prefix: string
}

interface PollSchema extends BaseSchema {
	guild: Snowflake
	channel: Snowflake
	message: Snowflake
	emojis: (string | Snowflake)[]
	duration: number
}

interface ReactionRoleSchema extends BaseSchema {
	guild: Snowflake
	channel: Snowflake
	message: Snowflake
	roles: Snowflake[]
	emojis: (string | Snowflake)[]
}

interface ReminderSchema extends BaseSchema {
	user: Snowflake
	reminder: string
	remindAt: number
	message: Snowflake
	msgURL: string
	channel: Snowflake
}

interface RuleSchema extends BaseSchema {
	guild: Snowflake
	rules: string[]
}

interface SetupSchema extends BaseSchema {
	guild: Snowflake
	logsChannel: Snowflake
	memberRole: Snowflake
	botRole: Snowflake
	mutedRole: Snowflake
	lockChannels: Snowflake[]
}

interface StickyRoleSchema extends BaseSchema {
	guild: Snowflake
	user: Snowflake
	roles: Snowflake[]
}

interface TodoSchema extends BaseSchema {
	user: Snowflake
	list: string[]
}

interface WelcomeSchema extends BaseSchema {
	guild: Snowflake
	channel: Snowflake
	message: string
}
