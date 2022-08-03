import type { APIGuild, GuildFeature, Snowflake } from '@discord/types';

import { Role } from '../Role';
import { AbstractGuild } from './AbstractGuild';


class Guild extends AbstractGuild {
	public readonly name: string;

	public readonly description?: string;

	public readonly features: ReadonlyArray<GuildFeature>;

	public readonly roles: ReadonlyArray<Role>;

	public readonly icon?: string;

	public readonly splash?: string;

	public readonly discoverySplash?: string;

	public constructor(client: LunaryClient, data: APIGuild) {
		super(client, data.id as Snowflake);

		this.name = data.name;
		this.description = data.description ?? undefined;
		this.features = data.features;
		this.icon = data.icon ?? data.icon_hash ?? undefined;

		this.roles = (data.roles ?? [])
			.map((role) => new Role(this.client, this, role))
			.sort((a, b) => a.position - b.position);
	}

	public static fromAbstract(guild: AbstractGuild, data: APIGuild) {
		return new this(guild.client, data);
	}
}

export { Guild };