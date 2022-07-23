import { Routes, UserFlags } from 'types/discord';

import Structure from './Base';
import { RequiresToken } from '@decorators';

import type { APIDMChannel, APIUser, Snowflake } from 'types/discord';

class User extends Structure {
	public readonly id: Snowflake;

	public readonly username: string;

	public readonly discriminator: string;

	public readonly avatar?: string;

	public readonly system: boolean = false;

	public readonly bot: boolean = false;

	public readonly publicFlags: number | null;

	public channel?: APIDMChannel;

	public constructor(client: LunaryClient, data: APIUser) {
		super(client);

		this.id = data.id as Snowflake;

		this.username = data.username;

		this.discriminator = data.discriminator;

		this.avatar = data.avatar ?? undefined;

		this.system = data.system ?? false;

		this.bot = data.bot ?? false;

		this.publicFlags = data.public_flags ?? null;
	}

	@RequiresToken
  	private async getDMChannel() {
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