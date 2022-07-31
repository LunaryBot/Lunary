export const BadgesEmojis = {
	BUG_HUNTER_LEVEL_1: '<:BUGHUNTER_LEVEL_1:892105152771817513>',
	BUG_HUNTER_LEVEL_2: '<:BUGHUNTER_LEVEL_2:892105146534879263>',
	DISCORD_CERTIFIED_MODERATOR: '<:DISCORD_CERTIFIED_MODERATOR:892105147910586408>',
	DISCORD_EMPLOYEE: '<:DISCORD_EMPLOYEE:892107117966786641>',
	EARLY_SUPPORTER: '<:EARLY_SUPPORTER:892105143825362955>',
	EARLY_VERIFIED_BOT_DEVELOPER: '<:EARLY_VERIFIED_BOT_DEVELOPER:892105149064044615>',
	HOUSE_BALANCE: '<:HOUSE_BALANCE:892105154013310986>',
	HOUSE_BRAVERY: '<:HOUSE_BRAVERY:892105156878008360>',
	HOUSE_BRILLIANCE: '<:HOUSE_BRILLIANCE:892105142927773716>',
	HYPESQUAD_EVENTS: '<:HYPESQUAD_EVENTS:892105151190536202>',
	PARTNERED_SERVER_OWNER: '<:PARTNERED_SERVER_OWNER:892107388738474044>',
	VERIFIED_BOT: '<:VerifiedBOT:892381020555452416>',
};

export const Colors = { 
	MAIN: 10494192, 
	RED: 16065893,
	YELLOW: 16705372,
};

export const GuildFeatures = {
	mandatoryReason: 1n << 0n,
	sendTranscript: 1n << 1n,
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
