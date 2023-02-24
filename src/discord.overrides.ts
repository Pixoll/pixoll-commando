import type {
    AutocompleteInteraction,
    AutoModerationActionExecution,
    AutoModerationRule,
    ButtonInteraction,
    CachedManager,
    CacheType,
    CacheTypeReducer,
    CategoryChannel,
    ChannelSelectMenuInteraction,
    ChatInputCommandInteraction,
    ClientEvents,
    Collection,
    CommandInteraction,
    ContextMenuCommandInteraction,
    DMChannel,
    FetchGuildOptions,
    FetchGuildsOptions,
    ForumChannel,
    Guild,
    GuildBan,
    GuildCreateOptions,
    GuildEmoji,
    GuildMember,
    GuildResolvable,
    GuildScheduledEvent,
    GuildScheduledEventStatus,
    If,
    Invite,
    MentionableSelectMenuInteraction,
    Message,
    MessageComponentInteraction,
    MessageContextMenuCommandInteraction,
    MessageReaction,
    ModalMessageModalSubmitInteraction,
    ModalSubmitInteraction,
    NewsChannel,
    OAuth2Guild,
    PartialGroupDMChannel,
    Partialize,
    Presence,
    PrivateThreadChannel,
    PublicThreadChannel,
    Role,
    RoleSelectMenuInteraction,
    Snowflake,
    StageChannel,
    StageInstance,
    Sticker,
    StringSelectMenuInteraction,
    TextChannel,
    TextChannelType,
    ThreadChannel,
    ThreadMember,
    Typing,
    User,
    UserContextMenuCommandInteraction,
    UserSelectMenuInteraction,
    VoiceChannel,
    VoiceState,
} from 'discord.js';
import type CommandoClient from './client';
import type CommandoGuild from './extensions/guild';

// @ts-expect-error: caused by interaction overrides
export interface OverwrittenClientEvents extends ClientEvents {
    autoModerationActionExecution: [autoModerationActionExecution: CommandoAutoModerationActionExecution];
    autoModerationRuleCreate: [autoModerationRule: CommandoAutoModerationRule];
    autoModerationRuleDelete: [autoModerationRule: CommandoAutoModerationRule];
    autoModerationRuleUpdate: [
        oldAutoModerationRule: CommandoAutoModerationRule | null,
        newAutoModerationRule: CommandoAutoModerationRule,
    ];
    channelCreate: [channel: NonThreadCommandoGuildBasedChannel];
    channelDelete: [channel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel];
    channelPinsUpdate: [channel: CommandoTextBasedChannel, date: Date];
    channelUpdate: [
        oldChannel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel,
        newChannel: CommandoDMChannel | NonThreadCommandoGuildBasedChannel,
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
        },
    ];
    guildMemberUpdate: [
        oldMember: CommandoGuildMember | PartialCommandoGuildMember,
        newMember: CommandoGuildMember,
    ];
    guildUpdate: [oldGuild: CommandoGuild, newGuild: CommandoGuild];
    inviteCreate: [invite: CommandoInvite];
    inviteDelete: [invite: CommandoInvite];
    messageCreate: [message: CommandoifiedMessage];
    messageDelete: [message: CommandoifiedMessage | PartialCommandoifiedMessage];
    messageReactionRemoveAll: [
        message: CommandoifiedMessage | PartialCommandoifiedMessage,
        reactions: Collection<Snowflake | string, CommandoMessageReaction>,
    ];
    messageDeleteBulk: [
        messages: Collection<Snowflake, CommandoifiedMessage | PartialCommandoifiedMessage>,
        channel: CommandoGuildTextBasedChannel,
    ];
    messageUpdate: [
        oldMessage: CommandoifiedMessage | PartialCommandoifiedMessage,
        newMessage: CommandoifiedMessage | PartialCommandoifiedMessage,
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
        thread: AnyCommandoThreadChannel,
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
        newStageInstance: CommandoStageInstance,
    ];
    stageInstanceDelete: [stageInstance: CommandoStageInstance];
    stickerCreate: [sticker: CommandoSticker];
    stickerDelete: [sticker: CommandoSticker];
    stickerUpdate: [oldSticker: CommandoSticker, newSticker: CommandoSticker];
    guildScheduledEventCreate: [guildScheduledEvent: CommandoGuildScheduledEvent];
    guildScheduledEventUpdate: [
        oldGuildScheduledEvent: CommandoGuildScheduledEvent | null,
        newGuildScheduledEvent: CommandoGuildScheduledEvent,
    ];
    guildScheduledEventDelete: [guildScheduledEvent: CommandoGuildScheduledEvent];
    guildScheduledEventUserAdd: [guildScheduledEvent: CommandoGuildScheduledEvent, user: CommandoUser];
    guildScheduledEventUserRemove: [guildScheduledEvent: CommandoGuildScheduledEvent, user: CommandoUser];
}

