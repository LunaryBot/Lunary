import { Routes, UserFlags } from '@discord/types';
import type { APIDMChannel, APIUser, Snowflake } from '@discord/types';

import { RequiresToken } from '@decorators';

import Structure from './Base';


class User extends Structure {
	public readonly id: Snowflake;

	public username: string;

	public discriminator: string;

	public avatar?: string;

	public readonly system: boolean = false;

	public readonly bot: boolean = false;

	public publicFlags: number | null;

	public channel?: APIDMChannel;

	public constructor(client: LunaryClient, data: APIUser) {
		super(client);

		this.id = data.id as Snowflake;

		this.system = data.system ?? false;

		this.bot = data.bot ?? false;

		this._patch(data);
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

	@RequiresToken
  	public async getDMChannel() {
  		const data = (await this.client.rest.post(Routes.userChannels(), {
  			body: { recipient_id: this.id },
  		})) as APIDMChannel;

  		return data;
  	}

	public toString() {
  		return `<@${this.id}>`;
	}
}

export { User, UserFlags as Flags, UserFlags };