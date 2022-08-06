import { APIFullOrInteractionGuildMember, Routes, Snowflake } from '@discord/types';

import { RequiresToken } from '@decorators';

import Structure from './Base';
import { AbstractGuild } from './Guilds';
import { User } from './User';


class Member extends Structure {
	public readonly id: Snowflake;
  
	public readonly guild: AbstractGuild;
  
	public user: User;
  
	public nick?: string;
  
	public avatar?: string;

	public roles: ReadonlyArray<Snowflake>;
  
	public pending: boolean = false;
  
	public joinedAt: Date;
  
	public premiumSinceAt?: Date;
  
	public timedOutUntilAt?: Date;
  
	public deaf?: boolean;
  
	public mute?: boolean;
  
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

		this._patch(data);
	}

	public _patch(data: APIFullOrInteractionGuildMember) {
		this.joinedAt = new Date(data.joined_at);

		if(data.nick !== undefined) {
			this.nick = data.nick ?? undefined;
		}

		if(data.avatar !== undefined) {
			this.avatar = data.avatar ?? undefined;
		}

		if(data.pending !== undefined) {
			this.pending = data.pending ?? false;
		}
  
		if('deaf' in data) this.deaf = data.deaf;

		if('mute' in data) this.mute = data.mute;

		if(data.premium_since !== undefined && data.premium_since !== null) {
			this.premiumSinceAt = new Date(data.premium_since);
		}

		if(data.communication_disabled_until !== undefined && data.communication_disabled_until !== null) {
			this.timedOutUntilAt = new Date(data.communication_disabled_until);
		}

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