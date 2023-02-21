import { Collection, Message, MessageCreateOptions, PermissionsString } from 'discord.js';
import { capitalize } from 'lodash';
import { CommandInstances } from './commands/base';
import CommandoInteraction from './extensions/interaction';
import CommandoMessage from './extensions/message';

export type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

/** Options for splitting a message */
export interface SplitOptions {
    /**
     * Maximum character length per message piece.
     * @default 2000
     */
    maxLength?: number;
    /**
     * Character(s) or Regex(es) to split the message with, an array can be used to split multiple times.
     * @default '\n'
     */
    char?: RegExp | RegExp[] | string[] | string;
    /** Text to prepend to every piece except the first. */
    prepend?: string;
    /** Text to append to every piece except the last. */
    append?: string;
}

/** Contains various general-purpose utility methods and constants. */
export default class Util extends null {
    /** Object that maps every PermissionString to its representation inside the Discord client. */
    public static get permissions(): Readonly<Record<PermissionsString, string>> {
        return {
            CreateInstantInvite: 'Create instant invite',
            KickMembers: 'Kick members',
            BanMembers: 'Ban members',
            Administrator: 'Administrator',
            ManageChannels: 'Manage channels',
            ManageGuild: 'Manage server',
            AddReactions: 'Add reactions',
            ViewAuditLog: 'View audit log',
            PrioritySpeaker: 'Priority speaker',
            Stream: 'Video',
            ViewChannel: 'View channels',
            SendMessages: 'Send messages',
            SendTTSMessages: 'Send TTS messages',
            ManageMessages: 'Manage messages',
            EmbedLinks: 'Embed links',
            AttachFiles: 'Attach files',
            ReadMessageHistory: 'Read message history',
            MentionEveryone: 'Mention everyone',
            UseExternalEmojis: 'Use external emojis',
            ViewGuildInsights: 'View server insights',
            Connect: 'Connect',
            Speak: 'Speak',
            MuteMembers: 'Mute members',
            DeafenMembers: 'Deafen members',
            MoveMembers: 'Move members',
            UseVAD: 'Use voice activity',
            ChangeNickname: 'Change nickname',
            ManageNicknames: 'Manage nicknames',
            ManageRoles: 'Manage roles',
            ManageWebhooks: 'Manage webhooks',
            ManageEmojisAndStickers: 'Manage emojis and stickers',
            UseApplicationCommands: 'Use application commands',
            RequestToSpeak: 'Request to speak',
            ManageEvents: 'Manage events',
            ManageThreads: 'Manage threads',
            CreatePublicThreads: 'Create public threads',
            CreatePrivateThreads: 'Create private threads',
            UseExternalStickers: 'Use external stickers',
            SendMessagesInThreads: 'Send messages in threads',
            UseEmbeddedActivities: 'Use activities',
            ModerateMembers: 'Time out members',
        };
    }

    /**
     * Escapes the following characters from a string: `|\{}()[]^$+*?.`.
     * @param str - The string to escape.
     */
    public static escapeRegex(str: string): string {
        return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }

    /**
     * Basic probability function.
     * @param n - The probability percentage, from 0 to 100.
     */
    public static probability(n: number): boolean {
        n /= 100;
        return !!n && Math.random() <= n;
    }

    /**
     * Checks if the argument is a promise.
     * @param obj - The object of function to check.
     */
    public static isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T> {
        // @ts-expect-error: 'then' does not exist in type S
        return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }

    /**
     * Removes the reply ping from a message if its sent in DMs.
     * @param msg - The message instance.
     * @returns A {@link MessageCreateOptions} object.
     */
    public static noReplyPingInDMs(msg: CommandoMessage | Message): MessageCreateOptions {
        const options: MessageCreateOptions = msg.channel.isDMBased() ? {
            allowedMentions: { repliedUser: false },
        } : {};

        return options;
    }

    /**
     * Disambiguate items from an array into a list.
     * @param items - An array of strings or objects.
     * @param label - The label for the items list.
     * @param property - The property to read from the objects (only usable if `items` is an array of objects).
     * @returns A string with the disambiguated items.
     */
    public static disambiguation(items: Array<Record<string, string> | string>, label: string, property = 'name'): string {
        const itemList = items.map(item =>
            `"${(typeof item !== 'string' ? item[property] : item).replace(/ /g, '\xa0')}"`
        ).join(',   ');
        return `Multiple ${label} found, please be more specific: ${itemList}`;
    }

