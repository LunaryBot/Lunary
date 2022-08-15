import Prisma from '@prisma/client';

import { Permissions, User } from '@discord';
import { RESTPostAPIInteractionFollowupJSONBody as RESTEditWebhook } from '@discord/types';

import type { GuildPermissions } from '../utils/Constants';

export interface CommandRequirements {
    permissions?: {
        me?: Array<keyof typeof Permissions.Flags>;
        lunary?: Array<keyof typeof GuildPermissions>;
        discord?: Array<keyof typeof Permissions.Flags>;
    };
    database?: {
        guild?: boolean;
        permissions?: boolean;
        reasons?: boolean;
    };
    cache?: {
        guild?: boolean;
        me?: boolean;
    };
    guildOnly?: boolean;
    ownerOnly?: boolean;
}

export interface CommandBase {
    name: string;
    dirname?: string;
    requirements?: CommandRequirements | null;
    cooldown?: number;
}

export interface VoteData {
	platform: string,
	date: number
}

export interface PunishmentProps {
    user: User;
    author: User;
    reason?: string|Prisma.Reason;
    notifyDM?: boolean;
}
  
export interface Reason {
    id: string;
    text: string;
    type: number;
    guild_id: string;
    duration?: number;
    keys?: Array<string>;
    days?: number;
}

export type ReplyMessageFn = (content: RESTEditWebhook & { ephemeral?: boolean }) => Promise<any>