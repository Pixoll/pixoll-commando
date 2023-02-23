import type { AnyThreadChannel, AutoModerationActionExecution, AutoModerationRule, Awaitable, ClientEvents, Collection, DMChannel, ForumChannel, GuildBan, GuildEmoji, GuildMember, GuildScheduledEvent, GuildTextBasedChannel, Interaction, Invite, Message, MessageReaction, NewsChannel, NonThreadGuildBasedChannel, PartialGuildMember, PartialMessage, PartialThreadMember, Presence, Role, Snowflake, StageInstance, Sticker, TextBasedChannel, TextChannel, ThreadMember, Typing, User, VoiceChannel, VoiceState } from 'discord.js';
import type CommandoClient from './client';
import type { default as Command, CommandBlockData, CommandBlockReason, CommandInstances } from './commands/base';
import type { ArgumentCollectorResult } from './commands/collector';
import type CommandGroup from './commands/group';
import type CommandoGuild from './extensions/guild';
import type CommandoMessage from './extensions/message';
import type CommandoRegistry from './registry';
import type ArgumentType from './types/base';
import type { Commandoify, CommandoifyMessage } from './util';
export interface CommandoClientEvents extends OverwrittenClientEvents {
    commandBlock: [instances: CommandInstances, reason: CommandBlockReason, data?: CommandBlockData];
    commandCancel: [command: Command, reason: string, message: CommandoMessage, result?: ArgumentCollectorResult];
    commandError: [
        command: Command,
        error: Error,
        instances: CommandInstances,
        args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult
    ];
    commandoGuildCreate: [guild: CommandoGuild];
    commandPrefixChange: [guild?: CommandoGuild | null, prefix?: string | null];
    commandRegister: [command: Command, registry: CommandoRegistry];
    commandReregister: [newCommand: Command, oldCommand: Command];
    commandRun: [
        command: Command,
        promise: Awaitable<Message | Message[] | null | void>,
        instances: CommandInstances,
        args: Record<string, unknown> | string[] | string,
        fromPattern?: boolean,
        result?: ArgumentCollectorResult | null
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
interface OverwrittenClientEvents extends ClientEvents {
    autoModerationActionExecution: [autoModerationActionExecution: Commandoify<AutoModerationActionExecution>];
    autoModerationRuleCreate: [autoModerationRule: Commandoify<AutoModerationRule>];
    autoModerationRuleDelete: [autoModerationRule: Commandoify<AutoModerationRule>];
    autoModerationRuleUpdate: [
        oldAutoModerationRule: Commandoify<AutoModerationRule> | null,
        newAutoModerationRule: Commandoify<AutoModerationRule>
    ];
    channelCreate: [channel: Commandoify<NonThreadGuildBasedChannel>];
    channelDelete: [channel: Commandoify<NonThreadGuildBasedChannel> | DMChannel];
    channelPinsUpdate: [channel: Commandoify<TextBasedChannel>, date: Date];
    channelUpdate: [
        oldChannel: Commandoify<NonThreadGuildBasedChannel> | DMChannel,
        newChannel: Commandoify<NonThreadGuildBasedChannel> | DMChannel
    ];
    emojiCreate: [emoji: Commandoify<GuildEmoji>];
    emojiDelete: [emoji: Commandoify<GuildEmoji>];
    emojiUpdate: [oldEmoji: Commandoify<GuildEmoji>, newEmoji: Commandoify<GuildEmoji>];
    guildBanAdd: [ban: Commandoify<GuildBan>];
    guildBanRemove: [ban: Commandoify<GuildBan>];
    guildDelete: [guild: CommandoGuild];
    guildUnavailable: [guild: CommandoGuild];
    guildIntegrationsUpdate: [guild: CommandoGuild];
    guildMemberAdd: [member: Commandoify<GuildMember>];
    guildMemberAvailable: [member: Commandoify<GuildMember> | Commandoify<PartialGuildMember>];
    guildMemberRemove: [member: Commandoify<GuildMember> | Commandoify<PartialGuildMember>];
    guildMembersChunk: [
        members: Collection<Snowflake, Commandoify<GuildMember>>,
        guild: CommandoGuild,
        data: {
            count: number;
            index: number;
            nonce: string | undefined;
        }
    ];
    guildMemberUpdate: [
        oldMember: Commandoify<GuildMember> | Commandoify<PartialGuildMember>,
        newMember: Commandoify<GuildMember>
    ];
    guildUpdate: [oldGuild: CommandoGuild, newGuild: CommandoGuild];
    inviteCreate: [invite: Commandoify<Invite>];
    inviteDelete: [invite: Commandoify<Invite>];
    messageCreate: [message: CommandoifyMessage<Message>];
    messageDelete: [message: CommandoifyMessage<Message> | CommandoifyMessage<PartialMessage>];
    messageReactionRemoveAll: [
        message: CommandoifyMessage<Message> | CommandoifyMessage<PartialMessage>,
        reactions: Collection<Snowflake | string, MessageReaction>
    ];
    messageDeleteBulk: [
        messages: Collection<Snowflake, CommandoifyMessage<Message> | CommandoifyMessage<PartialMessage>>,
        channel: Commandoify<GuildTextBasedChannel>
    ];
    messageUpdate: [
        oldMessage: CommandoifyMessage<Message> | CommandoifyMessage<PartialMessage>,
        newMessage: CommandoifyMessage<Message> | CommandoifyMessage<PartialMessage>
    ];
    presenceUpdate: [oldPresence: Commandoify<Presence> | null, newPresence: Commandoify<Presence>];
    ready: [client: CommandoClient<true>];
    roleCreate: [role: Commandoify<Role>];
    roleDelete: [role: Commandoify<Role>];
    roleUpdate: [oldRole: Commandoify<Role>, newRole: Commandoify<Role>];
    threadCreate: [thread: Commandoify<AnyThreadChannel>, newlyCreated: boolean];
    threadDelete: [thread: Commandoify<AnyThreadChannel>];
    threadListSync: [threads: Collection<Snowflake, Commandoify<AnyThreadChannel>>, guild: CommandoGuild];
    threadMembersUpdate: [
        addedMembers: Collection<Snowflake, ThreadMember>,
        removedMembers: Collection<Snowflake, PartialThreadMember | ThreadMember>,
        thread: Commandoify<AnyThreadChannel>
    ];
    threadUpdate: [oldThread: Commandoify<AnyThreadChannel>, newThread: Commandoify<AnyThreadChannel>];
    typingStart: [typing: Commandoify<Typing>];
    voiceStateUpdate: [oldState: Commandoify<VoiceState>, newState: Commandoify<VoiceState>];
    webhookUpdate: [
        channel: Commandoify<ForumChannel> | Commandoify<NewsChannel> | Commandoify<TextChannel> | Commandoify<VoiceChannel>
    ];
    interactionCreate: [interaction: Commandoify<Interaction>];
    stageInstanceCreate: [stageInstance: Commandoify<StageInstance>];
    stageInstanceUpdate: [
        oldStageInstance: Commandoify<StageInstance> | null,
        newStageInstance: Commandoify<StageInstance>
    ];
    stageInstanceDelete: [stageInstance: Commandoify<StageInstance>];
    stickerCreate: [sticker: Commandoify<Sticker>];
    stickerDelete: [sticker: Commandoify<Sticker>];
    stickerUpdate: [oldSticker: Commandoify<Sticker>, newSticker: Commandoify<Sticker>];
    guildScheduledEventCreate: [guildScheduledEvent: Commandoify<GuildScheduledEvent>];
    guildScheduledEventUpdate: [
        oldGuildScheduledEvent: Commandoify<GuildScheduledEvent> | null,
        newGuildScheduledEvent: Commandoify<GuildScheduledEvent>
    ];
    guildScheduledEventDelete: [guildScheduledEvent: Commandoify<GuildScheduledEvent>];
    guildScheduledEventUserAdd: [guildScheduledEvent: Commandoify<GuildScheduledEvent>, user: User];
    guildScheduledEventUserRemove: [guildScheduledEvent: Commandoify<GuildScheduledEvent>, user: User];
}
export {};