export type CommandoGuildResolvable = CommandoGuild | GuildResolvable;

export declare class CommandoGuildManager extends CachedManager<Snowflake, CommandoGuild, CommandoGuildResolvable> {
    public create(options: GuildCreateOptions): Promise<CommandoGuild>;
    public fetch(options: FetchGuildOptions | Snowflake): Promise<CommandoGuild>;
    public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}

// @ts-expect-error: private constructor
export declare class CommandoAutoModerationActionExecution extends AutoModerationActionExecution {
    public guild: CommandoGuild;
    public get autoModerationRule(): CommandoAutoModerationRule | null;
}

// @ts-expect-error: private constructor
export declare class CommandoAutoModerationRule extends AutoModerationRule {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoGuildEmoji extends GuildEmoji {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoGuildBan extends GuildBan {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoGuildMember extends GuildMember {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isCommunicationDisabled(): this is CommandoGuildMember & {
        communicationDisabledUntilTimestamp: number;
        readonly communicationDisabledUntil: Date;
    };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoGuildMember extends Partialize<
    CommandoGuildMember, 'joinedAt' | 'joinedTimestamp' | 'pending'
> { }

// @ts-expect-error: private constructor
export declare class CommandoInvite extends Invite {
    public guild: CommandoGuild | Exclude<Invite['guild'], Guild>;
}

export declare class CommandoPresence extends Presence {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild | null;
}

// @ts-expect-error: private constructor
export declare class CommandoRole extends Role {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoTyping extends Typing {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
    public inGuild(): this is this & {
        channel: CommandoNewsChannel | CommandoTextChannel | CommandoThreadChannel;
        get guild(): CommandoGuild;
    };
}

// @ts-expect-error: private constructor
export declare class CommandoVoiceState extends VoiceState {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
}

// @ts-expect-error: private constructor
export declare class CommandoStageInstance extends StageInstance {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
}

// @ts-expect-error: private constructor
export declare class CommandoSticker extends Sticker {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
}

export declare class CommandoGuildScheduledEvent<
    S extends GuildScheduledEventStatus = GuildScheduledEventStatus
// @ts-expect-error: private constructor
> extends GuildScheduledEvent<S> {
    public readonly client: CommandoClient<true>;
    public get guild(): CommandoGuild | null;
    public isActive(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Active>;
    public isCanceled(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Canceled>;
    public isCompleted(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Completed>;
    public isScheduled(): this is CommandoGuildScheduledEvent<GuildScheduledEventStatus.Scheduled>;
}

// @ts-expect-error: private constructor
export declare class CommandoifiedMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
    public readonly client: CommandoClient<true>;
    public get guild(): If<InGuild, CommandoGuild>;
    public inGuild(): this is CommandoifiedMessage<true>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoifiedMessage extends Partialize<
    CommandoifiedMessage, 'pinned' | 'system' | 'tts' | 'type', 'author' | 'cleanContent' | 'content'
> { }

export declare class CommandoCategoryChannel extends CategoryChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

// @ts-expect-error: private constructor
export declare class CommandoDMChannel extends DMChannel {
    public readonly client: CommandoClient<true>;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export interface PartialCommandoDMChannel extends Partialize<CommandoDMChannel, null, null, 'lastMessageId'> {
    lastMessageId: undefined;
}

export declare class CommandoForumChannel extends ForumChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

// @ts-expect-error: private constructor
export declare class PartialCommandoGroupDMChannel extends PartialGroupDMChannel {
    public readonly client: CommandoClient<true>;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoNewsChannel extends NewsChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoStageChannel extends StageChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoTextChannel extends TextChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

// @ts-expect-error: private constructor
export declare class CommandoThreadChannel extends ThreadChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export declare class CommandoVoiceChannel extends VoiceChannel {
    public readonly client: CommandoClient<true>;
    public guild: CommandoGuild;
    public isThread(): this is AnyCommandoThreadChannel;
    public isTextBased(): this is CommandoGuildBasedChannel & CommandoTextBasedChannel;
    public isDMBased(): this is CommandoDMChannel | PartialCommandoDMChannel | PartialCommandoGroupDMChannel;
    public isVoiceBased(): this is CommandoVoiceBasedChannel;
}

export type AnyCommandoThreadChannel<Forum extends boolean = boolean> =
    | CommandoPrivateThreadChannel
    | CommandoPublicThreadChannel<Forum>;

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

export type CommandoChannel =
    | AnyCommandoThreadChannel
    | CommandoCategoryChannel
    | CommandoDMChannel
    | CommandoForumChannel
    | CommandoNewsChannel
    | CommandoStageChannel
    | CommandoTextChannel
    | CommandoVoiceChannel
    | PartialCommandoDMChannel
    | PartialCommandoGroupDMChannel;

export type CommandoTextBasedChannel = Exclude<
    Extract<CommandoChannel, { type: TextChannelType }>,
    CommandoForumChannel | PartialCommandoGroupDMChannel
>;

export type CommandoVoiceBasedChannel = Extract<CommandoChannel, { bitrate: number }>;

export type CommandoGuildBasedChannel = Extract<CommandoChannel, { guild: CommandoGuild }>;

export type NonThreadCommandoGuildBasedChannel = Exclude<CommandoGuildBasedChannel, AnyCommandoThreadChannel>;

export type CommandoGuildTextBasedChannel = Exclude<
    Extract<CommandoGuildBasedChannel, CommandoTextBasedChannel>,
    CommandoForumChannel
>;

export declare class CommandoUser extends User {
    public readonly client: CommandoClient<true>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoUser extends Partialize<CommandoUser, 'discriminator' | 'tag' | 'username'> { }

// @ts-expect-error: private constructor
export declare class CommandoMessageReaction extends MessageReaction {
    public readonly client: CommandoClient<true>;
}

// @ts-expect-error: private constructor
export declare class CommandoThreadMember extends ThreadMember {
    public readonly client: CommandoClient<true>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialCommandoThreadMember extends Partialize<
    CommandoThreadMember, 'flags' | 'joinedAt' | 'joinedTimestamp'
> { }

export interface CommandoInteractionOverride<Cached extends CacheType = CacheType> {
    readonly client: CommandoClient<true>;
    get guild(): CacheTypeReducer<Cached, CommandoGuild, null>;
    member: CacheTypeReducer<Cached, CommandoGuildMember, null>;
    isButton(): this is CommandoButtonInteraction<Cached>;
    isAutocomplete(): this is CommandoAutocompleteInteraction<Cached>;
    isChatInputCommand(): this is CommandoChatInputCommandInteraction<Cached>;
    isCommand(): this is CommandoCommandInteraction<Cached>;
    isContextMenuCommand(): this is CommandoContextMenuCommandInteraction<Cached>;
    isMessageComponent(): this is CommandoMessageComponentInteraction<Cached>;
    isMessageContextMenuCommand(): this is CommandoMessageContextMenuCommandInteraction<Cached>;
    isModalSubmit(): this is CommandoModalSubmitInteraction<Cached>;
    isUserContextMenuCommand(): this is CommandoUserContextMenuCommandInteraction<Cached>;
    isAnySelectMenu(): this is AnyCommandoSelectMenuInteraction<Cached>;
    isStringSelectMenu(): this is CommandoStringSelectMenuInteraction<Cached>;
    isUserSelectMenu(): this is CommandoUserSelectMenuInteraction<Cached>;
    isRoleSelectMenu(): this is CommandoRoleSelectMenuInteraction<Cached>;
    isMentionableSelectMenu(): this is CommandoMentionableSelectMenuInteraction<Cached>;
    isChannelSelectMenu(): this is CommandoChannelSelectMenuInteraction<Cached>;
    isRepliable(): this is CommandoRepliableInteraction<Cached>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoAutocompleteInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, AutocompleteInteraction<Cached> {
    inGuild(): this is CommandoAutocompleteInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoAutocompleteInteraction<'cached'>;
    inRawGuild(): this is CommandoAutocompleteInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoButtonInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, ButtonInteraction<Cached> {
    inGuild(): this is CommandoButtonInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoButtonInteraction<'cached'>;
    inRawGuild(): this is CommandoButtonInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoChatInputCommandInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, ChatInputCommandInteraction<Cached> {
    inGuild(): this is CommandoChatInputCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoChatInputCommandInteraction<'cached'>;
    inRawGuild(): this is CommandoChatInputCommandInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoCommandInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, CommandInteraction<Cached> {
    inGuild(): this is CommandoCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoCommandInteraction<'cached'>;
    inRawGuild(): this is CommandoCommandInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoContextMenuCommandInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, ContextMenuCommandInteraction<Cached> {
    inGuild(): this is ContextMenuCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is ContextMenuCommandInteraction<'cached'>;
    inRawGuild(): this is ContextMenuCommandInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoMessageComponentInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, MessageComponentInteraction<Cached> {
    inGuild(): this is MessageComponentInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is MessageComponentInteraction<'cached'>;
    inRawGuild(): this is MessageComponentInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoMessageContextMenuCommandInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, MessageContextMenuCommandInteraction<Cached> {
    inGuild(): this is CommandoMessageContextMenuCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoMessageContextMenuCommandInteraction<'cached'>;
    inRawGuild(): this is CommandoMessageContextMenuCommandInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoModalSubmitInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, ModalSubmitInteraction<Cached> {
    inGuild(): this is CommandoModalSubmitInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoModalSubmitInteraction<'cached'>;
    inRawGuild(): this is CommandoModalSubmitInteraction<'raw'>;
    isFromMessage(): this is CommandoModalMessageModalSubmitInteraction<Cached>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoModalMessageModalSubmitInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, ModalMessageModalSubmitInteraction<Cached> {
    inGuild(): this is CommandoModalMessageModalSubmitInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoModalMessageModalSubmitInteraction<'cached'>;
    inRawGuild(): this is CommandoModalMessageModalSubmitInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoUserContextMenuCommandInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, UserContextMenuCommandInteraction<Cached> {
    inGuild(): this is CommandoUserContextMenuCommandInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoUserContextMenuCommandInteraction<'cached'>;
    inRawGuild(): this is CommandoUserContextMenuCommandInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoChannelSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, ChannelSelectMenuInteraction<Cached> {
    inGuild(): this is CommandoChannelSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoChannelSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoChannelSelectMenuInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoMentionableSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, MentionableSelectMenuInteraction<Cached> {
    inGuild(): this is CommandoMentionableSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoMentionableSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoMentionableSelectMenuInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoRoleSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, RoleSelectMenuInteraction<Cached> {
    inGuild(): this is CommandoRoleSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoRoleSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoRoleSelectMenuInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoStringSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, StringSelectMenuInteraction<Cached> {
    inGuild(): this is CommandoStringSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoStringSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoStringSelectMenuInteraction<'raw'>;
}

// @ts-expect-error: Type narrowing methods are being overwritten
export interface CommandoUserSelectMenuInteraction<
    Cached extends CacheType = CacheType
> extends CommandoInteractionOverride<Cached>, UserSelectMenuInteraction<Cached> {
    inGuild(): this is CommandoUserSelectMenuInteraction<'cached' | 'raw'>;
    inCachedGuild(): this is CommandoUserSelectMenuInteraction<'cached'>;
    inRawGuild(): this is CommandoUserSelectMenuInteraction<'raw'>;
}

export type AnyCommandoSelectMenuInteraction<Cached extends CacheType = CacheType> =
    | CommandoChannelSelectMenuInteraction<Cached>
    | CommandoMentionableSelectMenuInteraction<Cached>
    | CommandoRoleSelectMenuInteraction<Cached>
    | CommandoStringSelectMenuInteraction<Cached>
    | CommandoUserSelectMenuInteraction<Cached>;

export type CommandoifiedInteraction<Cached extends CacheType = CacheType> =
    | AnyCommandoSelectMenuInteraction<Cached>
    | CommandoAutocompleteInteraction<Cached>
    | CommandoButtonInteraction<Cached>
    | CommandoChatInputCommandInteraction<Cached>
    | CommandoMessageContextMenuCommandInteraction<Cached>
    | CommandoModalSubmitInteraction<Cached>
    | CommandoUserContextMenuCommandInteraction<Cached>;

export type CommandoRepliableInteraction<Cached extends CacheType = CacheType> = Exclude<
    CommandoifiedInteraction<Cached>,
    CommandoAutocompleteInteraction<Cached>
>;
