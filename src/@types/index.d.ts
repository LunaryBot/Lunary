import { Permissions } from '@discord';

import type { GuildPermissions } from '../utils/Constants';

export interface CommandRequirements {
    permissions?: {
        me?: Array<keyof typeof Permissions.Flags>;
        lunary?: Array<keyof typeof GuildPermissions>;
        discord?: Array<keyof typeof Permissions.Flags>;
    };
    database?: {
        user?: boolean;
        guild?: boolean;
        permissions?: boolean;
        reasons?: boolean;
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

export interface Punishment {
    id: string;
	user_id: string;
	author_id: string;
	guild_id: string;
    created_at: Date;
	reason?: string;
	type: PunishmentTypes;
	duration?: number;
}

export interface PunishmentMute extends Punishment {
    duration: number;
}

export enum PunishmentType {
    Ban = 'BAN',
    Kick = 'KICK',
    Mute = 'MUTE',
    Warn = 'ADV',
    Adv = 'ADV',
}

type PunishmentTypes = 'BAN' | 'KICK' | 'MUTE' | 'ADV';
  
export interface Reason {
    id: string;
    text: string;
    type: number;
    guild_id: string;
    duration?: number;
    keys?: Array<string>;
    days?: number;
}
