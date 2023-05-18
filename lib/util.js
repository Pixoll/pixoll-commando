"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
     * @param string - The string to escape.
     */
    static escapeRegex(string) {
        return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
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
     * @param message - The message instance.
     * @returns A {@link MessageCreateOptions} object.
     */
    static noReplyPingInDMs(message) {
        const options = message.channel.isDMBased() ? {
            allowedMentions: { repliedUser: false },
        } : {};
        return options;
    }
    static disambiguation(items, label, property) {
        const itemList = items.map(item => `"${(typeof item !== 'string'
            ? `${item[property ?? 'name']}`
            : item).replace(/ /g, '\xa0')}"`).join(',   ');
        return `Multiple ${label} found, please be more specific: ${itemList}`;
    }
    /**
     * Turns kebab-case to camelCase
     * @param string - The string to parse.
     */
    static kebabToCamelCase(string) {
        const arr = string.split('-');
        const first = arr.shift();
        const rest = arr.map(Util.capitalize).join('');
        return (first + rest);
    }
    /**
     * Converts the first character of string to upper case and the remaining to lower case.
     * @param string — The string to capitalize.
     */
    static capitalize(string) {
        return (string[0].toUpperCase() + string.slice(1).toLowerCase());
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
     * @param value - The value to check.
     * @returns Whether the value is nullish.
     */
    static isNullish(value) {
        return typeof value === 'undefined' || value === null;
    }
    /**
     * Checks if `value` equals **every** entry in `values`.
     * @param value - The original value.
     * @param values - The values to compare `value` to.
     */
    static equals(value, values) {
        return values.some(val => val === value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBeUVBLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQW9DO0lBQ2pFLG1CQUFtQixFQUFFLHVCQUF1QjtJQUM1QyxXQUFXLEVBQUUsY0FBYztJQUMzQixVQUFVLEVBQUUsYUFBYTtJQUN6QixhQUFhLEVBQUUsZUFBZTtJQUM5QixjQUFjLEVBQUUsaUJBQWlCO0lBQ2pDLFdBQVcsRUFBRSxlQUFlO0lBQzVCLFlBQVksRUFBRSxlQUFlO0lBQzdCLFlBQVksRUFBRSxnQkFBZ0I7SUFDOUIsZUFBZSxFQUFFLGtCQUFrQjtJQUNuQyxNQUFNLEVBQUUsT0FBTztJQUNmLFdBQVcsRUFBRSxlQUFlO0lBQzVCLFlBQVksRUFBRSxlQUFlO0lBQzdCLGVBQWUsRUFBRSxtQkFBbUI7SUFDcEMsY0FBYyxFQUFFLGlCQUFpQjtJQUNqQyxVQUFVLEVBQUUsYUFBYTtJQUN6QixXQUFXLEVBQUUsY0FBYztJQUMzQixrQkFBa0IsRUFBRSxzQkFBc0I7SUFDMUMsZUFBZSxFQUFFLGtCQUFrQjtJQUNuQyxpQkFBaUIsRUFBRSxxQkFBcUI7SUFDeEMsaUJBQWlCLEVBQUUsc0JBQXNCO0lBQ3pDLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLEtBQUssRUFBRSxPQUFPO0lBQ2QsV0FBVyxFQUFFLGNBQWM7SUFDM0IsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixXQUFXLEVBQUUsY0FBYztJQUMzQixNQUFNLEVBQUUsb0JBQW9CO0lBQzVCLGNBQWMsRUFBRSxpQkFBaUI7SUFDakMsZUFBZSxFQUFFLGtCQUFrQjtJQUNuQyxXQUFXLEVBQUUsY0FBYztJQUMzQixjQUFjLEVBQUUsaUJBQWlCO0lBQ2pDLHVCQUF1QixFQUFFLDRCQUE0QjtJQUNyRCxzQkFBc0IsRUFBRSwwQkFBMEI7SUFDbEQsY0FBYyxFQUFFLGtCQUFrQjtJQUNsQyxZQUFZLEVBQUUsZUFB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