import type { APIChannel, APIGuild, GuildFeature, Snowflake } from '@discord/types';

import { Channel } from '../Channels';
import { Role } from '../Role';
import { AbstractGuild } from './AbstractGuild';

class Guild extends AbstractGuild<APIGuild & { channels?: Array<APIChannel> }> {
	public name: string;

	public description?: string;

	public features: Array<GuildFeature>;

	public roles: Array<Role>;

	public channels: Channel[];

	public icon?: string;

	public splash?: string;

	public discoverySplash?: string;

	public ownerId: string;

	public constructor(client: LunaryClient, raw: APIGuild & { channels?: Array<APIChannel> }) {
		super(client, raw.id as Snowflake);

		this._patch(raw);
	}

	public _patch(raw: APIGuild & { channels?: Array<APIChannel> }) {
		if(raw.name) {
			this.name = raw.name;
		}

		if(raw.description) {
			this.description = raw.description;
		}

		if(raw.icon) {
			this.icon = raw.icon;
		}

		if(raw.splash) {
			this.splash = raw.splash;
		}

		if(raw.discovery_splash) {
			this.discoverySplash = raw.discovery_splash;
		}

		if(raw.features) {
			this.features = raw.features;
		}

		if(raw.roles) {
			this.roles = raw.roles.map((role) => new Role(this.client, { id: this.id } as AbstractGuild, role)).sort((a, b) => a.position - b.position);
		}

		if(raw.channels) {
			// @ts-ignore
			this.channels = raw.channels.map((channel) => Channel.from(this.client, channel)) as ReadonlyArray<Channel>;
		}

		if(raw.owner_id) {
			this.ownerId = raw.owner_id;
		}
		
		return this;
	}

	public static fromAbstract(guild: AbstractGuild, data: APIGuild) {
		return new this(guild.client, data);
	}
}

export { Guild };