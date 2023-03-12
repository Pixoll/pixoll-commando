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
    static disambiguation(items, label, property = 'name') {
        const itemList = items.map(item => `"${(typeof item !== 'string' ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQW9DO0FBbUVwQyxzRUFBc0U7QUFDdEUsTUFBcUIsSUFBSyxTQUFRLElBQUk7SUFDbEMsK0ZBQStGO0lBQ3hGLE1BQU0sS0FBSyxXQUFXO1FBQ3pCLE9BQU87WUFDSCxtQkFBbUIsRUFBRSx1QkFBdUI7WUFDNUMsV0FBVyxFQUFFLGNBQWM7WUFDM0IsVUFBVSxFQUFFLGFBQWE7WUFDekIsYUFBYSxFQUFFLGVBQWU7WUFDOUIsY0FBYyxFQUFFLGlCQUFpQjtZQUNqQyxXQUFXLEVBQUUsZUFBZTtZQUM1QixZQUFZLEVBQUUsZUFBZTtZQUM3QixZQUFZLEVBQUUsZ0JBQWdCO1lBQzlCLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsTUFBTSxFQUFFLE9BQU87WUFDZixXQUFXLEVBQUUsZUFBZTtZQUM1QixZQUFZLEVBQUUsZUFBZTtZQUM3QixlQUFlLEVBQUUsbUJBQW1CO1lBQ3BDLGNBQWMsRUFBRSxpQkFBaUI7WUFDakMsVUFBVSxFQUFFLGFBQWE7WUFDekIsV0FBVyxFQUFFLGNBQWM7WUFDM0Isa0JBQWtCLEVBQUUsc0JBQXNCO1lBQzFDLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsaUJBQWlCLEVBQUUscUJBQXFCO1lBQ3hDLGlCQUFpQixFQUFFLHNCQUFzQjtZQUN6QyxPQUFPLEVBQUUsU0FBUztZQUNsQixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxjQUFjO1lBQzNCLGFBQWEsRUFBRSxnQkFBZ0I7WUFDL0IsV0FBVyxFQUFFLGNBQWM7WUFDM0IsTUFBTSxFQUFFLG9CQUFvQjtZQUM1QixjQUFjLEVBQUUsaUJBQWlCO1lBQ2pDLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsV0FBVyxFQUFFLGNBQWM7WUFDM0IsY0FBYyxFQUFFLGlCQUFpQjtZQUNqQyx1QkFBdUIsRUFBRSw0QkFBNEI7WUFDckQsc0JBQXNC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