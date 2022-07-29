import { Permissions } from '@discord';
import type { LunarPermissions } from '../utils/Constants';

export interface CommandRequirements {
    permissions?: {
        me?: Array<keyof typeof Permissions.Flags>;
        bot?: Array<keyof typeof LunarPermissions>;
        discord?: Array<keyof typeof Permissions.Flags>;
    },
    guildOnly?: boolean;
    ownerOnly?: boolean;
}

export interface CommandBase {
    name: string;
    dirname?: string;
    requirements?: ICommandRequirements | null;
    cooldown?: number;
}

export interface VoteData {
	platform: string,
	date: number
}

export interface Punishment {
    id: string;
    timestamp: number;
	user: string;
	guild: string;
	reason?: string;
	type: 1 | 2 | 3 | 4;
	duration?: number;
	author_id: string;
}
  
export interface Reason {
    text: string;
    type: 1 | 2 | 3 | 4;
    duration?: number;
    keys?: Array<string>;
    days?: number;
    _id: string;
}