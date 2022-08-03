import type { APIRole, Snowflake } from '@discord/types';

import Structure from './Base';
import type { AbstractGuild } from './Guilds';
import { Permissions } from './Permissions';


interface RoleTags {
  isPremiumSubscriberRole: boolean;
  integrationId?: Snowflake;
  botId?: Snowflake;
}

class Role extends Structure {
	public readonly guild: AbstractGuild;
	public readonly id: Snowflake;
	public readonly name: string;
	public readonly color: number;
	public readonly hoisted: boolean;
	public readonly position: number;
	public readonly permissions: Permissions;
	public readonly managed: boolean;
	public readonly mentionable: boolean;
	public readonly icon?: string;
	public readonly emoji?: string;
	public readonly tags?: RoleTags;

	public constructor(client: LunaryClient, guild: AbstractGuild, data: APIRole) {
		super(client);

		this.guild = guild;

		this.id = data.id as Snowflake;

		this.name = data.name;

		this.color = data.color;

		this.hoisted = data.hoist;

		this.position = data.position;

		this.permissions = new Permissions(data.permissions);

		this.managed = data.managed;

		this.mentionable = data.mentionable;

		this.icon = data.icon || undefined;

		this.emoji = data.unicode_emoji || undefined;

		this.tags = {
			isPremiumSubscriberRole: data.tags?.premium_subscriber === null,
			integrationId: data.tags?.integration_id as Snowflake,
			botId: data.tags?.bot_id as Snowflake,
		};
	}

	public toString() {
		return `<@&${this.id}>`;
	}
}

export { Role };