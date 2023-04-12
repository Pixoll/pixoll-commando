"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
/** Contains various general-purpose utility methods and constants. */
class Util extends null {
    /** Object that maps every PermissionString to its representation inside the Discord client. */
    static get permissions() {
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
    static equals(value, values) {
        for (const val of values) {
            if (val === value)
                return true;
        }
        return false;
    }
    static removeReadonlyFromArguments(args) {
        return args.map(a => Object.fromEntries(Object.entries(a)));
    }
    static getEnumEntries(obj) {
        return Object.entries(obj).filter((entry) => typeof entry[1] === 'number');
    }
    static deepCopy(value) {
        return JSON.parse(JSON.stringify(value));
    }
    static pick(object, keys) {
        return Util.omitOrPick('pick', object, keys);
    }
    static omit(object, keys) {
        return Util.omitOrPick('omit', object, keys);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQW9DO0FBcUVwQyxzRUFBc0U7QUFDdEUsTUFBcUIsSUFBSyxTQUFRLElBQUk7SUFDbEMsK0ZBQStGO0lBQ3hGLE1BQU0sS0FBSyxXQUFXO1FBQ3pCLE9BQU87WUFDSCxtQkFBbUIsRUFBRSx1QkFBdUI7WUFDNUMsV0FBVyxFQUFFLGNBQWM7WUFDM0IsVUFBVSxFQUFFLGFBQWE7WUFDekIsYUFBYSxFQUFFLGVBQWU7WUFDOUIsY0FBYyxFQUFFLGlCQUFpQjtZQUNqQyxXQUFXLEVBQUUsZUFBZTtZQUM1QixZQUFZLEVBQUUsZUFBZTtZQUM3QixZQUFZLEVBQUUsZ0JBQWdCO1lBQzlCLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsTUFBTSxFQUFFLE9BQU87WUFDZixXQUFXLEVBQUUsZUFBZTtZQUM1QixZQUFZLEVBQUUsZUFBZTtZQUM3QixlQUFlLEVBQUUsbUJBQW1CO1lBQ3BDLGNBQWMsRUFBRSxpQkFBaUI7WUFDakMsVUFBVSxFQUFFLGFBQWE7WUFDekIsV0FBVyxFQUFFLGNBQWM7WUFDM0Isa0JBQWtCLEVBQUUsc0JBQXNCO1lBQzFDLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsaUJBQWlCLEVBQUUscUJBQXFCO1lBQ3hDLGlCQUFpQixFQUFFLHNCQUFzQjtZQUN6QyxPQUFPLEVBQUUsU0FBUztZQUNsQixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxjQUFjO1lBQzNCLGFBQWEsRUFBRSxnQkFBZ0I7WUFDL0IsV0FBVyxFQUFFLGNBQWM7WUFDM0IsTUFBTSxFQUFFLG9CQUFvQjtZQUM1QixjQUFjLEVBQUUsaUJBQWlCO1lBQ2pDLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsV0FBVyxFQUFFLGNBQWM7WUFDM0IsY0FBYyxFQUFFLGlCQUFpQjtZQUNqQyx1QkFBdUIsRUFBRSw0QkFBNEI7WUFDckQsc0JBQXNC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