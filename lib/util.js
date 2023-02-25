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
        // @ts-expect-error: 'then' does not exist in type S
        return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
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
    /**
     * Get the current instance of a command. Useful if you need to get the same properties from both instances.
     * @param instances - The instances object.
     * @returns The instance of the command.
     */
    static getInstanceFrom(instances) {
        if ('message' in instances)
            return instances.message;
        return instances.interaction;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQW9DO0FBNkRwQyxzRUFBc0U7QUFDdEUsTUFBcUIsSUFBSyxTQUFRLElBQUk7SUFDbEMsK0ZBQStGO0lBQ3hGLE1BQU0sS0FBSyxXQUFXO1FBQ3pCLE9BQU87WUFDSCxtQkFBbUIsRUFBRSx1QkFBdUI7WUFDNUMsV0FBVyxFQUFFLGNBQWM7WUFDM0IsVUFBVSxFQUFFLGFBQWE7WUFDekIsYUFBYSxFQUFFLGVBQWU7WUFDOUIsY0FBYyxFQUFFLGlCQUFpQjtZQUNqQyxXQUFXLEVBQUUsZUFBZTtZQUM1QixZQUFZLEVBQUUsZUFBZTtZQUM3QixZQUFZLEVBQUUsZ0JBQWdCO1lBQzlCLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsTUFBTSxFQUFFLE9BQU87WUFDZixXQUFXLEVBQUUsZUFBZTtZQUM1QixZQUFZLEVBQUUsZUFBZTtZQUM3QixlQUFlLEVBQUUsbUJBQW1CO1lBQ3BDLGNBQWMsRUFBRSxpQkFBaUI7WUFDakMsVUFBVSxFQUFFLGFBQWE7WUFDekIsV0FBVyxFQUFFLGNBQWM7WUFDM0Isa0JBQWtCLEVBQUUsc0JBQXNCO1lBQzFDLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsaUJBQWlCLEVBQUUscUJBQXFCO1lBQ3hDLGlCQUFpQixFQUFFLHNCQUFzQjtZQUN6QyxPQUFPLEVBQUUsU0FBUztZQUNsQixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxjQUFjO1lBQzNCLGFBQWEsRUFBRSxnQkFBZ0I7WUFDL0IsV0FBVyxFQUFFLGNBQWM7WUFDM0IsTUFBTSxFQUFFLG9CQUFvQjtZQUM1QixjQUFjLEVBQUUsaUJBQWlCO1lBQ2pDLGVBQWUsRUFBRSxrQkFBa0I7WUFDbkMsV0FBVyxFQUFFLGNBQWM7WUFDM0IsY0FBYyxFQUFFLGlCQUFpQjtZQUNqQyx1QkFBdUIsRUFBRSw0QkFBNEI7WUFDckQsc0JBQXNC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