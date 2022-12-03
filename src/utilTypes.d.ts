import 'discord.js';
import CommandoClient from './client';
import Command, { CommandBlockData, CommandBlockReason, CommandInstances } from './commands/base';
import { ArgumentCollectorResult } from './commands/collector';
import CommandGroup from './commands/group';
import CommandoGuild from './extensions/guild';
import CommandoMessage from './extensions/message';
import CommandoRegistry from './registry';
import ArgumentType from './types/base';

// Adds custom ClientEvents
export declare module 'discord.js' {
    interface ClientEvents {
        commandBlock: [instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData];
        commandCancel: [command: Command, reason: string, message: CommandoMessage, result?: ArgumentCollectorResult];
        commandError: [
            command: Command,
            error: Error,
            instances: CommandInstances,
            args: Record<string, unknown> | string[] | string,
            fromPattern?: boolean,
            result?: ArgumentCollectorResult,
        ];
        commandoGuildCreate: [guild: CommandoGuild];
        commandoMessageCreate: [message: CommandoMessage];
        commandoMessageUpdate: [oldMessage: Message, newMessage: CommandoMessage];
        commandPrefixChange: [guild?: CommandoGuild | null, prefix?: string | null];
        commandRegister: [command: Command, registry: CommandoRegistry];
        commandReregister: [newCommand: Command, oldCommand: Command];
        commandRun: [
            command: Command,
            promise: Promise<unknown>,
            instances: CommandInstances,
            args: Record<string, unknown> | string[] | string,
            fromPattern?: boolean,
            result?: ArgumentCollectorResult | null,
        ];
        commandStatusChange: [guild: CommandoGuild | null, command: Command, enabled: boolean];
        commandUnregister: [command: Command];
        databaseReady: [client: CommandoClient<true>];
        groupRegister: [group: CommandGroup, registry: CommandoRegistry];
        groupStatusChange: [guild: CommandoGuild | null, group: CommandGroup, enabled: boolean];
        guildsReady: [client: CommandoClient<true>];
        modulesReady: [client: CommandoClient<true>];
        typeRegister: [type: ArgumentType, registry: CommandoRegistry];
        unknownCommand: [message: CommandoMessage];
    }
}

export declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_DB_URI: string;
        }
    }
}

export type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;