    /**
     * Removes the dashes from a string and capitalizes the characters in front of them.
     * @param str - The string to parse.
     */
    public static removeDashes(str: string): string {
        const arr = str.split('-');
        const first = arr.shift();
        const rest = arr.map(capitalize).join('');
        return first + rest;
    }

    /**
     * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
     * @param text - Content to split
     * @param options - Options controlling the behavior of the split
     */
    public static splitMessage(text: string, options: SplitOptions = {}): string[] {
        const { maxLength = 2_000, char = '\n', prepend = '', append = '' } = options;
        text = Util.verifyString(text);
        if (text.length <= maxLength) return [text];

        let splitText = [text];
        if (Array.isArray(char)) {
            while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
                const currentChar = char.shift();
                if (currentChar instanceof RegExp) {
                    splitText = Util.filterNullishItems(
                        splitText.flatMap(chunk => chunk.match(currentChar))
                    );
                }
                if (typeof currentChar === 'string') {
                    splitText = splitText.flatMap(chunk => chunk.split(currentChar));
                }
            }
        } else {
            splitText = text.split(char);
        }

        if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');

        const messages: string[] = [];
        let msg = '';
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk + append).length > maxLength) {
                messages.push(msg + append);
                msg = prepend;
            }
            msg += (msg && msg !== prepend ? char : '') + chunk;
        }

        return messages.concat(msg).filter(m => m.length !== 0);
    }

    /**
     * **Extremely hacky method. Use at own risk.**
     * Will mutate the first object into an instance of the new one, assigning all of its properties, accessors and methods.
     * @param obj - The object to mutate.
     * @param newObj - The data to assign.
     */
    public static mutateObjectInstance<T extends object>(obj: object, newObj: T): T {
        Object.assign(obj, newObj);
        const { prototype } = newObj.constructor;
        const properties = Object.getOwnPropertyNames(prototype)
            .filter(prop => prop !== 'constructor');

        for (const prop of properties) {
            const propData = Object.getOwnPropertyDescriptor(prototype, prop);
            if (!propData) continue;
            Object.defineProperty(obj, prop, propData);
        }
        Object.setPrototypeOf(obj, prototype);

        return obj as T;
    }

    /**
     * Gets the last item of an array.
     * @param array - An array.
     */
    public static lastFromArray<T>(array: T[]): T {
        return array[array.length - 1];
    }

    /**
     * **For arrays.**
     * Filters all nullish (`undefined` | `null`) items from an array. Mostly useful for TS.
     * @param array - Any array that could contain nullish items.
     * @returns An array with all non-nullish items.
     */
    public static filterNullishItems<T>(array: Array<T | null | undefined>): T[] {
        return array.filter((item): item is T => !Util.isNullish(item));
    }

    /**
     * **For {@link Collection Collections}.**
     * Filters all nullish (`undefined` | `null`) items from a collection. Mostly useful for TS.
     * @param collection - Any collection that could contain nullish values.
     * @returns An array with all non-nullish values.
     */
    public static filterNullishValues<K, V>(collection: Collection<K, V | null | undefined>): Collection<K, V> {
        return collection.filter((item): item is V => !Util.isNullish(item));
    }

    /**
     * Checks if a value is undefined.
     * @param val - The value to check.
     * @returns Whether the value is nullish.
     */
    public static isNullish(val: unknown): val is null | undefined {
        return typeof val === 'undefined' || val === null;
    }

    /**
     * Get the current instance of a command. Useful if you need to get the same properties from both instances.
     * @param instances - The instances object.
     * @returns The instance of the command.
     */
    public static getInstanceFrom<InGuild extends boolean = boolean>(
        instances: CommandInstances<InGuild>
    ): CommandoInteraction<InGuild> | CommandoMessage<InGuild> {
        if ('message' in instances) return instances.message;
        return instances.interaction;
    }

    public static equals<T extends number | string, V extends T>(value: T, values: V[]): value is V {
        for (const val of values) {
            if (val === value) return true;
        }
        return false;
    }

    /**
     * Verifies the provided data is a string, otherwise throws provided error.
     * @param data - The string resolvable to resolve
     * @param error - The Error constructor to instantiate. Defaults to Error
     * @param errorMessage - The error message to throw with. Defaults to "Expected string, got <data> instead."
     * @param allowEmpty - Whether an empty string should be allowed
     */
    protected static verifyString(
        data: string, error = Error, errorMessage = `Expected a string, got ${typeof data} instead.`, allowEmpty = true
    ): string {
        /* eslint-disable new-cap */
        if (typeof data !== 'string') throw new error(errorMessage);
        if (!allowEmpty && data.length === 0) throw new error(errorMessage);
        return data;
        /* eslint-enable new-cap */
    }
}
