import * as Prisma from '@prisma/client';

import { User } from '@discord';

import { UserFeatures } from './UserFeatures';
import { UserFlags } from './UserFlags';

class UserDatabase {
	public readonly client: LunaryClient;
	public readonly user: User;

	public features = new UserFeatures(0n);
	public flags = new UserFlags(0n);
	
	public profile: {
		bio?: string;
		background: number;
		layout: number;
	};

	public xp: number;
	public inventory: number[];

	public luas: number;
	public lastDailyAt?: Date;

	public premiumType?: Prisma.UserPremiumType;
	public premiumUntil?: Date;


	constructor(client: LunaryClient, user: User, options?: {
        data?: Partial<Prisma.User> | null;
    }) {
		Object.defineProperty(this, 'client', {
			value: client,
			writable: false,
			enumerable: false,
		});

		Object.defineProperty(this, 'user', {
			value: user,
			writable: false,
			enumerable: false,
		});

		if(options?.data) {
			this._patch(options.data);
		}
	}

	public _patch(data: Partial<Prisma.User>): this {
		this.features.bitfield = data.features ?? 0n;
		this.flags.bitfield = data.flags ?? 0n;

		this.luas = data.luas ?? 0;
		this.xp = data.xp ?? 0;

		this.profile = {
			bio: data.bio || undefined,
			background: (data.profile as any)?.background || 0,
			layout: (data.profile as any)?.layout || 1,
		};

		if(data.last_daily_at) {
			this.lastDailyAt = data.last_daily_at;
		}

		if(data.premium_type && data.premium_until && data.premium_until.getTime() <= Date.now()) {
			this.premiumType = data.premium_type;
			this.premiumUntil = data.premium_until;
		}

		return this;
	}

	public async fetch(): Promise<this> {
		const data = await this.client.prisma.user.findUnique({
			where: { 
				id: this.user.id, 
			},
		});

		return this._patch(data || {});
	}

	public hasPremium(): boolean {
		const premiumUntil = this.premiumUntil?.getTime();
		
		return this.premiumType !== undefined && premiumUntil !== undefined && premiumUntil <= Date.now();
	}

	public async save(): Promise<this> {
		const data = this.toJson();

		const user = await this.client.prisma.user.upsert({
			where: { 
				id: this.user.id, 
			},
			create: {
				id: this.user.id,
				...data as any,
			},
			update: data as any,
		});

		return this._patch(user);
	}

	public toJson(): Omit<Prisma.User, 'id'> {
		const data: Partial<Omit<Prisma.User, 'id'>> = {
			features: this.features.bitfield || null,
			luas: this.luas || null,
			xp: this.xp || null,
			bio: this.profile.bio || null,
			flags: this.flags.bitfield || null,
			last_daily_at: this.lastDailyAt || null,
			premium_type: this.premiumType || null,
			premium_until: this.premiumUntil || null,
			inventory: this.inventory || [],
			profile: { background: this.profile.background, layout: this.profile.layout },
		};
		
		return data as Omit<Prisma.User, 'id'>;
	}
}

export { UserDatabase };