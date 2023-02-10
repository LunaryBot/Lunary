import { Command } from '@Command';
import { CommandContext } from '@Contexts';

import { ComponentInteraction, Member, Permissions, User, UserFlags } from '@discord';
import {  APIActionRowComponent, APIEmbed } from '@discord/types';

import { ComponentCollector } from '@Collectors';
import Utils from '@utils';
import { Colors, BadgesEmojis } from '@utils/Constants';

import { APIButtonComponent, ButtonStyle } from 'discord-api-types/v10';

class UserInfoCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'User Info',
			requirements: {
				cache: {
					guild: true,
				},
			},
			dirname: __dirname,
		});
	}

	public async run(context: CommandContext) {
		const user: User = context.options.get('user');

		const userAvatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 });

		const member: Member = user.id == context.user.id ? context.member : context.options.get('user', { member: true });
        
		const badges = Object.entries(BadgesEmojis).map(([key, value]) => {
			const flag = Number(UserFlags[key as keyof typeof UserFlags]);

			if(flag && ((user.publicFlags || 0) & flag) === flag) {
				return value;
			}

			return null;
		}).filter(Boolean).reverse();

		if(context.guild?.ownerId === user.id) {
			badges.push(':crown:');
		}

		const embeds = [
			{
				color: Colors.MAIN,
				author: {
					name: context.t('user_info:userInformation'),
				},
				title: user.username,
				url: `https://discordapp.com/users/${user.id}`,
				thumbnail: {
					url: userAvatarURL,
				},
				description: badges?.length ? `> ${badges.reverse().join(' ')}` : undefined,
				fields: [
					{
						name: `:bookmark: ${context.t('user_info:userTagDiscord')}:`,
						value: `${user.username}#${user.discriminator}`,
						inline: true,
					},
					{
						name: `:computer: ${context.t('user_info:userIdDiscord')}:`,
						value: `${user.id}`,
						inline: true,
					},
					{
						name: `:calendar_spiral: ${context.t('user_info:userCreatedTimestamp')}`,
						value: `<t:${Math.floor((user.createdAt + 3600000) / 1000.0)}> (<t:${Math.floor((user.createdAt + 3600000) / 1000.0)}:R>)`,
					},
				],
			},
		] as APIEmbed[];

		const components = [
			{
				type: 1,
				components: [
					{
						type: 2,
						label: context.t('user_info:userAvatar'),
						url: userAvatarURL,
						style: ButtonStyle.Link,
					},
				],
			},
		] as APIActionRowComponent<APIButtonComponent>[];

		if(member) {
			const guildAvatar = member.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 });

			const embed = {
				color: Utils.displayColor(member, context.guild),
				author: {
					name: context.t('user_info:memberInformation'),
				},
				title: member.nick || user.username,
				thumbnail: {
					url: guildAvatar,
				},
				fields: [
					{
						name: `:star2: ${context.t('user_info:memberJoinedTimestamp')}`,
						value: `<t:${Math.floor((member.joinedAt.getTime() as number + 3600000) / 1000.0)}> (<t:${Math.floor((member.joinedAt.getTime() as number + 3600000) / 1000.0)}:R>)`,
					},
				],
			} as APIEmbed;

			if(member.premiumSinceAt) {
				embed.fields?.push({
					name: `<:booster:892131133800742973> ${context.t('user_info:memberPremiumSinceTimestamp')}`,
					value: `<t:${Math.floor((member.premiumSinceAt.getTime() as number + 3600000) / 1000.0)}> (<t:${Math.floor((member.premiumSinceAt.getTime() as number + 3600000) / 1000.0)}:R>)`,
				});
			}

			embed.fields?.push({
				name: `<:L_pulica:959094660167512105> ${context.t('user_info:memberTimeoutedTimestamp')}`,
				value: member.timedOutUntilAt ? `<t:${Math.floor((member.timedOutUntilAt.getTime() as number) / 1000.0)}> (<t:${Math.floor((member.timedOutUntilAt.getTime() as number) / 1000.0)}:R>)` : context.t('user_info:memberNotTimeouted'),
			});

			embeds.push(embed);

			if(guildAvatar !== userAvatarURL) components[0].components.push({
				type: 2,
				label: context.t('user_info:memberAvatar'),
				url: guildAvatar,
				style: ButtonStyle.Link,
			});

			components.push({
				type: 1,
				components: [
					{
						type: 2,
						label: context.t('user_info:memberPermissionsButton'),
						custom_id: `${context.interaction.id}-permissions`,
						style: ButtonStyle.Secondary,
						emoji: { name: '🔑' },
					},
				],
			});
		}

		context.createMessage({ embeds, components });

		if(!member) return;

		const collector = new ComponentCollector(this.client, {
			time: 1 * 60 * 1000,
			user: context.user,
			filter: (interaction) => interaction.customId?.startsWith(`${context.interaction.id}-`),
		});

		collector
			.on('collect', async(interaction: ComponentInteraction) => {
				const id = interaction.customId.split('-')[1];

				switch (id) {
					case 'permissions': {
						const permissions = new Permissions(BigInt(Number((member.raw as any).permissions)));
						const permissionsEmojis = permissions.toArray().map(key => {
							const t = context.t(`permissions:${key}`);
    
							if(t == ':bug:') return key;
    
							return `\`${t}\``;
						});
    
						const rankPermissions = (() => {
							if(context.guild.ownerId == user.id) return `(${context.t('user_info:rankOwner')})`;
							else if(permissions.has('administrator')) return `(${context.t('user_info:rankAdminstrator')})`;
							else return '';
						})();

						const guildRoles = Object.fromEntries(context.guild.roles.map(role => [role.id, role]));
    
						const roles = member.roles.sort((a, b) => {
							return (guildRoles[b]?.position as number) - (guildRoles[a]?.position as number);
						});
    
						const embed = {
							color: Utils.displayColor(member, context.guild),
							fields: [
								{
									name: `<:Tools:853645102575910963> ${context.t('user_info:memberRoles', { size: roles.length })}`,
									value: `> ${(roles.slice(0, 40).map(roleID => `<@&${roleID}>`).join(', ') || context.t('user_info:memberNoRoles')) + (roles.length > 40 ? ` ${context.t('user_info:andMoreRoles', { size: roles.length - 40 })}` : '')}`,
								},
								{
									name: `:closed_lock_with_key: ${context.t('user_info:memberPermissions', { rankPermissions })}`,
									value: `> ${permissionsEmojis.length ? permissionsEmojis.join(', ') : context.t('user_info:memberNoPermissions')}`,
								},
							],
						} as APIEmbed;
    
						interaction.createMessage({ embeds: [embed], ephemeral: true });
						break;
					}
				}
			});
	}
}

export default UserInfoCommand;