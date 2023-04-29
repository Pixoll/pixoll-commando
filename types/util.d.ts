import { Client, Collection, Guild, If, Message, MessageCreateOptions, PartialMessage, PermissionsString } from 'discord.js';
import { Document } from 'mongoose';
import CommandoClient from './client';
import { JSONIfySchema, SchemaResolvable } from './database/Schemas';
import CommandoGuild from './extensions/guild';
import CommandoMessage from './extensions/message';
export type Nullable<T> = T | null | undefined;
export type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;
export type Require<T extends object, K extends keyof T = keyof T, Expand extends boolean = true> = Expand extends true ? Destructure<Omit<T, K> & Required<Pick<T, K>>> : Omit<T, K> & Required<Pick<T, K>>;
export type Destructure<T> = {
    [P in keyof T]: T[P];
};
/** Does not preserve {@link Tuple tuples} */
export type Mutable<T> = T extends Array<infer U> | ReadonlyArray<infer U> ? (U extends object ? Array<Mutable<U>> : U[]) : T extends object ? {
    -readonly [P in keyof T]: Mutable<T[P]>;
} : T;
export type PropertiesOf<T> = T[keyof T];
export type Commandoify<T, Ready extends boolean = boolean> = OverrideGuild<OverrideClient<T, Ready>>;
export type OverrideGuild<T> = T extends {
    guild: Guild | infer R;
} ? Omit<T, 'guild'> & {
    guild: CommandoGuild | Exclude<R, Guild>;
} : T;
export type OverrideClient<T, Ready extends boolean = boolean> = T extends {
    client: Client | infer R;
} ? Omit<T, 'client'> & {
    readonly client: CommandoClient<Ready> | Exclude<R, Client>;
} : T;
export type CommandoifyMessage<Type extends Message | PartialMessage, InGuild extends boolean = boolean> = OverrideClient<Omit<Type extends Message ? Message<InGuild> : PartialMessage, 'guild'> & {
    get guild(): If<InGuild, CommandoGuild>;
}>;
export type Constructable<T> = AbstractConstructable<T> | NonAbstractConstructable<T>;
export type NonAbstractConstructable<T = unknown> = new (...args: unknown[]) => T;
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
export type KebabToCamelCase<S extends string> = S extends `${infer Before}-${infer After}` ? `${Before}${Capitalize<KebabToCamelCase<After>>}` : S;
/** Contains various general-purpose utility methods and constants. */
export default class Util extends null {
    /** Object that maps every PermissionString to its representation inside the Discord client. */
    static get permissions(): Readonly<Record<PermissionsString, string>>;
    /**
     * Escapes the following characters from a string: `|\{}()[]^$+*?.`.
     * @param string - The string to escape.
     */
    static escapeRegex(string: string): string;
    /**
     * Basic probability function.
     * @param n - The probability percentage, from 0 to 100.
     */
    static probability(n: number): boolean;
    /**
     * Checks if the argument is a promise.
     * @param obj - The object of function to check.
     */
    static isPromise<T, S>(obj: PromiseLike<T> | S): obj is PromiseLike<T>;
    /**
     * Removes the reply ping from a message if its sent in DMs.
     * @param message - The message instance.
     * @returns A {@link MessageCreateOptions} object.
     */
    static noReplyPingInDMs(message: CommandoMessage | Message): Pick<MessageCreateOptions, 'allowedMentions'>;
    /**
     * Disambiguate items from an array into a list.
     * @param items - An array of strings or objects.
     * @param label - The label for the items list.
     * @param property - The property to read from the objects (only usable if `items` is an array of objects).
     * @returns A string with the disambiguated items.
     */
    static disambiguation<T extends object>(items: T[], label: string, property: keyof T): string;
    static disambiguation<T extends {
        name: string;
    }>(items: T[], label: string, property?: keyof T): string;
    static disambiguation(items: string[], label: string): string;
    /**
     * Turns kebab-case to camelCase
     * @param string - The string to parse.
     */
    static kebabToCamelCase<S extends string>(string: S): KebabToCamelCase<S>;
    /**
     * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
     * @param text - Content to split
     * @param options - Options controlling the behavior of the split
     */
    static splitMessage(text: string, options?: SplitOptions): string[];
    /**
     * **Extremely hacky method. Use at own risk.**
     * Will mutate the first object into an instance of the new one, assigning all of its properties, accessors and methods.
     * @param obj - The object to mutate.
     * @param newObj - The data to assign.
     */
    static mutateObjectInstance<T extends object>(obj: object, newObj: T): T;
    /**
     * Gets the last item of an array.
     * @param array - An array.
     */
    static lastFromArray<T>(array: T[]): T;
    /**
     * **For arrays.**
     * Filters all nullish (`undefined` | `null`) items from an array. Mostly useful for TS.
     * @param array - Any array that could contain nullish items.
     * @returns An array with all non-nullish items.
     */
    static filterNullishItems<T>(array: Array<T | null | undefined>): T[];
    /**
     * **For {@link Collection Collections}.**
     * Filters all nullish (`undefined` | `null`) items from a collection. Mostly useful for TS.
     * @param collection - Any collection that could contain nullish values.
     * @returns An array with all non-nullish values.
     */
    static filterNullishValues<K, V>(collection: Collection<K, V | null | undefined>): Collection<K, V>;
    /**
     * Checks if a value is undefined.
     * @param value - The value to check.
     * @returns Whether the value is nullish.
     */
    static isNullish(value: unknown): value is null | undefined;
    /**
     * Checks if `value` equals **every** entry in `values`.
     * @param value - The original value.
     * @param values - The values to compare `value` to.
     */
    static equals<T extends number | string, V extends T>(value: T, values: V[]): value is V;
    /** Removes the readonly modifier from the arguments array and its objects. */
    static removeReadonlyFromArguments<T extends ReadonlyArguments>(args: T): Mutable<T>;
    /** Get entries from a **numbered** enum. Might not work properly with enums that map to strings. */
    static getEnumEntries<T extends object>(enumObj: T): Array<[Extract<keyof T, string>, PropertiesOf<T>]>;
    /** Deep copy a plain object. */
    static deepCopy<T>(value: T): T;
    /** Pick properties from an object. */
    static pick<T extends object, K extends keyof T>(object: T, keys: K[]): Pick<T, K>;
    /** Omit properties from an object. */
    static omit<T extends object, K extends keyof T>(object: T, keys: K[]): Omit<T, K>;
    /** JSONify a raw mongoose document. */
    static jsonifyDocument<T extends SchemaResolvable, U extends Document<T> | null>(doc: Document<T> | U): JSONIfySchema<T> | (U extends Document ? never : null);
    /** Generalized handler for {@link Util.pick Util#pick} and {@link Util.omit Util#omit}. */
    protected static omitOrPick<Kind extends 'omit' | 'pick', T extends object, K extends keyof T>(kind: Kind, object: T, keys: K[]): Kind extends 'omit' ? Omit<T, K> : Pick<T, K>;
    /**
     * Verifies the provided data is a string, otherwise throws provided error.
     * @param data - The string resolvable to resolve
     * @param error - The Error constructor to instantiate. Defaults to Error
     * @param errorMessage - The error message to throw with. Defaults to "Expected string, got <data> instead."
     * @param allowEmpty - Whether an empty string should be allowed
     */
    protected static verifyString(data: string, error?: ErrorConstructor, errorMessage?: string, allowEmpty?: boolean): string;
}
export {};
