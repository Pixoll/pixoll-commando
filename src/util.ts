import { Message, MessageOptions } from 'discord.js';
import { capitalize } from 'lodash';
import CommandoMessage from './extensions/message';

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
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    static get permissions() {
        return {
            CREATE_INSTANT_INVITE: 'Create instant invite',
            KICK_MEMBERS: 'Kick members',
            BAN_MEMBERS: 'Ban members',
            ADMINISTRATOR: 'Administrator',
            MANAGE_CHANNELS: 'Manage channels',
            MANAGE_GUILD: 'Manage server',
            ADD_REACTIONS: 'Add reactions',
            VIEW_AUDIT_LOG: 'View audit log',
            PRIORITY_SPEAKER: 'Priority speaker',
            STREAM: 'Video',
            VIEW_CHANNEL: 'View channels',
            SEND_MESSAGES: 'Send messages',
            SEND_TTS_MESSAGES: 'Send TTS messages',
            MANAGE_MESSAGES: 'Manage messages',
            EMBED_LINKS: 'Embed links',
            ATTACH_FILES: 'Attach files',
            READ_MESSAGE_HISTORY: 'Read message history',
            MENTION_EVERYONE: 'Mention everyone',
            USE_EXTERNAL_EMOJIS: 'Use external emojis',
            VIEW_GUILD_INSIGHTS: 'View server insights',
            CONNECT: 'Connect',
            SPEAK: 'Speak',
            MUTE_MEMBERS: 'Mute members',
            DEAFEN_MEMBERS: 'Deafen members',
            MOVE_MEMBERS: 'Move members',
            USE_VAD: 'Use voice activity',
            CHANGE_NICKNAME: 'Change nickname',
            MANAGE_NICKNAMES: 'Manage nicknames',
            MANAGE_ROLES: 'Manage roles',
            MANAGE_WEBHOOKS: 'Manage webhooks',
            MANAGE_EMOJIS_AND_STICKERS: 'Manage emojis and stickers',
            USE_APPLICATION_COMMANDS: 'Use application commands',
            REQUEST_TO_SPEAK: 'Request to speak',
            MANAGE_EVENTS: 'Manage events',
            MANAGE_THREADS: 'Manage threads',
            /** @deprecated This will be removed in discord.js v14 */
            USE_PUBLIC_THREADS: 'Use public threads',
            CREATE_PUBLIC_THREADS: 'Create public threads',
            /** @deprecated This will be removed in discord.js v14 */
            USE_PRIVATE_THREADS: 'Use private threads',
            CREATE_PRIVATE_THREADS: 'Create private threads',
            USE_EXTERNAL_STICKERS: 'Use external stickers',
            SEND_MESSAGES_IN_THREADS: 'Send messages in threads',
            START_EMBEDDED_ACTIVITIES: 'Start activities',
            MODERATE_MEMBERS: 'Time out members',
        } as const;
    }

    /**
     * Escapes the following characters from a string: `|\{}()[]^$+*?.`.
     * @param str - The string to escape.
     */
    static escapeRegex(str: string): string {
        return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }

    /**
     * Basic probability function.
     * @param n - The probability percentage, from 0 to 100.
     */
    static probability(n: number): boolean {
        n /= 100;
        return !!n && Math.random() <= n;
    }

    /**
     * Checks if the argument is a promise.
     * @param obj - The object of function to check.
     */
    static isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T> {
        // @ts-expect-error: 'then' does not exist in type S
        return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }

    /**
     * Removes the reply ping from a message if its sent in DMs.
     * @param msg - The message instance.
     * @returns A {@link MessageOptions} object.
     */
    static noReplyPingInDMs(msg: CommandoMessage | Message): MessageOptions {
        const options: MessageOptions = msg.channel.type === 'DM' ? {
            allowedMentions: { repliedUser: false }
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
    static disambiguation(items: Array<Record<string, string> | string>, label: string, property = 'name'): string {
        const itemList = items.map(item =>
            `"${(property && typeof item !== 'string' ? item[property] : item as string).replace(/ /g, '\xa0')}"`
        ).join(',   ');
        return `Multiple ${label} found, please be more specific: ${itemList}`;
    }

    /**
     * Removes the dashes from a string and capitalizes the characters in front of them.
     * @param str - The string to parse.
     */
    static removeDashes(str: string): string {
        const arr = str.split('-');
        const first = arr.shift();
        const rest = arr.map(capitalize).join('');
        return first + rest;
    }

    /**
     * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
     * @param text - Content to split
     * @param options Options controlling the behavior of the split
     */
    static splitMessage(text: string, options: SplitOptions = {}): string[] {
        const { maxLength = 2_000, char = '\n', prepend = '', append = '' } = options;
        text = Util.verifyString(text);
        if (text.length <= maxLength) return [text];

        let splitText = [text];
        if (Array.isArray(char)) {
            while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
                const currentChar = char.shift()!;
                if (currentChar instanceof RegExp) {
                    splitText = splitText.flatMap(chunk => chunk.match(currentChar)).filter(c => c) as string[];
                } else {
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

        return messages.concat(msg).filter(m => m);
    }

    /**
     * **Extremely hacky method. Use at own risk.**
     * Will mutate the first object into an instance of the new one, assigning all of its properties, accessors and methods.
     * @param obj - The object to mutate.
     * @param newObj - The data to assign.
     */
    static mutateObjectInstance<T extends object>(obj: object, newObj: T): T {
        Object.assign(obj, newObj);
        const { prototype } = newObj.constructor;
        for (const prop of Object.getOwnPropertyNames(prototype)) {
            if (prop === 'constructor') continue;
            const propData = Object.getOwnPropertyDescriptor(prototype, prop)!;
            Object.defineProperty(obj, prop, propData);
        }
        Object.setPrototypeOf(obj, prototype);
        return obj as T;
    }

    /**
     * Verifies the provided data is a string, otherwise throws provided error.
     * @param data The string resolvable to resolve
     * @param error The Error constructor to instantiate. Defaults to Error
     * @param errorMessage The error message to throw with. Defaults to "Expected string, got <data> instead."
     * @param allowEmpty Whether an empty string should be allowed
     */
    protected static verifyString(
        data: string, error = Error, errorMessage = `Expected a string, got ${typeof data} instead.`, allowEmpty = true,
    ): string {
        /* eslint-disable new-cap */
        if (typeof data !== 'string') throw new error(errorMessage);
        if (!allowEmpty && data.length === 0) throw new error(errorMessage);
        return data;
        /* eslint-enable new-cap */
    }
}
