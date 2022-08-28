import { DefaultUserAvatarAssets, ImageFormat, Routes, UserAvatarFormat, UserFlags } from '@discord/types';
import { APIDMChannel, APIUser, Snowflake, CDNRoutes } from '@discord/types';
import { ImageSize } from '@discordjs/rest';

import { RequiresToken } from '@decorators';
import Utils from '@utils';

import Structure from './Base';

class User extends Structure<APIUser> {
	public readonly id: Snowflake;

	public username: string;

	public discriminator: string;

	public avatar?: string;

	public readonly system: boolean = false;

	public readonly bot: boolean = false;

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
		if(!this.avatar) {
			return this.defaultAvatarURL;
		}

		return Utils.formatImage(CDNRoutes.userAvatar(this.id, this.avatar, '' as any).replace(/^\/(.*)\.$/, '$1'), options);
	}

	@RequiresToken.bind(this)
  	public async getDMChannel() {
  		const raw = (await this.client.rest.post(Routes.userChannels(), {
  			body: { recipient_id: this.id },
  		})) as APIDMChannel;

  		return raw;
  	}

	public toString() {
  		return `<@${this.id}>`;
	}
}

export { User, UserFlags as Flags, UserFlags };