"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.Util = exports.GuildDatabaseManager = exports.DatabaseManager = exports.ClientDatabaseManager = exports.CommandFormatError = exports.FriendlyError = exports.ArgumentType = exports.Argument = exports.ArgumentCollector = exports.CommandGroup = exports.Command = exports.CommandoMessage = exports.CommandoGuild = exports.CommandDispatcher = exports.CommandoRegistry = exports.CommandoClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "CommandoClient", { enumerable: true, get: function () { return __importDefault(client_1).default; } });
var registry_1 = require("./registry");
Object.defineProperty(exports, "CommandoRegistry", { enumerable: true, get: function () { return __importDefault(registry_1).default; } });
var dispatcher_1 = require("./dispatcher");
Object.defineProperty(exports, "CommandDispatcher", { enumerable: true, get: function () { return __importDefault(dispatcher_1).default; } });
var guild_1 = require("./extensions/guild");
Object.defineProperty(exports, "CommandoGuild", { enumerable: true, get: function () { return __importDefault(guild_1).default; } });
var message_1 = require("./extensions/message");
Object.defineProperty(exports, "CommandoMessage", { enumerable: true, get: function () { return __importDefault(message_1).default; } });
var base_1 = require("./commands/base");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return __importDefault(base_1).default; } });
var group_1 = require("./commands/group");
Object.defineProperty(exports, "CommandGroup", { enumerable: true, get: function () { return __importDefault(group_1).default; } });
var collector_1 = require("./commands/collector");
Object.defineProperty(exports, "ArgumentCollector", { enumerable: true, get: function () { return __importDefault(collector_1).default; } });
var argument_1 = require("./commands/argument");
Object.defineProperty(exports, "Argument", { enumerable: true, get: function () { return __importDefault(argument_1).default; } });
var base_2 = require("./types/base");
Object.defineProperty(exports, "ArgumentType", { enumerable: true, get: function () { return __importDefault(base_2).default; } });
var friendly_1 = require("./errors/friendly");
Object.defineProperty(exports, "FriendlyError", { enumerable: true, get: function () { return __importDefault(friendly_1).default; } });
var command_format_1 = require("./errors/command-format");
Object.defineProperty(exports, "CommandFormatError", { enumerable: true, get: function () { return __importDefault(command_format_1).default; } });
var ClientDatabaseManager_1 = require("./database/ClientDatabaseManager");
Object.defineProperty(exports, "ClientDatabaseManager", { enumerable: true, get: function () { return __importDefault(ClientDatabaseManager_1).default; } });
var DatabaseManager_1 = require("./database/DatabaseManager");
Object.defineProperty(exports, "DatabaseManager", { enumerable: true, get: function () { return __importDefault(DatabaseManager_1).default; } });
var GuildDatabaseManager_1 = require("./database/GuildDatabaseManager");
Object.defineProperty(exports, "GuildDatabaseManager", { enumerable: true, get: function () { return __importDefault(GuildDatabaseManager_1).default; } });
var util_1 = require("./util");
Object.defineProperty(exports, "Util", { enumerable: true, get: function () { return __importDefault(util_1).default; } });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: @ts-expect-error throws "unused directive". File is in program as specified under 'files' in tsconfig.json
var package_json_1 = require("../package.json");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return package_json_1.version; } });
//# sourceMappingURL=index.js.map