import BitField from './BitField';
import * as Constants from './Constants';
import * as Prisma from '@prisma/client';

type GuildPermission = keyof typeof Constants.GuildPermissions;

class GuildPermissions extends BitField<GuildPermission> {
	public type: Prisma.GuildPermissionType;
	public id: string;
	public guildId: string;

	constructor(data: Prisma.GuildPermissions) {
		super(data.permissions);

		this.type = data.type;
		this.id = data.id;
		this.guildId = data.guild_id;
	}

	public static Flags = Constants.GuildPermissions;
}

export default GuildPermissions;