import { Embed, EmbedType } from '@prisma/client';

import { Guild, Member, Message, Role, User } from '@discord';
import { APIEmbed, ImageFormat as ImageFormats, CDNRoutes, DefaultUserAvatarAssets, APIUser } from '@discord/types';
import { ImageSize } from '@discordjs/rest';

type ImageFormat = 'jpg' | 'png' | 'webp' | 'gif';

interface EmbedFormated extends Omit<APIEmbed, 'type'> {
	type: EmbedType;
	content?: string;
}

class Utils {
	public static displayColor(member: Member, guild: Guild) {
		const roles = [ ...guild.roles.values() ].filter(role => member.roles.includes(role.id));

		const coloredRoles = roles.filter(role => role.color);

		if(!coloredRoles.length) return null;

		return coloredRoles.reduce((prev, role) => (comparePositionTo(role, prev) > 0 ? role : prev)).color ?? null;

		function comparePositionTo(role1: Role, role2: Role) {
			if(role1.position === role2.position) {
				return Number(BigInt(role2.id) - BigInt(role1.id));
			}
          
			return role1.position - role2.position;
		}
	}
	
	public static formatDatabaseEmbed(embed: Embed) {
		const dataFormated: any = {};
		  
		Object.entries(embed).map(([key, value]) => {
			if(value == null) return;
			
			const inEmbed = key.startsWith('embed_');

			if(inEmbed && !dataFormated.embed) {
				dataFormated.embed = {};
			}
	
			key = key.replace('embed_', '');
				
			const [parent, ...keys] = key.split('_');
	
			const d = inEmbed ? dataFormated.embed : dataFormated;
			
			if(!keys.length) d[parent] = value;
			else {
				const refKey = keys.join('_');
	
				if(!d[parent]) {
					d[parent] = {};
				}
	
				const ref = d[parent];
				  
				ref[refKey] = value;
			}
		});
		  
		return dataFormated as EmbedFormated;
	}

	public static userDisplayAvatarURL(user: APIUser | User, options: { format: ImageFormat, size?: ImageSize, dynamic?: boolean }) {
		if(!user.avatar) {
			return CDNRoutes.defaultUserAvatar(Number(user.discriminator) % 5 as DefaultUserAvatarAssets);
		}

		return Utils.formatImage(CDNRoutes.userAvatar(user.id, user.avatar, '' as any).replace(/^\/(.*)\.$/, '$1'), options);
	}

	public static formatImage(url: string, { format, size, dynamic = true }: { format: ImageFormat, size?: ImageSize, dynamic?: boolean }) {
		if(dynamic || !format || !Object.keys(ImageFormats).includes(format.toLowerCase())) {
			format = (url.includes('/a_') ? 'gif' : format) as ImageFormat;
		}
			
		if(size && (size < 16 || size > 4096 || (size & (size - 1)))) {
			size = 2048;
		}
			
		return `https://cdn.discordapp.com/${url}.${format}${size ? `?size=${size}` : ''}`;
	}

	public static highestPosition(member1: Member, member2: Member, guild: Guild) {
		if(guild.ownerId == member1.id) { 
			return true; 
		};

		if(member1.id == member2.id || guild.ownerId == member2.id) { 
			return false; 
		};

		const roles = [ ...guild.roles.values() ].sort((a, b) => a.position - b.position);

		member1.roles.sort((a, b) => roles.findIndex(role => role.id == a) - roles.findIndex(role => role.id == b));
		member2.roles.sort((a, b) => roles.findIndex(role => role.id == a) - roles.findIndex(role => role.id == b));

		const member1HighsetRoleIndex = roles.findIndex(role => role.id == member1.roles[0]);
		const member2HighsetRoleIndex = roles.findIndex(role => role.id == member2.roles[0]);

		return member1HighsetRoleIndex < member2HighsetRoleIndex;
	}
}

export default Utils;