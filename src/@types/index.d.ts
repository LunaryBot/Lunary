import { Permissions } from '@discord';
import type { LunarPermissions } from '../utils/Constants';

export interface ICommandRequirements {
    permissions?: {
        me?: Array<keyof typeof Permissions.Flags>;
        bot?: Array<keyof typeof LunarPermissions>;
        discord?: Array<keyof typeof Permissions.Flags>;
    },
    guildOnly?: boolean;
    ownerOnly?: boolean;
}

export interface ICommandBase {
    name: string;
    dirname?: string;
    requirements?: ICommandRequirements | null;
    cooldown?: number;
}

export interface IVoteData {
	platform: string,
	date: number
}

export interface IPunishmentLog {
    id: string;
    timestamp: number;
	user: string;
	guild: string;
	reason?: string;
	type: 1 | 2 | 3 | 4;
	duration?: number;
	author: string;
} 
  
export interface IReason {
    text: string;
    type: 1 | 2 | 3 | 4;
    duration?: number;
    keys?: Array<string>;
    days?: number;
    _id: string;
}