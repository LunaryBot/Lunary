import type * as Prisma from '@prisma/client';

import { AbstractGuild } from '@discord';
import type { Guild } from '@discord';
import type { Snowflake } from '@discord/types';

import { GuildFeatures } from './GuildFeatures';
import { GuildPermissions } from './GuildPermissions';

class GuildDatabase {
	public readonly client: LunaryClient;
	public readonly guild: Guild;

	public features?: GuildFeatures;

	public modlogsChannelId?: string;
	public punishmentsChannelId?: string;

	public reasons?: Prisma.Reason[];
	public permissions?: GuildPermissions[];

	public premiumType?: Prisma.GuildPremiumType;
	public premiumUntil?: Date;

	constructor(client: LunaryClient, guild: Guild|Snowflake, options?: { 
		fetchReasons?: boolean, 
		fetchPermissions?: boolean,
		data?: Partial<Prisma.Guild> & { reasons?: Prisma.Reason[], permissions?: Prisma.GuildPermissions[] } | null,
	}) {
		Object.defineProperty(this, 'client', {
			value: client,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(this, 'guild', {
			value: typeof guild === 'string' ? new AbstractGuild(client, guild) : guild,
			writable: false,
			enumerable: false,
		});

		if(options?.data) {
			this._patch(options.data);
		}
	}

	private _patch(data: Partial<Prisma.Guild> & { reasons?: Prisma.Reason[], permissions?: Prisma.GuildPermissions[] }): this {
		if(data.features) {
			this.features = new GuildFeatures(data.features);
		}

		if(data.modlogs_channel) {
			this.modlogsChannelId = data.modlogs_channel;
		}

		if(data.punishments_channel) {
			this.punishmentsChannelId = data.punishments_channel;
		}

		if(data.permissions) {
			this.permissions = data.permissions.map(permission => new GuildPermissions(permission));
		}

		if(data.reasons) {
			this.reasons = data.reasons;
		}

		if(data.premium_type && data.premium_until && data.premium_until.getTime() <= Date.now()) {
			this.premiumType = data.premium_type;
			this.premiumUntil = data.premium_until;
		}

		return this;
	}

	public async fetch({ fetchPermissions = false, fetchReasons = false } = {}): Promise<this> {
		const query: any = {
			where: {
				id: this.guild.id,
			},
		};

		if(fetchPermissions || fetchReasons) {
			query.include = {};
		}

		if(fetchPermissions) {
			query.include.permissions = true;
		}

		if(fetchReasons) {
			query.include.reasons = true;
		}

		const data = await this.guild.client.prisma.guild.findUnique(query);

		return this._patch(data || {});
	}

	public async fetchPermissions(): Promise<GuildPermissions[]> {
		const data = await this.guild.client.prisma.guildPermissions.findMany({
			where: {
				guild_id: this.guild.id,
			},
		});

		this.permissions = data.map(permission => new GuildPermissions(permission));

		return this.permissions;
	}

	public async fetchReasons(): Promise<Prisma.Reason[]> {
		const data = await this.guild.client.prisma.reason.findMany({
			where: {
				guild_id: this.guild.id,
			},
		});

		this.reasons = data;

		return this.reasons;
	}

	public hasPremium(): boolean {
		const premiumUntil = this.premiumUntil?.getTime();
		
		return this.premiumType !== undefined && premiumUntil !== undefined && premiumUntil <= Date.now();
	}

	public async save() {
		const data = this.toJson();
        
		const result = await this.guild.client.prisma.guild.upsert({
			where: {
				id: this.guild.id,
			},
			create: {
				id: this.guild.id,
				...data,
			},
			update: data,
		});

		return this._patch(result);
	}

	public toJson(): Omit<Prisma.Guild, 'id'> {
		const data: Partial<Omit<Prisma.Guild, 'id'>> = {
			features: this.features?.bitfield || null,
			modlogs_channel: this.modlogsChannelId || null,
			punishments_channel: this.punishmentsChannelId || null,
		};

		if(this.hasPremium()) {
			data.premium_type = this.premiumType;
			data.premium_until = this.premiumUntil;
		}

		return data as Omit<Prisma.Guild, 'id'>;
	}
}

export { GuildDatabase };