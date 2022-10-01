import Prisma from '@prisma/client';
import { Canvas, CanvasRenderingContext2D } from 'canvas';

import { Permissions, User, UserFlags } from '@discord';
import { RESTPostAPIInteractionFollowupJSONBody as RESTEditWebhook } from '@discord/types';

import type { GuildPermissions } from '../utils/Constants';

export interface CanvasInfo {
	canvas: Canvas;
	context: CanvasRenderingContext2D;
}

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

export interface ProfileInfos {
    avatar: string;
	username: string;
	background: string;
	bio: string;
	flags: string[];
	xp: number;
	luas: number;
    
    color?: string;
	rankPosition?: string;
	pattern?: string;
	emblem?: string;

    marry?: {
        username: string;
        avatar: string;
        timestamp: string;
    }
}

export interface ProfileTemplateBuilded {
    canvas: Canvas;
    context: CanvasRenderingContext2D;
    buffer(): Buffer;
}

export interface PunishmentProps {
    user: User;
    author: User;
    reason?: string|Prisma.Reason;
    notifyDM?: boolean;
}

export type ReplyMessageFn = (content: RESTEditWebhook & { ephemeral?: boolean }) => Promise<any>