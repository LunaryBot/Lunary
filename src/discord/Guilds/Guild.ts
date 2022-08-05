import type { APIChannel, APIGuild, GuildFeature, Snowflake } from '@discord/types';

import { Channel } from '../Channels';
import { Role } from '../Role';
import { AbstractGuild } from './AbstractGuild';

class Guild extends AbstractGuild {
	public readonly name: string;

	public readonly description?: string;

	public readonly features: ReadonlyArray<GuildFeature>;

	public readonly roles: ReadonlyArray<Role>;

	public readonly channels: ReadonlyArray<Channel>;

	public readonly icon?: string;

	public readonly splash?: string;

	public readonly discoverySplash?: string;

	public constructor(client: LunaryClient, data: APIGuild & { channels?: Array<APIChannel> }) {
		super(client, data.id as Snowflake);

		this.name = data.name;
		this.description = data.description ?? undefined;
		this.features = data.features;
		this.icon = data.icon ?? data.icon_hash ?? undefined;

		this.roles = (data.roles ?? [])
			.map((role) => new Role(this.client, this, role))
			.sort((a, b) => a.position - b.position);

		this.channels = (data.channels ?? [])
			.map((channel) => Channel.from(this.client, channel)) as ReadonlyArray<Channel>;
	}

	public static fromAbstract(guild: AbstractGuild, data: APIGuild) {
		return new this(guild.client, data);
	}
}

export { Guild };