import { Client, Collection, Guild, If, Message, MessageCreateOptions, PartialMessage, PermissionsString } from 'discord.js';
import { capitalize } from 'lodash';
import { Document } from 'mongoose';
import CommandoClient from './client';
import { JSONIfySchema, SchemaResolvable } from './database/Schemas';
import CommandoGuild from './extensions/guild';
import CommandoMessage from './extensions/message';

export type Nullable<T> = T | null | undefined;

export type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

export type Require<T extends object, K extends keyof T = keyof T, Expand extends boolean = true> = Expand extends true
    ? Destructure<Omit<T, K> & Required<Pick<T, K>>>
    : Omit<T, K> & Required<Pick<T, K>>;

export type Destructure<T> = { [P in keyof T]: T[P] };

/** Does not preserve {@link Tuple tuples} */
export type Mutable<T> = T extends Array<infer U> | ReadonlyArray<infer U>
    ? (U extends object ? Array<Mutable<U>> : U[])
    : T extends object
    ? { -readonly [P in keyof T]: Mutable<T[P]> }
    : T;

export type PropertiesOf<T> = T[keyof T];

export type Commandoify<T, Ready extends boolean = boolean> = OverrideGuild<OverrideClient<T, Ready>>;

export type OverrideGuild<T> = T extends { guild: Guild | infer R }
    ? Omit<T, 'guild'> & { guild: CommandoGuild | Exclude<R, Guild> }
    : T;

export type OverrideClient<T, Ready extends boolean = boolean> = T extends { client: Client | infer R }
    ? Omit<T, 'client'> & { readonly client: CommandoClient<Ready> | Exclude<R, Client> }
    : T;

export type CommandoifyMessage<
    Type extends Message | PartialMessage,
    InGuild extends boolean = boolean
> = OverrideClient<Omit<Type extends Message ? Message<InGuild> : PartialMessage, 'guild'> & {
    get guild(): If<InGuild, CommandoGuild>;
}>;

