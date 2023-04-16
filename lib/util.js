"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const permissions = Object.freeze({
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
class Util extends null {
    /** Object that maps every PermissionString to its representation inside the Discord client. */
    static get permissions() {
        return permissions;
    }
    /**
     * Escapes the following characters from a string: `|\{}()[]^$+*?.`.
     * @param str - The string to escape.
     */
    static escapeRegex(str) {
        return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }
    /**
     * Basic probability function.
     * @param n - The probability percentage, from 0 to 100.
     */
    static probability(n) {
        n /= 100;
        return !!n && Math.random() <= n;
    }
    /**
     * Checks if the argument is a promise.
     * @param obj - The object of function to check.
     */
    static isPromise(obj) {
        return !!obj
            && (typeof obj === 'object' || typeof obj === 'function')
            && 'then' in obj
            && typeof obj.then === 'function';
    }
    /**
     * Removes the reply ping from a message if its sent in DMs.
     * @param msg - The message instance.
     * @returns A {@link MessageCreateOptions} object.
     */
    static noReplyPingInDMs(msg) {
        const options = msg.channel.isDMBased() ? {
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
    static disambiguation(items, label, property) {
        const itemList = items.map(item => `"${(typeof item !== 'string'
            ? `${item[property ?? 'name']}`
            : item).replace(/ /g, '\xa0')}"`).join(',   ');
        return `Multiple ${label} found, please be more specific: ${itemList}`;
    }
    /**
     * Removes the dashes from a string and capitalizes the characters in front of them.
     * @param str - The string to parse.
     */
    static removeDashes(str) {
        const arr = str.split('-');
        const first = arr.shift();
        const rest = arr.map(lodash_1.capitalize).join('');
        return first + rest;
    }
    /**
     * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
     * @param text - Content to split
     * @param options - Options controlling the behavior of the split
     */
    static splitMessage(text, options = {}) {
        const { maxLength = 2000, char = '\n', prepend = '', append = '' } = options;
        text = Util.verifyString(text);
        if (text.length <= maxLength)
            return [text];
        let splitText = [text];
        if (Array.isArray(char)) {
            while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
                const currentChar = char.shift();
                if (currentChar instanceof RegExp) {
                    splitText = Util.filterNullishItems(splitText.flatMap(chunk => chunk.match(currentChar)));
                }
                if (typeof currentChar === 'string') {
                    splitText = splitText.flatMap(chunk => chunk.split(currentChar));
                }
            }
        }
        else {
            splitText = text.split(char);
        }
        if (splitText.some(elem => elem.length > maxLength))
            throw new RangeError('SPLIT_MAX_LEN');
        const messages = [];
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
    static mutateObjectInstance(obj, newObj) {
        Object.assign(obj, newObj);
        const { prototype } = newObj.constructor;
        const properties = Object.getOwnPropertyNames(prototype)
            .filter(prop => prop !== 'constructor');
        for (const prop of properties) {
            const propData = Object.getOwnPropertyDescriptor(prototype, prop);
            if (!propData)
                continue;
            Object.defineProperty(obj, prop, propData);
        }
        Object.setPrototypeOf(obj, prototype);
        return obj;
    }
    /**
     * Gets the last item of an array.
     * @param array - An array.
     */
    static lastFromArray(array) {
        return array[array.length - 1];
    }
    /**
     * **For arrays.**
     * Filters all nullish (`undefined` | `null`) items from an array. Mostly useful for TS.
     * @param array - Any array that could contain nullish items.
     * @returns An array with all non-nullish items.
     */
    static filterNullishItems(array) {
        return array.filter((item) => !Util.isNullish(item));
    }
    /**
     * **For {@link Collection Collections}.**
     * Filters all nullish (`undefined` | `null`) items from a collection. Mostly useful for TS.
     * @param collection - Any collection that could contain nullish values.
     * @returns An array with all non-nullish values.
     */
    static filterNullishValues(collection) {
        return collection.filter((item) => !Util.isNullish(item));
    }
    /**
     * Checks if a value is undefined.
     * @param val - The value to check.
     * @returns Whether the value is nullish.
     */
    static isNullish(val) {
        return typeof val === 'undefined' || val === null;
    }
    /**
     * Checks if `value` equals **every** entry in `values`.
     * @param value - The original value.
     * @param values - The values to compare `value` to.
     */
    static equals(value, values) {
        for (const val of values) {
            if (val === value)
                return true;
        }
        return false;
    }
    /** Removes the readonly modifier from the arguments array and its objects. */
    static removeReadonlyFromArguments(args) {
        return args.map(a => Object.fromEntries(Object.entries(a)));
    }
    /** Get entries from a **numbered** enum. Might not work properly with enums that map to strings. */
    static getEnumEntries(enumObj) {
        return Object.entries(enumObj).filter((entry) => typeof entry[1] === 'number');
    }
    /** Deep copy a plain object. */
    static deepCopy(value) {
        return JSON.parse(JSON.stringify(value));
    }
    /** Pick properties from an object. */
    static pick(object, keys) {
        return Util.omitOrPick('pick', object, keys);
    }
    /** Omit properties from an object. */
    static omit(object, keys) {
        return Util.omitOrPick('omit', object, keys);
    }
    /** JSONify a raw mongoose document. */
    static jsonifyDocument(doc) {
        if (!doc)
            return null;
        const jsonified = doc.toJSON({
            flattenMaps: false,
            versionKey: false,
        });
        jsonified._id = jsonified._id.toString();
        return jsonified;
    }
    /** Generalized handler for {@link Util.pick Util#pick} and {@link Util.omit Util#omit}. */
    static omitOrPick(kind, object, keys) {
        const finalObject = {};
        const validEntires = Object.entries(object)
            .filter(([k]) => kind === 'omit' ? !keys.includes(k) : keys.includes(k));
        for (const [key, value] of validEntires) {
            finalObject[key] = value;
        }
        return finalObject;
    }
    /**
     * Verifies the provided data is a string, otherwise throws provided error.
     * @param data - The string resolvable to resolve
     * @param error - The Error constructor to instantiate. Defaults to Error
     * @param errorMessage - The error message to throw with. Defaults to "Expected string, got <data> instead."
     * @param allowEmpty - Whether an empty string should be allowed
     */
    static verifyString(data, error = Error, errorMessage = `Expected a string, got ${typeof data} instead.`, allowEmpty = true) {
        /* eslint-disable new-cap */
        if (typeof data !== 'string')
            throw new error(errorMessage);
        if (!allowEmpty && data.length === 0)
            throw new error(errorMessage);
        return data;
        /* eslint-enable new-cap */
    }
}
exports.default = Util;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQW9DO0FBcUVwQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFvQztJQUNqRSxtQkFBbUIsRUFBRSx1QkFBdUI7SUFDNUMsV0FBVyxFQUFFLGNBQWM7SUFDM0IsVUFBVSxFQUFFLGFBQWE7SUFDekIsYUFBYSxFQUFFLGVBQWU7SUFDOUIsY0FBYyxFQUFFLGlCQUFpQjtJQUNqQyxXQUFXLEVBQUUsZUFBZTtJQUM1QixZQUFZLEVBQUUsZUFBZTtJQUM3QixZQUFZLEVBQUUsZ0JBQWdCO0lBQzlCLGVBQWUsRUFBRSxrQkFBa0I7SUFDbkMsTUFBTSxFQUFFLE9BQU87SUFDZixXQUFXLEVBQUUsZUFBZTtJQUM1QixZQUFZLEVBQUUsZUFBZTtJQUM3QixlQUFlLEVBQUUsbUJBQW1CO0lBQ3BDLGNBQWMsRUFBRSxpQkFBaUI7SUFDakMsVUFBVSxFQUFFLGFBQWE7SUFDekIsV0FBVyxFQUFFLGNBQWM7SUFDM0Isa0JBQWtCLEVBQUUsc0JBQXNCO0lBQzFDLGVBQWUsRUFBRSxrQkFBa0I7SUFDbkMsaUJBQWlCLEVBQUUscUJBQXFCO0lBQ3hDLGlCQUFpQixFQUFFLHNCQUFzQjtJQUN6QyxPQUFPLEVBQUUsU0FBUztJQUNsQixLQUFLLEVBQUUsT0FBTztJQUNkLFdBQVcsRUFBRSxjQUFjO0lBQzNCLGFBQWEsRUFBRSxnQkFBZ0I7SUFDL0IsV0FBVyxFQUFFLGNBQWM7SUFDM0IsTUFBTSxFQUFFLG9CQUFvQjtJQUM1QixjQUFjLEVBQUUsaUJBQWlCO0lBQ2pDLGVBQWUsRUFBRSxrQkFBa0I7SUFDbkMsV0FBVyxFQUFFLGNBQWM7SUFDM0IsY0FBYyxFQUFFLGlCQUFpQjtJQUNqQyx1QkFBdUIsRUFBRSw0QkFBNEI7SUFDckQsc0JBQXNCLEVBQUUsMEJBQTBCO0lBQ2xELGNBQWMsRUFBRSxrQkFBa0I7SUFDbEMs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