const regexEmoji = /<a?:|>/g;
const regexAnimateEmoji = /<a:.{2,32}:\d{16,20}>/;

export const BadgesEmojis = {
	// Discord
	BughunterLevel1: '<:BUGHUNTER_LEVEL_1:892105152771817513>',
	BughunterLevel2: '<:BUGHUNTER_LEVEL_2:892105146534879263>',
	DiscordCertifiedModerator: '<:DISCORD_CERTIFIED_MODERATOR:892105147910586408>',
	DiscordEmployee: '<:DISCORD_EMPLOYEE:892107117966786641>',
	EarlySupporter: '<:EARLY_SUPPORTER:892105143825362955>',
	EarlyVerifiedBotDeveloper: '<:EARLY_VERIFIED_BOT_DEVELOPER:892105149064044615>',
	HouseBalance: '<:HOUSE_BALANCE:892105154013310986>',
	HouseBravery: '<:HOUSE_BRAVERY:892105156878008360>',
	HouseBrilliance: '<:HOUSE_BRILLIANCE:892105142927773716>',
	HypesquadEvents: '<:HYPESQUAD_EVENTS:892105151190536202>',
	PartneredServerOwner: '<:PARTNERED_SERVER_OWNER:892107388738474044>',
	VerifiedBot: '<:VerifiedBOT:892381020555452416>',
	ActiveDeveloper: '<:ACTIVE_DEVELOPER:1073017111699525632>',
};

export const BadgesEmojisURLS = emojisURLEnum(BadgesEmojis) as { [key in keyof typeof BadgesEmojis]: string };

export const Colors = {
	MAIN: 10494192, 
	RED: 16065893,
	YELLOW: 16705372,
};

export const GuildFeatures = {
	// Mandatory Reason
	mandatoryReasonToBan: 1n << 0n,
	mandatoryReasonToKick: 1n << 1n,
	mandatoryReasonToMute: 1n << 2n,
	mandatoryReasonToAdv: 1n << 3n,

	// Transcript
	useHTMLTranscript: 1n << 4n,
};

export const GuildPermissions = {
	lunarBanMembers: 1n << 0n,
	lunarKickMembers: 1n << 1n,
	lunarMuteMembers: 1n << 2n,
	lunarAdvMembers: 1n << 3n,
	lunarPunishmentOutReason: 1n << 4n,
	lunarViewHistory: 1n << 5n,
	lunarManageHistory: 1n << 6n,
};

const baseUrl = 'https://lunary.space';

export const Links = {
	website: {
		baseUrl,
		home: `${baseUrl}/`,
		invite: `${baseUrl}/invite`,
		support: `${baseUrl}/support`,
		commands: `${baseUrl}/commands`,
		vote: `${baseUrl}/vote`,
		dashboard: {
			me: `${baseUrl}/dashboard/@me`,
			guilds: `${baseUrl}/dashboard/guilds`,
		},
		callback: `${baseUrl}/api/auth/callback`,
	},
	support: 'https://discord.gg/8K6Zry9Crx',
	vote: 'https://top.gg/bot/777654875441463296/vote',
};

export const PunishmentFlags = {
	system: 1n << 0n,
	notNotifyInDM: 1n << 1n,
	failedToNotifyInDM: 1n << 2n,
};

export const PunishmentTypes = {
	BAN: 1n << 0n,
	KICK: 1n << 1n,
	MUTE: 1n << 2n,
	ADV: 1n << 3n,
};

export const UserFeatures = {
	quickPunishment: 1n << 0n,
	useGuildLocale: 1n << 1n,
};

export const UserFlags = {
	lunarDeveloper: 1n << 0n,
	lunarStaff: 1n << 1n,
	lunarBugHunter: 1n << 2n,
	lunarContributorFanart: 1n << 3n,
	lunarContributorGithub: 1n << 4n,
	lunarDonator: 1n << 5n,
};

export const UserInventory = {
	profileBackgroundDefault: 1n << 0n,
	profileLayoutDefault: 1n << 1n,
	profileLayoutDefaultWhite: 1n << 2n,
};

function emojisURLEnum(emojis: { [key: string]: string }) {
	return Object.fromEntries(
		Object.entries(emojis)
			.map(([name, emoji]) => {
				const split = emoji.replace(regexEmoji, '').trim().split(':');
		
				return [name, `https://cdn.discordapp.com/emojis/${split[1]}.${regexAnimateEmoji.test(emoji) ? 'gif' : 'png'}?v=1`];
			})
	);
}