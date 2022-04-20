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