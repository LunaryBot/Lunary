import { DefaultUserAvatarAssets, ImageFormat, Routes, UserAvatarFormat } from '@discord/types';
import { APIDMChannel, APIUser, Snowflake, CDNRoutes } from '@discord/types';
import { ImageSize } from '@discordjs/rest';

import { RequiresToken } from '@decorators';
import Utils from '@utils';
import BitField from '@utils/BitField';

import Structure from './Base';

class User extends Structure<APIUser> {
	public readonly id: Snowflake;

	public username: string;

	public discriminator: string;

	public avatar?: string;

	public readonly system: boolean = false;

	public readonly bot: boolean = false;

	public flags = new UserFlags(0n);

	public publicFlags: number | null;

	public channel?: APIDMChannel;

	public constructor(client: LunaryClient, raw: APIUser) {
		super(client, raw);

		this.id = raw.id as Snowflake;

		this.system = raw.system ?? false;

		this.bot = raw.bot ?? false;

		this._patch(raw);
	}

	public _patch(raw: APIUser) {
		this.username = raw.username;

		this.discriminator = raw.discriminator;

		if(raw.avatar !== undefined && raw.avatar !== null) {
			this.avatar = raw.avatar;
		}

		if(raw.public_flags !== undefined) {
			this.publicFlags = raw.public_flags;

			this.flags.bitfield = BigInt(this.publicFlags);
		}

		return this;
	}

	get tag() {
		return `${this.username}#${this.discriminator}`;
	}

	get defaultAvatarURL() {
		return CDNRoutes.defaultUserAvatar(Number(this.discriminator) % 5 as DefaultUserAvatarAssets);
	}

	public displayAvatarURL(options: { format: 'jpg' | 'png' | 'webp' | 'gif', size?: ImageSize, dynamic?: boolean }) {
		return Utils.userDisplayAvatarURL(this, options);
	}

	@RequiresToken.bind(this)
  	public async getDMChannel() {
  		const raw = (await this.client.apis.discord.post(Routes.userChannels(), {
  			body: { recipient_id: this.id },
  		})) as APIDMChannel;

  		return raw;
  	}

	public toString() {
  		return `<@${this.id}>`;
	}
}

const Flags = {
	DiscordEmployee: 1n << 0n,
	PartneredServerOwner: 1n << 1n,
	HypesquadEvents: 1n << 2n,
	BughunterLevel1: 1n << 3n,
	HouseBravery: 1n << 6n,
	HouseBrilliance: 1n << 7n,
	HouseBalance: 1n << 8n,
	EarlySupporter: 1n << 9n,
	BughunterLevel2: 1n << 14n,
	VerifiedBot: 1n << 16n,
	EarlyVerifiedBotDeveloper: 1n << 17n,
	DiscordCertifiedModerator: 1n << 18n,
	ActiveDeveloper: 1n << 22n,
};

class UserFlags extends BitField<keyof typeof Flags> {
	public static Flags = Flags;
}

export { User, UserFlags };