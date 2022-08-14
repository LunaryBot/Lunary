import { PunishmentType } from '@prisma/client';

import { GuildDatabase } from '@Database';

import { User } from '@discord';
import { APIEmbed } from '@discord/types';

import JsonPlaceholderReplacer from '../JsonPlaceholderReplacer';

const az = [ ...'abcdefghijklmnopqrstuvwxyz' ];

interface PunishmentOptions { 
	type: PunishmentType; 
	user: User;
	author: User;
	reason: string;
	id: string;
	duration?: string;
};

class ModUtils {
	static client: LunaryClient;

	public static formatPunishmentId(punishmentsCount: number): string {
		const a = (punishmentsCount + 1) % 1000000;

		const id = az[Math.floor((punishmentsCount + 1) / 1000000)].toUpperCase() + '0'.repeat(6 - a.toString().length) + a;
        
		return id;
	}

	public static formatPunishmentMessage(punishment: PunishmentOptions, t: (ref: string, variables?: Object) => string, database: GuildDatabase) {
		const punishmentMessage = ModUtils.replacePlaceholders(
			database.embeds?.find(embed => embed.type == 'BAN')?.data || JSON.parse(t('general:punishment_message')) as APIEmbed,
			punishment
		);

		return punishmentMessage;
	}

	public static replacePlaceholders(json: Object, punishment: PunishmentOptions) {
		const { author, user } = punishment;

		const placeholders = [
            // User
			{ aliases: ['@user', 'user.mention'], value: user.toString() },
			{ aliases: ['user.tag'], value: `${user.username}#${user.discriminator}` },
			{ aliases: ['user.username', 'user.name'], value: user.username },
			{ aliases: ['user.discriminator'], value: user.discriminator },
			{ aliases: ['user.id'], value: user.id },
			{ aliases: ['user.avatar', 'user.icon'], value: user.displayAvatarURL('png', 1024) },
            // Author
			{ aliases: ['@author', 'author.mention', '@staff', 'staff.mention'], value: author.toString() },
			{ aliases: ['author.tag', 'staff.tag'], value: `${author.username}#${author.discriminator}` },
			{ aliases: ['author.username', 'user.name'], value: author.username },
			{ aliases: ['author.discriminator'], value: author.discriminator },
			{ aliases: ['author.id', 'staff.id'], value: author.id },
			{ aliases: ['author.avatar', 'author.icon', 'staff.avatar', 'staff.icon'], value: author.displayAvatarURL('png', 1024) },
            // Punishment
			{ aliases: ['punishment', 'punishment.type'], value: punishment.type || 'ᕙ(⇀‸↼‶)ᕗ' },
			{ aliases: ['punishment.id'], value: punishment.id },
			{ aliases: ['punishment.reason'], value: punishment.reason || '\u200b' },
			{ aliases: ['punishment.duration'], value: punishment.duration || 'Infinity' },
		];
    
		const jsonReplace = new JsonPlaceholderReplacer();

		jsonReplace.addVariableMap(placeholders.map(placeholder => {
			const { aliases, value } = placeholder;
			const obj = Object.fromEntries(aliases.map(alias => [ alias, value ]));

			return obj;
		}).reduce((acc, obj) => ({ ...acc, ...obj }), {}));

		return jsonReplace.replace(json);
	}
}

export { ModUtils };