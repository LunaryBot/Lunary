import { Guild, Member, Message } from '@discord';
import { CDNRoutes, ImageFormat as ImageFormats } from '@discord/types';
import { ImageSize } from '@discordjs/rest';

type ImageFormat = 'jpg' | 'png' | 'webp' | 'gif';

class Utils {public static formatImage(url: string, format: ImageFormat, size: ImageSize) {
        
	if(!format || !Object.keys(ImageFormats).includes(format.toLowerCase())) {
		format = (url.includes('/a_') ? 'gif' : 'png') as ImageFormat;
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