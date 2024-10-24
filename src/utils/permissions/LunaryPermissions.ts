import { LunaryPermissionFlagsBits } from '@/constants'

import BitField from '../Bitfield'

export class LunaryPermissions extends BitField<keyof typeof LunaryPermissionFlagsBits> {
	public static defaultBit: bigint = 0n

	public static Flags = LunaryPermissionFlagsBits
}