import type { AutocompleteInteraction, AutoModerationActionExecution, AutoModerationRule, ButtonInteraction, CachedManager, CacheType, CacheTypeReducer, CategoryChannel, ChannelSelectMenuInteraction, ChatInputCommandInteraction, ClientEvents, Collection, DMChannel, FetchGuildOptions, FetchGuildsOptions, ForumChannel, Guild, GuildBan, GuildCreateOptions, GuildEmoji, GuildMember, GuildResolvable, GuildScheduledEvent, GuildScheduledEventStatus, If, Invite, MentionableSelectMenuInteraction, Message, MessageContextMenuCommandInteraction, MessageReaction, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, NewsChannel, OAuth2Guild, PartialGroupDMChannel, Partialize, Presence, PrivateThreadChannel, PublicThreadChannel, Role, RoleSelectMenuInteraction, Snowflake, StageChannel, StageInstance, Sticker, StringSelectMenuInteraction, TextChannel, TextChannelType, ThreadChannel, ThreadMember, Typing, User, UserContextMenuCommandInteraction, UserSelectMenuInteraction, VoiceChannel, VoiceState } from 'discord.js';
import type CommandoClient from './client';
import type CommandoGuild from './extensions/guild';
export interface OverwrittenClientEvents extends ClientEvents {
    autoModerationActionExecution: [autoModerationActionExecution: CommandoAutoModerationActionExecution];
    autoModerationRuleCreate: [autoModerationRule: CommandoAutoModerationRule];
    autoModerationRuleDelete: [autoModerationRule: CommandoAutoModerationRule];
    autoModerationRuleUpdate: [
        oldAutoModerationRule: CommandoAutoModerationRule | null,
        newAutoModerationRule: CommandoAutoModerationRule
    ];
    channelCreate: [channel: NonThreadCommandoGuildBasedChannel];
    channelDelete: [channel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel];
    channelPinsUpdate: [channel: CommandoTextBasedChannel, date: Date];
    channelUpdate: [
        oldChannel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel,
        newChannel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel
    ];
    emojiCreate: [emoji: CommandoGuildEmoji];
    emojiDelete: [emoji: CommandoGuildEmoji];
    emojiUpdate: [oldEmoji: CommandoGuildEmoji, newEmoji: CommandoGuildEmoji];
    guildBanAdd: [ban: CommandoGuildBan];
    guildBanRemove: [ban: CommandoGuildBan];
    guildDelete: [guild: CommandoGuild];
    guildUnavailable: [guild: CommandoGuild];
    guildIntegrationsUpdate: [guild: CommandoGuild];
    guildMemberAdd: [member: CommandoGuildMember];
    guildMemberAvailable: [member: CommandoGuildMember | PartialCommandoGuildMember];
    guildMemberRemove: [member: CommandoGuildMember | PartialCommandoGuildMember];
    guildMembersChunk: [
        members: Collection<Snowflake, CommandoGuildMember>,
        guild: CommandoGuild,
        data: {
            count: number;
            index: number;
            nonce: string | undefined;
        }
    ];
    guildMemberUpdate: [
        oldMember: CommandoGuildMember | PartialCommandoGuildMember,
        newMember: CommandoGuildMember
    ];
    guildUpdate: [oldGuild: CommandoGuild, newGuild: CommandoGuild];
    inviteCreate: [invite: CommandoInvite];
    inviteDelete: [invite: CommandoInvite];
    messageCreate: [message: CommandoifiedMessage];
    messageDelete: [message: CommandoifiedMessage | PartialCommandoifiedMessage];
    messageReactionRemoveAll: [
        message: CommandoifiedMessage | PartialCommandoifiedMessage,
        reactions: Collection<Snowflake | string, CommandoMessageReaction>
    ];
    messageDeleteBulk: [
        messages: Collection<Snowflake, CommandoifiedMessage | PartialCommandoifiedMessage>,
        channel: CommandoGuildTextBasedChannel
    ];
    messageUpdate: [
        oldMessage: CommandoifiedMessage | PartialCommandoifiedMessage,
        newMessage: CommandoifiedMessage | PartialCommandoifiedMessage
    ];
    presenceUpdate: [oldPresence: CommandoPresence | null, newPresence: CommandoPresence];
    ready: [client: CommandoClient<true>];
    roleCreate: [role: CommandoRole];
    roleDelete: [role: CommandoRole];
    roleUpdate: [oldRole: CommandoRole, newRole: CommandoRole];
    threadCreate: [thread: AnyCommandoThreadChannel, newlyCreated: boolean];
    threadDelete: [thread: AnyCommandoThreadChannel];
    threadListSync: [threads: Collection<Snowflake, AnyCommandoThreadChannel>, guild: CommandoGuild];
    threadMembersUpdate: [
        addedMembers: Collection<Snowflake, CommandoThreadMember>,
        removedMembers: Collection<Snowflake, CommandoThreadMember | PartialCommandoThreadMember>,
        thread: AnyCommandoThreadChannel
    ];
    threadUpdate: [oldThread: AnyCommandoThreadChannel, newThread: AnyCommandoThreadChannel];
    typingStart: [typing: CommandoTyping];
    userUpdate: [oldUser: CommandoUser | PartialCommandoUser, newUser: CommandoUser];
    voiceStateUpdate: [oldState: CommandoVoiceState, newState: CommandoVoiceState];
    webhookUpdate: [channel: CommandoForumChannel | CommandoNewsChannel | CommandoTextChannel | CommandoVoiceChannel];
    interactionCreate: [interaction: CommandoifiedInteraction];
    stageInstanceCreate: [stageInstance: CommandoStageInstance];
    stageInstanceUpdate: [
        oldStageInstance: CommandoStageInstance | null,
        newStageInstance: CommandoStageInstance
    ];
    stageInstanceDelete: [stageInstance: CommandoStageInstance];
    stickerCreate: [sticker: CommandoSticker];
    stickerDelete: [sticker: CommandoSticker];
    stickerUpdate: [oldSticker: CommandoSticker, newSticker: CommandoSticker];
    guildScheduledEventCreate: [guildScheduledEvent: CommandoGuildScheduledEvent];
    guildScheduledEventUpdate: [
        oldGuildScheduledEvent: CommandoGuildScheduledEvent | null,
        newGuildScheduledEvent: CommandoGuildScheduledEvent
    ];
    guildScheduledEventDelete: [guildScheduledEvent: CommandoGuildScheduledEvent];
    guildScheduledEventUserAdd: [guildScheduledEvent: CommandoGuildScheduledEvent, user: CommandoUser];
    guildScheduledEventUserRemove: [guildScheduledEvent: CommandoGuildScheduledEvent, user: CommandoUser];
}
export type CommandoGuildResolvable = CommandoGuild | GuildResolvable;
export declare class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, CommandoGuildResolvable> {
    create(options: GuildCreateOptions): Promise<CommandoGuild>;
    fetch(options: FetchGuildOptions | Snowflake): Promise<CommandoGuild>;
    fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}
