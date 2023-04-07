import type { CommandContext } from '@Contexts';
import { GuildDatabase } from '@Database';

import { Member } from '@libs/discord';

import type { CommandRequirements, CommandBase } from '@types';

class Base {
	public declare client: LunaryClient;
    
	public name: string;
	public dirname?: string | undefined;
	public requirements?: CommandRequirements | null;
	public cooldown: number;

	constructor(
		client: LunaryClient,
		data: CommandBase
	) {
		this.name = data.name;
		this.dirname = data.dirname || undefined;
		this.requirements = data.requirements || null;
		this.cooldown = data.cooldown || 0;
        
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});
	};

	public async run(context: CommandContext): Promise<any> {}

	public get commandName() {
		return this.name;
	}

	async verifyPermissions(context: CommandContext, data = { me: true, member: true }) {
		const { permissions } = this.requirements || {};

		if(permissions) {
			if(permissions.discord) {
				const memberPermissions = (context.member as Member).permissions || context.guild.permissionsFor(context.member as Member);

				if(!permissions.discord.every(perm => memberPermissions.has(perm))) data.member = false;
			}
            
			if(permissions.lunary && !data.member) {
				if((await (context.databases.guild as GuildDatabase).permissionsFor(context.member as Member)).has(permissions.lunary)) data.member = true;
			}

			if(permissions.me) {
				const memberPermissions = context.app_permissions;

				if(!permissions.me.every(perm => memberPermissions.has(perm))) data.me = false;
			}
		}
    
		return data;
	}
}

export default Base;