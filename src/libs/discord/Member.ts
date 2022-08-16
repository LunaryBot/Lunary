import { APIFullOrInteractionGuildMember, Routes, Snowflake } from '@discord/types';

import { RequiresToken } from '@decorators';

import Structure from './Base';
import { AbstractGuild } from './Guilds';
import { User } from './User';


class Member extends Structure<APIFullOrInteractionGuildMember> {
	public readonly id: Snowflake;
  
	public readonly guild: AbstractGuild;
  
	public user: User;
  
	public nick?: string;
  
	public avatar?: string;

	public roles: Array<Snowflake>;
  
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
		raw: APIFullOrInteractionGuildMember
	) {
		super(client, raw);

		this.id = id;

		this.guild = guild;

		this.user = user;

		this._patch(raw);
	}

	public _patch(raw: APIFullOrInteractionGuildMember) {
		this.joinedAt = new Date(raw.joined_at);

		if(raw.nick !== undefined) {
			this.nick = raw.nick ?? undefined;
		}

		if(raw.avatar !== undefined) {
			this.avatar = raw.avatar ?? undefined;
		}

		if(raw.pending !== undefined) {
			this.pending = raw.pending ?? false;
		}
  
		if('deaf' in raw) this.deaf = raw.deaf;

		if('mute' in raw) this.mute = raw.mute;

		if(raw.premium_since !== undefined && raw.premium_since !== null) {
			this.premiumSinceAt = new Date(raw.premium_since);
		}

		if(raw.communication_disabled_until !== undefined && raw.communication_disabled_until !== null) {
			this.timedOutUntilAt = new Date(raw.communication_disabled_until);
		}

		this.roles = raw.roles as Snowflake[];
	}

    @RequiresToken.bind(this)
	public async addRole(roleId: string, reason?: string) {
		await this.client.rest.put(Routes.guildMemberRole(this.guild.id, this.id, roleId), {
			headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
		});
	}
  
    @RequiresToken.bind(this)
    async ban(raw: { deleteMessageDays?: number; reason?: string }) {
    	await this.client.rest.put(Routes.guildBan(this.guild.id, this.id), {
    		body: { delete_message_days: raw.deleteMessageDays },
    		headers: raw.reason ? { 'X-Audit-Log-Reason': raw.reason } : undefined,
    	});
    }

    @RequiresToken.bind(this)
    async kick(reason?: string) {
    	await this.client.rest.delete(Routes.guildMember(this.guild.id, this.id), {
    		headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    	});
    }

    @RequiresToken.bind(this)
    async removeRole(roleId: string, reason?: string) {
    	await this.client.rest.delete(Routes.guildMemberRole(this.guild.id, this.id, roleId), {
    		headers: reason ? { 'X-Audit-Log-Reason': reason } : undefined,
    	});
    }

    @RequiresToken.bind(this)
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