export declare class CommandoAutoModerationActionExecution extends AutoModerationActionExecution {
    guild: CommandoGuild;
    get autoModerationRule(): CommandoAutoModerationRule | null;
}
export declare class CommandoAutoModerationRule extends AutoModerationRule {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
}
export declare class CommandoGuildEmoji extends GuildEmoji {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
}
export declare class CommandoGuildBan extends GuildBan {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
}
export declare class CommandoGuildMember extends GuildMember {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isCommunicationDisabled(): this is CommandoGuildMember & {
        communicationDisabledUntilTimestamp: number;
        readonly communicationDisabledUntil: Date;
    };
}
export interface PartialCommandoGuildMember extends Partialize<CommandoGuildMember, 'joinedAt' | 'joinedTimestamp' | 'pending'> {
}
export declare class CommandoInvite extends Invite {
    guild: CommandoGuild | Exclude<Invite['guild'], Guild>;
}
export declare class CommandoPresence extends Presence {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild | null;
}
export declare class CommandoRole extends Role {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
}
export declare class CommandoTyping extends Typing {
    readonly client: CommandoClient<true>;
    get guild(): CommandoGuild | null;
    inGuild(): this is this & {
        channel: CommandoNewsChannel | CommandoTextChannel | CommandoThreadChannel;
        get guild(): CommandoGuild;
    };
}
export declare class CommandoVoiceState extends VoiceState {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
}
export declare class CommandoStageInstance extends StageInstance {
    readonly client: CommandoClient<true>;
    get guild(): CommandoGuild | null;
}
export declare class CommandoSticker extends Sticker {
    readonly client: CommandoClient<true>;
    get guild(): CommandoGuild | null;
}
export declare class CommandoGuildScheduledEvent<S extends GuildScheduledEventStatus = GuildScheduledEventStatus> extends GuildScheduledEvent<S> {
    readonly client: CommandoClient<true>;
    get guild(): CommandoGuild | null;
    isActive(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Active>;
    isCanceled(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Canceled>;
    isCompleted(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Completed>;
    isScheduled(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Scheduled>;
}
export declare class CommandoifiedMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
    readonly client: CommandoClient<true>;
    get guild(): If<InGuild, CommandoGuild>;
    inGuild(): this is CommandoifiedMessage<true>;
}
export interface PartialCommandoifiedMessage extends Partialize<CommandoifiedMessage, 'pinned' | 'system' | 'tts' | 'type', 'author' | 'cleanContent' | 'content'> {
}
export declare class CommandoCategoryChannel extends CategoryChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export declare class CommandoDMChannel extends DMChannel {
    readonly client: CommandoClient<true>;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export interface PartialCommandoDMChannel extends Partialize<CommandoDMChannel, null, null, 'lastMessageId'> {
    lastMessageId: undefined;
}
export declare class CommandoForumChannel extends ForumChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export declare class PartialCommandoGroupDMChannel extends PartialGroupDMChannel {
    readonly client: CommandoClient<true>;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export declare class CommandoNewsChannel extends NewsChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export declare class CommandoStageChannel extends StageChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export declare class CommandoTextChannel extends TextChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export declare class CommandoThreadChannel extends ThreadChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export declare class CommandoVoiceChannel extends VoiceChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export type AnyCommandoThreadChannel<Forum extends boolean = boolean> = CommandoPrivateThreadChannel | CommandoPublicThreadChannel<Forum>;
export interface CommandoPublicThreadChannel<Forum extends boolean = boolean> extends PublicThreadChannel<Forum> {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export interface CommandoPrivateThreadChannel extends PrivateThreadChannel {
    readonly client: CommandoClient<true>;
    guild: CommandoGuild;
    isThread(): this is AnyCommandoThreadChannel;
    isTextBased(): this is CommandoTextBasedChannel;
    isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    isVoiceBased(): this is CommandoVoiceBasedChannel;
}
export type CommandoChannel = AnyCommandoThreadChannel | CommandoCategoryChannel | CommandoDMChannel | CommandoForumChannel | CommandoNewsChannel | CommandoStageChannel | CommandoTextChannel | CommandoVoiceChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
export type CommandoTextBasedChannel = Exclude<Extract<CommandoChannel, {
    type: TextChannelType;
}>, CommandoForumChannel | PartialCommandoGroupDMChannel>;
export type CommandoVoiceBasedChannel = Extract<CommandoChannel, {
    bitrate: number;
}>;
export type CommandoGuildBasedChannel = Extract<CommandoChannel, {
    guild: CommandoGuild;
}>;
export type NonThreadCommandoGuildBasedChannel = Exclude<CommandoGuildBasedChannel, AnyCommandoThreadChannel>;
export type CommandoGuildTextBasedChannel = Exclude<Extract<CommandoGuildBasedChannel, CommandoTextBasedChannel>, CommandoForumChannel>;
export declare class CommandoUser extends User {
    readonly client: CommandoClient<true>;
}
export interface PartialCommandoUser extends Partialize<CommandoUser, 'discriminator' | 'tag' | 'username'> {
}
export declare class CommandoMessageReaction extends MessageReaction {
    readonly client: CommandoClient<true>;
}
export declare class CommandoThreadMember extends ThreadMember {
    readonly client: CommandoClient<true>;
}
export interface PartialCommandoThreadMember extends Partialize<CommandoThreadMember, 'flags' | 'joinedAt' | 'joinedTimestamp'> {
}
export declare class CommandoAutocompleteInteraction<Cached extends CacheType = CacheType> extends AutocompleteInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoAutocompleteInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoAutocompleteInteraction<'cached'>;
    inRawGuild(): this is CommandoAutocompleteInteraction<'raw'>;
}
export declare class CommandoButtonInteraction<Cached extends CacheType = CacheType> extends ButtonInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoButtonInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoButtonInteraction<'cached'>;
    inRawGuild(): this is CommandoButtonInteraction<'raw'>;
}
export declare class CommandoChatInputCommandInteraction<Cached extends CacheType = CacheType> extends ChatInputCommandInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoChatInputCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoChatInputCommandInteraction<'cached'>;
    inRawGuild(): this is CommandoChatInputCommandInteraction<'raw'>;
}
export declare class CommandoMessageContextMenuCommandInteraction<Cached extends CacheType = CacheType> extends MessageContextMenuCommandInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoMessageContextMenuCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoMessageContextMenuCommandInteraction<'cached'>;
    inRawGuild(): this is CommandoMessageContextMenuCommandInteraction<'raw'>;
}
export declare class CommandoModalSubmitInteraction<Cached extends CacheType = CacheType> extends ModalSubmitInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoModalSubmitInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoModalSubmitInteraction<'cached'>;
    inRawGuild(): this is CommandoModalSubmitInteraction<'raw'>;
    isFromMessage(): this is CommandoModalMessageModalSubmitInteraction<Cached>;
}
export interface CommandoModalMessageModalSubmitInteraction<Cached extends CacheType = CacheType> extends ModalMessageModalSubmitInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoModalMessageModalSubmitInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoModalMessageModalSubmitInteraction<'cached'>;
    inRawGuild(): this is CommandoModalMessageModalSubmitInteraction<'raw'>;
}
export declare class CommandoUserContextMenuCommandInteraction<Cached extends CacheType = CacheType> extends UserContextMenuCommandInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoUserContextMenuCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoUserContextMenuCommandInteraction<'cached'>;
    inRawGuild(): this is CommandoUserContextMenuCommandInteraction<'raw'>;
}
export declare class CommandoChannelSelectMenuInteraction<Cached extends CacheType = CacheType> extends ChannelSelectMenuInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoChannelSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoChannelSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoChannelSelectMenuInteraction<'raw'>;
}
export declare class CommandoMentionableSelectMenuInteraction<Cached extends CacheType = CacheType> extends MentionableSelectMenuInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoMentionableSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoMentionableSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoMentionableSelectMenuInteraction<'raw'>;
}
export declare class CommandoRoleSelectMenuInteraction<Cached extends CacheType = CacheType> extends RoleSelectMenuInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoRoleSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoRoleSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoRoleSelectMenuInteraction<'raw'>;
}
export declare class CommandoStringSelectMenuInteraction<Cached extends CacheType = CacheType> extends StringSelectMenuInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoStringSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoStringSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoStringSelectMenuInteraction<'raw'>;
}
export declare class CommandoUserSelectMenuInteraction<Cached extends CacheType = CacheType> extends UserSelectMenuInteraction<Cached> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    inGuild(): this is CommandoUserSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoUserSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoUserSelectMenuInteraction<'raw'>;
}
export type AnyCommandoSelectMenuInteraction<Cached extends CacheType = CacheType> = CommandoChannelSelectMenuInteraction<Cached> | CommandoMentionableSelectMenuInteraction<Cached> | CommandoRoleSelectMenuInteraction<Cached> | CommandoStringSelectMenuInteraction<Cached> | CommandoUserSelectMenuInteraction<Cached>;
export type CommandoifiedInteraction<Cached extends CacheType = CacheType> = AnyCommandoSelectMenuInteraction<Cached> | CommandoAutocompleteInteraction<Cached> | CommandoButtonInteraction<Cached> | CommandoChatInputCommandInteraction<Cached> | CommandoMessageContextMenuCommandInteraction<Cached> | CommandoModalSubmitInteraction<Cached> | CommandoUserContextMenuCommandInteraction<Cached>;