export type Constructable<T> = AbstractConstructable<T> | NonAbstractConstructable<T>;
export type NonAbstractConstructable<T = unknown> = new (...args: unknown[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractConstructable<T = any> = abstract new (...args: any[]) => T;
export type ConstructorResult<T> = T extends AbstractConstructable<infer U> | NonAbstractConstructable<infer U> ? U : never;

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

type ReadonlyArguments = ReadonlyArray<Readonly<Record<string, unknown>>>;

export type KebabToCamelCase<S extends string> = S extends `${infer Before}-${infer After}`
    ? `${Before}${Capitalize<KebabToCamelCase<After>>}`
    : S;

const permissions = Object.freeze<Record<PermissionsString, string>>({
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
});

/** Contains various general-purpose utility methods and constants. */
export default class Util extends null {
    /** Object that maps every PermissionString to its representation inside the Discord client. */
    public static get permissions(): Readonly<Record<PermissionsString, string>> {
        return permissions;
    }

    /**
     * Escapes the following characters from a string: `|\{}()[]^$+*?.`.
     * @param string - The string to escape.
     */
    public static escapeRegex(string: string): string {
        return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }

    /**
     * Basic probability function.
     * @param n - The probability percentage, from 0 to 100.
     */
    public static probability(n: number): boolean {
        return !!n && Math.random() <= (n / 100);
    }

    /**
     * Checks if the argument is a promise.
     * @param obj - The object of function to check.
     */
    public static isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T> {
        return !!obj
            && (typeof obj === 'object' || typeof obj === 'function')
            && 'then' in obj
            && typeof obj.then === 'function';
    }

    /**
     * Removes the reply ping from a message if its sent in DMs.
     * @param message - The message instance.
     * @returns A {@link MessageCreateOptions} object.
     */
    public static noReplyPingInDMs(message: CommandoMessage | Message): Pick<MessageCreateOptions, 'allowedMentions'> {
        const options: Pick<MessageCreateOptions, 'allowedMentions'> = message.channel.isDMBased() ? {
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
    public static disambiguation<T extends object>(items: T[], label: string, property: keyof T): string;
    public static disambiguation<T extends { name: string }>(items: T[], label: string, property?: keyof T): string;
    public static disambiguation(items: string[], label: string): string;
    public static disambiguation<T extends object | string>(
        items: T[], label: string, property?: T extends string ? never : keyof T
    ): string {
        const itemList = items.map(item =>
            `"${(typeof item !== 'string'
                ? `${item[property ?? 'name' as keyof T]}`
                : item
            ).replace(/ /g, '\xa0')}"`
        ).join(',   ');
        return `Multiple ${label} found, please be more specific: ${itemList}`;
    }

    /**
     * Turns kebab-case to camelCase
     * @param string - The string to parse.
     */
    public static kebabToCamelCase<S extends string>(string: S): KebabToCamelCase<S> {
        const arr = string.split('-');
        const first = arr.shift();
        const rest = arr.map(capitalize).join('');
        return (first + rest) as KebabToCamelCase<S>;
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
     * @param value - The value to check.
     * @returns Whether the value is nullish.
     */
    public static isNullish(value: unknown): value is null | undefined {
        return typeof value === 'undefined' || value === null;
    }

    /**
     * Checks if `value` equals **every** entry in `values`.
     * @param value - The original value.
     * @param values - The values to compare `value` to.
     */
    public static equals<T extends number | string, V extends T>(value: T, values: V[]): value is V {
        return values.some(val => val === value);
    }

    /** Removes the readonly modifier from the arguments array and its objects. */
    public static removeReadonlyFromArguments<T extends ReadonlyArguments>(args: T): Mutable<T> {
        return args.map(a => Object.fromEntries(Object.entries(a))) as Mutable<T>;
    }

    /** Get entries from a **numbered** enum. Might not work properly with enums that map to strings. */
    public static getEnumEntries<T extends object>(enumObj: T): Array<[Extract<keyof T, string>, PropertiesOf<T>]> {
        return Object.entries(enumObj).filter((entry): entry is [Extract<keyof T, string>, PropertiesOf<T>] =>
            typeof entry[1] === 'number'
        );
    }

    /** Deep copy a plain object. */
    public static deepCopy<T>(value: T): T {
        return JSON.parse(JSON.stringify(value));
    }

    /** Pick properties from an object. */
    public static pick<T extends object, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
        return Util.omitOrPick('pick', object, keys);
    }

    /** Omit properties from an object. */
    public static omit<T extends object, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
        return Util.omitOrPick('omit', object, keys);
    }

    /** JSONify a raw mongoose document. */
    public static jsonifyDocument<T extends SchemaResolvable, U extends Document<T> | null>(
        doc: Document<T> | U
    ): JSONIfySchema<T> | (U extends Document ? never : null) {
        if (!doc) return null as U extends Document ? never : null;
        const jsonified = doc.toJSON({
            flattenMaps: false,
            versionKey: false,
        }) as T;
        jsonified._id = jsonified._id.toString();
        return jsonified as JSONIfySchema<T>;
    }

    /** Generalized handler for {@link Util.pick Util#pick} and {@link Util.omit Util#omit}. */
    protected static omitOrPick<Kind extends 'omit' | 'pick', T extends object, K extends keyof T>(
        kind: Kind, object: T, keys: K[]
    ): Kind extends 'omit' ? Omit<T, K> : Pick<T, K> {
        const finalObject: Record<string, unknown> = {};
        const validEntires = Object.entries(object as Record<string, unknown>)
            .filter(([k]) =>
                kind === 'omit' ? !keys.includes(k as K) : keys.includes(k as K)
            );
        for (const [key, value] of validEntires) {
            finalObject[key] = value;
        }
        return finalObject as Kind extends 'omit' ? Omit<T, K> : Pick<T, K>;
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
