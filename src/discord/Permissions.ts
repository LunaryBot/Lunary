import type { Snowflake } from 'types/discord';

import BitField from '@utils/BitField';

interface PermissionOverwrite {
    id: Snowflake;
  
    type: 0 | 1;
  
    allow: Permissions;

    deny: Permissions;
}

class Permissions extends BitField {
	public static defaultBit: bigint = 0n;

	public static Flags = {
		createInstantInvite: 1n << 0n,
		kickMembers: 1n << 1n,
		banMembers: 1n << 2n,
		administrator: 1n << 3n,
		manageChannels: 1n << 4n,
		manageGuild: 1n << 5n,
		addReactions: 1n << 6n,
		viewAuditLog: 1n << 7n,
		voicePrioritySpeaker: 1n << 8n,
		voiceStream: 1n << 9n,
		viewChannel: 1n << 10n,
		sendMessages: 1n << 11n,
		sendTTSMessages: 1n << 12n,
		manageMessages: 1n << 13n,
		embedLinks: 1n << 14n,
		attachFiles: 1n << 15n,
		readMessageHistory: 1n << 16n,
		mentionEveryone: 1n << 17n,
		useExternalEmojis: 1n << 18n,
		viewGuildInsights: 1n << 19n,
		voiceConnect: 1n << 20n,
		voiceSpeak: 1n << 21n,
		voiceMuteMembers: 1n << 22n,
		voiceDeafenMembers: 1n << 23n,
		voiceMoveMembers: 1n << 24n,
		voiceUseVAD: 1n << 25n,
		changeNickname: 1n << 26n,
		manageNicknames: 1n << 27n,
		manageRoles: 1n << 28n,
		manageWebhooks: 1n << 29n,
		manageEmojisAndStickers: 1n << 30n,
		useApplicationCommands: 1n << 31n,
		voiceRequestToSpeak: 1n << 32n,
		manageEvents: 1n << 33n,
		manageThreads: 1n << 34n,
		createPublicThreads: 1n << 35n,
		createPrivateThreads: 1n << 36n,
		useExternalStickers: 1n << 37n,
		sendMessagesInThreads: 1n << 38n,
		startEmbeddedActivities: 1n << 39n,
		moderateMembers: 1n << 40n,
	};
}

export { Permissions, PermissionOverwrite };