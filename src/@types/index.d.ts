import type { Client, Constants } from 'eris'
import type DatabasesManager from '../structures/DatabasesManager';
import type Cluster from '../cluster/Cluster';
import type CommandInteractionOptions from '../utils/CommandInteractionOptions';
import type Command from '../structures/Command';
import type { LunarPermissions } from '../utils/Constants';

export interface ICommandRequirements {
    permissions?: {
        me?: Array<keyof typeof Constants.Permissions>;
        bot?: Array<keyof typeof LunarPermissions>;
        discord?: Array<keyof typeof Constants.Permissions>;
    },
    guildOnly?: boolean;
    ownerOnly?: boolean;
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
    keys?: string[];
    days?: number;
    _id: string;
}