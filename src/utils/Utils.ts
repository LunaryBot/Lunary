import { Embed, EmbedType } from '@prisma/client';

import { Guild, Member, Message } from '@discord';
import { APIEmbed, ImageFormat as ImageFormats } from '@discord/types';
import { ImageSize } from '@discordjs/rest';

type ImageFormat = 'jpg' | 'png' | 'webp' | 'gif';

interface EmbedFormated extends Omit<APIEmbed, 'type'> {
	type: EmbedType;
	content?: string;
}

class Utils {
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

	public static formatImage(url: string, { format, size = 1024, dynamic = true }: { format: ImageFormat, size?: ImageSize, dynamic?: boolean }) {
		if(dynamic || !format || !Object.keys(ImageFormats).includes(format.toLowerCase())) {
			format = (url.includes('/a_') ? 'gif' : format) as ImageFormat;
		}
			
		if(!size || size < 16 || size > 4096 || (size & (size - 1))) {
			size = 2048;
		}
			
		return `https://cdn.discordapp.com/${url}.${format}?size=${size}`;
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

		return roles.findIndex(role => role.id == member1.roles[0]) >= roles.findIndex(role => role.id == member2.roles[0]);
	}
}

export default Utils;