export const LunaryPermissionFlagsBits = {
	LunaryBanMembers: 1n << 0n,
	LunaryKickMembers: 1n << 0n,
	LunaryMuteMembers: 1n << 0n,
	LunaryAdvMembers: 1n << 0n,
	LunaryPunishmentOutReason: 1n << 0n,
	LunaryViewCasesHistory: 1n << 0n,
	LunaryManageCasesHistory: 1n << 6n,
}

export const LunaryGuildFeatureFlagsBits = {
	MandatoryReasonToBan: 1n << 0n,
	MandatoryReasonToKick: 1n << 1n,
	MandatoryReasonToMute: 1n << 2n,
	MandatoryReasonToAdv: 1n << 3n,
}