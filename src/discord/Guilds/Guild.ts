import type { APIChannel, APIGuild, GuildFeature, Snowflake } from '@discord/types';

import { Channel } from '../Channels';
import { Role } from '../Role';
import { AbstractGuild } from './AbstractGuild';

class Guild extends AbstractGuild {
	public name: string;

	public description?: string;

	public features: Array<GuildFeature>;

	public roles: Array<Role>;

	public channels: Channel[];

	public icon?: string;

	public splash?: string;

	public discoverySplash?: string;

	public ownerId: string;

	public constructor(client: LunaryClient, data: APIGuild & { channels?: Array<APIChannel> }) {
		super(client, data.id as Snowflake);

		this._patch(data);
	}

	public _patch(data: APIGuild & { channels?: Array<APIChannel> }) {
		if(data.name) {
			this.name = data.name;
		}

		if(data.description) {
			this.description = data.description;
		}

		if(data.icon) {
			this.icon = data.icon;
		}

		if(data.splash) {
			this.splash = data.splash;
		}

		if(data.discovery_splash) {
			this.discoverySplash = data.discovery_splash;
		}

		if(data.features) {
			this.features = data.features;
		}

		if(data.roles) {
			this.roles = data.roles.map((role) => new Role(this.client, this, role)).sort((a, b) => a.position - b.position);
		}

		if(data.channels) {
			// @ts-ignore
			this.channels = data.channels.map((channel) => Channel.from(this.client, channel)) as ReadonlyArray<Channel>;
		}

		if(data.owner_id) {
			this.ownerId = data.owner_id;
		}
		
		return this;
	}

	public static fromAbstract(guild: AbstractGuild, data: APIGuild) {
		return new this(guild.client, data);
	}
}

export { Guild };