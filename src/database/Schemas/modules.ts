import { model, Schema } from 'mongoose';
import { BaseSchemaWithoutTimestamps, DocumentFrom } from './base';
import { Snowflake } from 'discord.js';

export interface ModuleSchema extends BaseSchemaWithoutTimestamps {
    guild: Snowflake;
    // chatFilter: boolean
    // scamDetector: boolean
    stickyRoles: boolean;
    welcome: boolean;
    auditLogs: {
        boosts: boolean;
        channels: boolean;
        commands: boolean;
        emojis: boolean;
        events: boolean;
        invites: boolean;
        members: boolean;
        messages: boolean;
        moderation: boolean;
        modules: boolean;
        roles: boolean;
        server: boolean;
        stickers: boolean;
        threads: boolean;
        users: boolean;
        voice: boolean;
    };
}

export type GuildModule = 'audit-logs' | 'sticky-roles' | 'welcome';

export type GuildAuditLog = keyof ModuleSchema['auditLogs'];

const ModulesModel = model<DocumentFrom<ModuleSchema>>('modules', new Schema({
    guild: String,
    // chatFilter: Boolean,
    // scamDetector: Boolean,
    stickyRoles: Boolean,
    welcome: Boolean,
    auditLogs: {
        boosts: Boolean,
        channels: Boolean,
        commands: Boolean,
        emojis: Boolean,
        events: Boolean,
        invites: Boolean,
        members: Boolean,
        messages: Boolean,
        moderation: Boolean,
        modules: Boolean,
        roles: Boolean,
        server: Boolean,
        stickers: Boolean,
        threads: Boolean,
        users: Boolean,
        voice: Boolean,
    },
}));

export default ModulesModel;
