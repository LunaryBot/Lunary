import { APIFullOrInteractionGuildMember, Routes, Snowflake } from 'types/discord';

import Structure from './Base';
import { AbstractGuild } from './Guilds';
import { User } from './User';

import { RequiresToken } from '@decorators';

class Member extends Structure {
	public readonly id: Snowflake;
  
	public readonly guild: AbstractGuild;
  
	public readonly user: User;
  
	public readonly nick?: string;
  
	public readonly avatar?: string;

	public readonly roles: ReadonlyArray<Snowflake>;
  
	public readonly pending: boolean = false;
  
	public readonly joinedAt: Date;
  
	public readonly premiumSince?: Date;
  
	public readonly timedOutUntil?: Date;
  
	public readonly deaf?: boolean;
  
	public readonly mute?: boolean;
  
	public constructor(
		client: LunaryClient,
		guild: AbstractGuild,
		id: Snowflake,
		user: User,
		data: APIFullOrInteractionGuildMember
	) {
		super(client);

		this.id = id;

		this.guild = guild;

		this.user = user;

		this.nick = data.nick ?? undefined;

		this.avatar = data.avatar ?? undefined;

		this.pending = data.pending ?? false;
  
		if('deaf' in data) this.deaf = data.deaf;

		if('mute' in data) this.mute = data.mute;
  
		this.joinedAt = new Date(data.joined_at);
  
		this.premiumSince = data.premium_since ? new Date(data.premium_since) : undefined;
  
		this.timedOutUntil = data.communication_disabled_until ? new Date(data.communication_disabled_until) : undefined;

		this.roles = data.roles as Snowflake[];
	}

    @RequiresToken
	public async addRole(roleId: string, reason?: string) {
		await this.client.rest.put(Routes.guildMemberRole(this.guild.id, this.id, roleId), {
			headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
		});
	}
  
    @RequiresToken
    async ban(data: { deleteMessageDays?: number; reason?: string }) {
    	await this.client.rest.put(Routes.guildBan(this.guild.id, this.id), {
    		body: { delete_message_days: data.deleteMessageDays },
    		headers: data.reason ? { 'X-Audit-Log-Reason': data.reason } : undefined,
    	});
    }

    @RequiresToken
    async kick(reason?: string) {
    	await this.client.rest.delete(Routes.guildMember(this.guild.id, this.id), {
    		headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    	});
    }

    @RequiresToken
    async removeRole(roleId: string, reason?: string) {
    	await this.client.rest.delete(Routes.guildMemberRole(this.guild.id, this.id, roleId), {
    		headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    	});
    }

    @RequiresToken
    async unban(reason?: string) {
    	await this.client.rest.delete(Routes.guildBan(this.guild.id, this.id), {
    		headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    	});
    }
  
    public toString() {
    	return `<@${this.id}>`;
    }
}

export { Member };