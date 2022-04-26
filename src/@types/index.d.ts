import type { Client } from 'eris'
import type DatabasesManager from '../structures/DatabasesManager';
import type Cluster from '../structures/cluster/Cluster';
import type CommandInteractionOptions from '../utils/CommandInteractionOptions';

export interface IClientCommands {
    slash: Command[],
    vanilla: Command[],
    user: Command[],
}

export interface IBase {
    name: string;
    dirname?: string;
    requirements?: ICommandRequirements | null;
    cooldown?: number;
}

export interface ICommand extends IBase {
    aliases?: string[];
    subcommands?: Array<ICommandGroup|ISubCommand>;
}

export interface ICommandGroup {
    name: string;
    subcommands: SubCommand[];
}

export interface ISubCommand extends IBase {}

export interface ICommandRequirements {
    permissions?: {
        me?: TPermissions[];
        bot?: TLunarPermissions[];
        discord?: TPermissions[];
    },
    guildOnly?: boolean;
    ownerOnly?: boolean;
}

export interface ILunarClient extends Client {
    get cluster(): Cluster;
    events: Event[];
    commands: IClientCommands;
    locales: Locale[];
    logger: Logger;
    config: { 
        prefix: string, 
        owners: string[], 
        clustersName: { [key: string]: string }, 
        defaultLocale: string,
        links: {
            website: {
                baseURL: string,
                home: string,
                invite: string,
                support: string,
                commands: string,
                vote: string,
                dashboard: {
                    me: string,
                    guilds: string
                },
                callback: string,
            };
            vote: string;
            support: string;
        }
    };
    cases: number;
    dbs: DatabasesManager;
}

export interface IVoteData {
	platform: string,
	date: number
}

export interface ILog {
    id: string;
    type: number;
    reason: string;
    date: number;
    time?: number;
    user: string;
    author: string;
    server: string;
} 
  
export interface IReason {
    text: string;
    type: 1 | 2 | 3 | 4;
    duration?: number;
    keys?: string[];
    days?: number;
    _id: string;
}

export type TPermissions = 
    'createInstantInvite' 
    | 'kickMembers' 
    | 'banMembers' 
    | 'administrator' 
    | 'manageChannels' 
    | 'manageGuild' 
    | 'addReactions' 
    | 'viewAuditLog' 
    | 'viewAuditLogs' 
    | 'voicePrioritySpeaker' 
    | 'voiceStream' 
    | 'stream' 
    | 'viewChannel' 
    | 'readMessages' 
    | 'sendMessages' 
    | 'sendTTSMessages' 
    | 'manageMessages' 
    | 'embedLinks' 
    | 'attachFiles' 
    | 'readMessageHistory' 
    | 'mentionEveryone' 
    | 'useExternalEmojis' 
    | 'externalEmojis' 
    | 'viewGuildInsights' 
    | 'voiceConnect' 
    | 'voiceSpeak' 
    | 'voiceMuteMembers' 
    | 'voiceDeafenMembers' 
    | 'voiceMoveMembers' 
    | 'voiceUseVAD' 
    | 'changeNickname' 
    | 'manageNicknames' 
    | 'manageRoles' 
    | 'manageWebhooks' 
    | 'manageEmojisAndStickers' 
    | 'manageEmojis' 
    | 'useApplicationCommands' 
    | 'useSlashCommands' 
    | 'voiceRequestToSpeak' 
    | 'manageEvents' 
    | 'manageThreads' 
    | 'createPublicThreads' 
    | 'createPrivateThreads' 
    | 'useExternalStickers' 
    | 'sendMessagesInThreads' 
    | 'startEmbeddedActivities' 
    | 'moderateMembers'
    | 'allGuild' 
    | 'allText' 
    | 'allVoice' 
    | 'all'

export type TLunarPermissions = 
    'lunarBanMembers'
    | 'lunarKickMembers'
    | 'lunarMuteMembers'
    | 'lunarAdvMembers'
    | 'lunarPunishmentOutReason'
    | 'lunarViewHistory'
    | 'lunarManageHistory'

export type TGuildConfigs =
    'mandatoryReason'
    | 'sendTranscript'

export type TUserConfigs =
    'quickPunishment';