"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Util = __importStar(require("./util"));
exports.version = '0.14.0';
//# sourceMappingURL=index.js.map