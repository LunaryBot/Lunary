import { SubCommand, Command } from '@Command';
import { CommandContext } from '@Contexts';

import { ComponentInteraction, Member, User } from '@discord';
import { APIMessageActionRowComponent, APIActionRowComponent } from '@discord/types';

import { ComponentCollector } from '@Collectors';
import { Colors } from '@utils/Constants';

import { ButtonStyle } from 'discord-api-types/v10';

const imageSizes = [128, 256, 512, 1024, 2048];

class UserAvatarCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'avatar',
			dirname: __dirname,
		}, parent);
	}

	public async run(context: CommandContext): Promise<any> {
		const user: User = context.options.get('user') || context.user;

		const avatar = user.displayAvatarURL({ format: 'png', dynamic: true });

		const member: Member = user.id == context.user.id ? context.member : context.options.get('user', { member: true });
        
		const globalComponents = [
			{
				url: avatar + '?size=2048',
				style: ButtonStyle.Link,
				label: context.t('user_avatar:downloadImage'),
				type: 2,
			},
		] as APIMessageActionRowComponent[];

		const globalMessage = {
			embeds: [
				{
					color: Colors.MAIN,
					title: context.t('user_avatar:title', {
						username: user.username,
					}),
					description: imageSizes.map(asl).join(' | '),
					image: {
						url: avatar + '?size=2048',
					},
				},
			],
			components: [
				{
					type: 1,
					components: globalComponents,
				},
			],
		};

		if(!member || !member.avatar) return context.interaction.createMessage({ ...globalMessage });

		const guildAvatar = member.displayAvatarURL({ format: 'png', dynamic: true });

		globalComponents.push({
			custom_id: `${context.interaction.id}-guildAvatar`,
			style: ButtonStyle.Secondary,
			label: context.t('user_avatar:guildAvatar'),
			emoji: { id: '899822412043010088' },
			type: 2,
		});

		await context.interaction.createMessage({ ...globalMessage });

		const guildComponents = [
			{
				url: guildAvatar + '?size=2048',
				style: ButtonStyle.Link,
				label: context.t('user_avatar:downloadImage'),
				type: 2,
			},
			{
				custom_id: `${context.interaction.id}-globalAvatar`,
				style: ButtonStyle.Secondary,
				label: context.t('user_avatar:globalAvatar'),
				emoji: { id: '899822412043010088' },
				type: 2,
			},
		] as APIMessageActionRowComponent[];
        
		const guildMessage = {
			embeds: [
				{
					color: Colors.MAIN,
					title: context.t('user_avatar:title', {
						username: user.username,
					}),
					description: imageSizes.map(aslGuild).join(' | '),
					image: {
						url: guildAvatar + '?size=2048',
					},
				},
			],
			components: [
				{
					type: 1,
					components: guildComponents,
				},
			],
		};

		const collector = new ComponentCollector(this.client, {
			time: 1 * 60 * 1000,
			user: context.user,
			filter: (interaction) => interaction.customId?.startsWith(`${context.interaction.id}-`),
		});

		collector
			.on('collect', async(interaction: ComponentInteraction) => {
				const id = interaction.customId.split('-')[1];

				switch (id) {
					case 'guildAvatar': {
						interaction.editParent(guildMessage);

						break;
					}

					case 'globalAvatar': {
						interaction.editParent(globalMessage);

						break;
					}
				}
			});

		function asl(size: number) {
			return `[x${size}](${avatar}?size=${size})`;
		}

		function aslGuild(size: number) {
			return `[x${size}](${guildAvatar}?size=${size})`;
		}
	}
}

export default UserAvatarCommand;