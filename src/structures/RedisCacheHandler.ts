import { RedisKey } from 'ioredis';

import { APIChannel, APIGuild, APIGuildMember, APIRole, APIUser, Routes } from '@discord/types';

import buildRoute from '@utils/BuildRoute';

import type Redis from './Redis';

type Channel = Pick<APIChannel, 'id' | 'name' | 'type'> & { position?: number, parent_id?: string, nsfw?: boolean };
type Guild = Pick<APIGuild, 'id' | 'name' | 'icon' | 'features' | 'banner'> & { ownerId: string, roles: Array<Role>, channels: Array<Channel> };
type Role = Pick<APIRole, 'id' | 'name' | 'color' | 'hoist' | 'permissions' | 'position'>;

const keysRegex = /^(channels|guilds|users):(\d{16,20}).*?$/;
const guildMemberKeyRegex = /^guilds:\d{16,20}:members:(\d{16,20})$/;

class RedisCacheHandler {
	public client: LunaryClient;
	public redis: Redis;

	constructor(client: LunaryClient, redis: Redis) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});

		Object.defineProperty(this, 'redis', {
			value: redis,
			enumerable: false,
			writable: false,
		});
	}

	public route() {
		const { redis } = this;

		return buildRoute({
			methods: {
				get: this.get.bind(this),
				set: redis.set.bind(redis),
				del: redis.del.bind(redis),
			},
			join: ':',
			baseRoute: [],
		});
	}

	public async get(key: RedisKey) {
		let value = await this.redis.get(key);
		
		if(value === null) {
			if(keysRegex.test(key.toString())) {
				const execed = keysRegex.exec(key.toString()) as RegExpExecArray;

				const [, type, id] = ([ ...execed ]);

				logger.info(`Cache miss for ${type} with id ${id} (key: ${key.toString()})`, { label: 'Redis' });

				switch (type) {
					case 'guilds': {
						const guildId = id;

						if(guildMemberKeyRegex.test(key.toString())) {
							const [, userId] = [ ...(guildMemberKeyRegex.exec(key.toString()) as Array<string>) ];

							const member = await this.client.rest.get(Routes.guildMember(guildId, userId)) as APIGuildMember;

							if(member.user !== undefined) {
								await this.setUser(member.user);
							}

							value = await this.setGuildMember(guildId, userId, member);
						} else {
							const guild = await this.client.rest.get(Routes.guild(guildId)) as APIGuild;
	
							const channels = await this.client.rest.get(Routes.guildChannels(guildId)) as Array<APIChannel>;
	
							value = await this.setGuild({ ...guild, channels });
						}

						break;
					}

					case 'users': {
						const userId = id;

						const user = await this.client.rest.get(Routes.user(userId)) as APIUser;

						value = await this.setUser(user);

						break;
					}
				}
			}
		}
		
		return value;
	}

	public async getGuild(guildId: string): Promise<Guild> {
		const guild = await this.client.redis.get(`guilds:${guildId}`);

		if(!guild) {
			const guild = await this.client.rest.get(Routes.guild(guildId)) as Guild;

			await this.client.redis.set(`guilds:${guildId}`, JSON.stringify(guild));

			return guild;
		}

		return JSON.parse(guild) as Guild;
	}

	async setGuild(guild: (APIGuild & { channels?: Array<APIChannel> }) | Guild) {
		const resolvedGuild: Partial<Guild> = {
			id: guild.id,
			name: guild.name,
			icon: guild.icon,
			ownerId: (guild as Guild).ownerId ?? (guild as APIGuild).owner_id,
			features: guild.features,
			banner: guild.banner,
		};

		if(guild.roles) {
			resolvedGuild.roles = RedisCacheHandler.resolveRoles(guild.roles);
		}

		if(guild.channels) {
			resolvedGuild.channels = RedisCacheHandler.resolveChannels(guild.channels);
		}
        
		await this.client.redis.set(`guilds:${guild.id}`, JSON.stringify(resolvedGuild));

		return resolvedGuild;
	}

	async setGuildMember(guildId: string, userId: string, member: APIGuildMember) {
		delete member.user;

		await this.client.redis.set(`guilds:${guildId}:members:${userId == this.client.user.id ? '@me' : userId}`, JSON.stringify(member));

		return member;
	}

	async setUser(user: APIUser) {
		await this.client.redis.set(`users:${user.id}`, JSON.stringify(user));

		return user;
	}

	static resolveChannels(channels: Array<APIChannel|Channel>) {
		return channels.map(channel => {
			const data: any = {
				id: channel.id,
				name: channel.name,
				type: channel.type,
			};

			if('nsfw' in channel) {
				data.nsfw = channel.nsfw ?? false;
			}

			if('parent_id' in channel) {
				data.parent_id = channel.parent_id;
			}

			if('position' in channel) {
				data.position = channel.position;
			}

			return data;
		});
	}
	
	static resolveRoles(roles: Array<APIRole|Role>) {
		return roles.map(role => {
			// @ts-ignore
			delete role.unicode_emoji;
			// @ts-ignore
			delete role.icon;
			// @ts-ignore
			delete role.tags;

			return role;
		});
	}
}

export default RedisCacheHandler;