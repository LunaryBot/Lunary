import { ComponentCollector } from '@Collectors';
import Prisma from '@prisma/client';

import { Command } from '@Command';
import type { CommandContext } from '@Contexts';

import { ComponentInteraction, User } from '@discord';

import chunk from '@utils/Chunk';
import { Colors } from '@utils/Constants';
import { ModUtils } from '@utils/ModUtils';

import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent, APIUser, ButtonStyle } from 'discord-api-types/v10';

class AdvListSubCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'Adv List',
			requirements: {
				permissions: {
					discord: ['viewAuditLog'],
					lunary: ['lunarViewHistory'],
				},
				database: {
					guild: true,
					reasons: true,
				},
				guildOnly: true,
			},
			dirname: __dirname,
		});
	}

	public async run(context: CommandContext) {
		const user: User = context.options.get('user') || context.user;
        
		const advs = await this.client.prisma.punishment.findMany({
			where: {
				guild_id: context.guildId,
				user_id: user.id,
				deleted: false,
				type: Prisma.PunishmentType.ADV,
			},
			orderBy: {
				created_at: 'desc',
			},
		});

		if(!advs?.length) {
			return context.createMessage({
				content: context.t('adv_list:noWarnings'),
			});
		}

		const chunks = chunk(advs, 3) as Array<typeof advs>;
		let index = 0;

		const components = [] as APIActionRowComponent<APIMessageActionRowComponent>[];

		const embed: APIEmbed = {
			color: Colors.YELLOW,
			thumbnail: {
				url: user.displayAvatarURL({ format: 'png', size: 2048 }),
			},
			description: `**${context.t('adv_list:hasAdvs', { user: user.toString(), size: advs.length })}**\n\n`,
		};

		const chunkPage = async(_index = 0) => {
			const currentChunk = chunks[_index];

			const fields = [];
            
			for(const i in currentChunk) {
				const adv = currentChunk[i];

				const reason = adv.reason_id
					? await this.client.prisma.reason.findUnique({
						where: {
							id: adv.reason_id,
						},
					}).then(reason => reason?.text)
					: adv.reason;

				const humanId = ModUtils.formatHumanPunishmentId(adv.id);

				const urlQuery = new URLSearchParams();

				urlQuery.append('guild_id', context.guildId as string);
				urlQuery.append('id', humanId);

				fields.push(`**[\`#${humanId}\`](https://l.luny.fun/punishments?${urlQuery.toString()}) | ${context.t('adv_list:author')}:** <@${adv.author_id}>
                \`\`\`${reason || context.t('general:reasonNotInformed.defaultReason')}\`\`\`**└**<t:${Math.floor((adv.created_at.getTime() + 3600000) / 1000.0)}>`);
			}

			components.length = 0;

			components.push({
				type: 1,
				components: [
					{
						type: 2,
						custom_id: `${context.interaction.id}-back`,
						style: ButtonStyle.Secondary,
						emoji: { id: '905602424495026206' },
						disabled: !_index,
					},
					{
						type: 2,
						custom_id: 'pagination',
						style: ButtonStyle.Secondary,
						emoji: { id: '981611440559501383' },
						label: `${_index + 1}/${chunks.length}`,
						disabled: true,
					},
					{
						type: 2,
						custom_id: `${context.interaction.id}-next`,
						style: ButtonStyle.Secondary,
						emoji: { id: '905602508037181451' },
						disabled: !chunks[_index + 1]?.length,
					},
				],
			});

			return { 
				embeds: [{ 
					...embed,
					description: embed.description + fields.join('\n\n'),
				}],
				components,
			};
		};

		await context.createMessage(await chunkPage(index));

		const collector = new ComponentCollector(this.client, {
			time: 1 * 60 * 1000,
			user: context.user,
			filter: (interaction: ComponentInteraction) => interaction.customId?.startsWith(`${context.interaction.id}-`),
		});

		collector
			.on('collect', async(interaction: ComponentInteraction) => {
				const id = interaction.customId.split('-')[1];

				switch (id) {
					case 'back': {
						if(index <= 0) index = chunk.length;
						else index--;
						break;
					}

					case 'next': {
						if(index > chunk.length) index = 0;
						else index++;
						break;
					}
				}

				await interaction.editParent(await chunkPage(index));
			});
	}
}

export default AdvListSubCommand;