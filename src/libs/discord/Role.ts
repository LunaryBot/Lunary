import type { APIRole, Snowflake } from '@discord/types';

import Structure from './Base';
import type { AbstractGuild } from './Guilds';
import { Permissions } from './Permissions';

interface RoleTags {
  isPremiumSubscriberRole: boolean;
  integrationId?: Snowflake;
  botId?: Snowflake;
}

class Role extends Structure<APIRole> {
	public readonly guild: AbstractGuild;
	public readonly id: Snowflake;
	public name: string;
	public color: number;
	public hoisted: boolean;
	public position: number;
	public permissions: Permissions;
	public readonly managed: boolean;
	public mentionable: boolean;
	public icon?: string;
	public emoji?: string;
	public tags?: RoleTags;

	public constructor(client: LunaryClient, guild: AbstractGuild, data: APIRole) {
		super(client, data);

		this.guild = guild;

		this.id = data.id as Snowflake;

		this.managed = data.managed;

		this._patch(data);
	}

	public _patch(data: APIRole) {
		this.name = data.name;

		this.color = data.color;

		this.hoisted = data.hoist;

		this.position = data.position;

		this.permissions = new Permissions(BigInt(Number(data.permissions)));

		this.mentionable = data.mentionable;

		if(data.icon !== undefined && data.icon !== null) {
			this.icon = data.icon || undefined;
		}

		if(data.unicode_emoji !== undefined) {
			this.emoji = data.unicode_emoji || undefined;
		}

		if(data.tags !== undefined) {
			this.tags = {
				isPremiumSubscriberRole: data.tags?.premium_subscriber === null,
				integrationId: data.tags?.integration_id as Snowflake,
				botId: data.tags?.bot_id as Snowflake,
			};
		}
	}

	public toString() {
		return `<@&${this.id}>`;
	}
}

export { Role };