import GuildFeatures from '@utils/GuildFeatures';

import type { Guild } from '@discord';
import type * as Prisma from '@prisma/client';

class GuildDatabase {
	public readonly client: LunaryClient;
	public readonly guild: Guild;

	public features: GuildFeatures;

	public modlogsChannelId: string;
	public punishmentsChannelId: string;

	public reasons: Prisma.Reason[];

	constructor(client: LunaryClient, guild: Guild, data?: Partial<Prisma.Guild>, options?: { 
		fetchReasons?: boolean, 
		fetchPermissions?: boolean 
	}) {
		Object.defineProperty(this, 'client', {
			value: client,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(this, 'guild', {
			value: guild,
			writable: false,
			enumerable: false,
		});

		if(data) {
			this._patch(data);
		} else {
			this.fetch();
		}

		if(options?.fetchPermissions) {
			this.fetchPermissions();
		}
	}

	private _patch(data: Partial<Prisma.Guild>): this {
		if(data.features) {
			this.features = new GuildFeatures(data.features);
		}

		if(data.modlogs_channel) {
			this.modlogsChannelId = data.modlogs_channel;
		}

		if(data.punishments_channel) {
			this.punishmentsChannelId = data.punishments_channel;
		}

		return this;
	}

	public async fetch() {
		const data = await this.guild.client.prisma.guild.findUnique({
			where: {
				id: this.guild.id,
			},
		});

		return this._patch(data || {});
	}

	public async fetchPermissions(): Promise<Prisma.GuildPermissions[]> {
		const data = await this.guild.client.prisma.guildPermissions.findMany({
			where: {
				guild_id: this.guild.id,
			},
		});

		return data;
	}

	public async fetchReasons(): Promise<Prisma.Reason[]> {
		const data = await this.guild.client.prisma.reason.findMany({
			where: {
				guild_id: this.guild.id,
			},
		});

		this.reasons = data;

		return data;
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
		const data: Partial<Omit<Prisma.Guild, 'id'>> = {};

		if(this.features) {
			data.features = this.features.bitfield;
		}

		if(this.modlogsChannelId) {
			data.modlogs_channel = this.modlogsChannelId;
		}

		if(this.punishmentsChannelId) {
			data.punishments_channel = this.punishmentsChannelId;
		}

		return data as Omit<Prisma.Guild, 'id'>;
	}
}

export { GuildDatabase };