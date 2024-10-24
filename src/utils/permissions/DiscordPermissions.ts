import { PermissionFlagsBits } from 'discord-api-types/v10'

import BitField from '../Bitfield'

const DiscordPermissionFlags = PermissionFlagsBits

export class DiscordPermissions extends BitField<keyof typeof DiscordPermissionFlags> {
	public static defaultBit: bigint = 0n

	public static Flags = PermissionFlagsBits
}