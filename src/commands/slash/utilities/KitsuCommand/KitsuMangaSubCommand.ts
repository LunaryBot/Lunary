import { Command, SubCommand } from '@Command';
import { CommandContext } from '@Contexts';

import { ComponentType, APIEmbed } from '@discord/types';
import { ComponentInteraction, SelectMenuInteraction } from '@libs/discord';

import { ComponentCollector } from '@utils/Collectors';
import { Colors, BadgesEmojis } from '@utils/Constants';

import { KitsuMangaData } from '../../../../@types/Kitsu';
import { APIBaseSelectMenuComponent } from 'discord-api-types/v10';

class KitsuMangaSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'manga',
			dirname: __dirname,
		}, parent);
	}

	public async run(context: CommandContext) {
		await context.interaction.acknowledge();
		const search = context.options.get('query') as string;

		const results = (await this.client.apis.kitsu.searchManga(search))?.slice(0, 25);

		if(results.length == 1)
			return context
				.createMessage(createEmbed(results[0] as any));

		const menu = {
			type: 3,
			custom_id: `${context.interaction.id}-searchManga`,
			options: results.map((manga: any, i) => ({
				label: `${`${manga.attributes.canonicalTitle}`.shorten(100)}`,
				value: `${i}`,
			})),
			placeholder: context.t('kitsu_manga:menuLabel'),
			max_values: 1,
			min_values: 1,
		} as APIBaseSelectMenuComponent<ComponentType.StringSelect>;

		await context.createMessage({
			content: `<:Kitsu:854675062498000896> | ${context.t('kitsu_manga:chooseManga', { search: search.shorten(300) })}`,
			components: [{
				type: 1,
				components: [menu as any],
			}],
		});

		const collector = new ComponentCollector(this.client, {
			max: 1,
			user: context.user,
			time: 1 * 1000 * 60,
			filter: (interaction: ComponentInteraction) => (interaction.data as any)?.custom_id?.startsWith(`${context.interaction.id}-`),
		});

		collector.on('collect', async(interaction: ComponentInteraction) => {
			await interaction.editParent(createEmbed(results[Number((interaction as SelectMenuInteraction).values[0])] as any));
		});

		function createEmbed(data: { attributes: KitsuMangaData, id: string }) {
			const embed = {
				color: 16338999,
				author: {
					name: 'Kitsu',
					icon_url: 'https://cdn.discordapp.com/emojis/854675062498000896.png?v=1',
					url: 'https://kitsu.io/',
				},
				title: data.attributes.canonicalTitle,
				url: 'https://kitsu.io/anime/' + data.attributes.slug,
				thumbnail: {
					url: data.attributes.posterImage.original,
				},
				description: `> :bookmark: **| ${context.t('kitsu_manga:ID')}:** \`${data.id}\`
                > :books: **| ${context.t('kitsu_manga:volumes')}:** \`${data.attributes.volumeCount ? data.attributes.volumeCount : context.t('kitsu_manga:notFound')}\`
                > :bookmark_tabs: **| ${context.t('kitsu_manga:chapters')}:** \`${data.attributes.chapterCount ? data.attributes.chapterCount : context.t('kitsu_manga:notFound')}\`
                
                > :calendar: **| ${context.t('kitsu_manga:startedIn')}:** <t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) / 1000.0)}> (<t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) / 1000.0)}:R>)
                > :calendar_spiral: **| ${context.t('kitsu_manga:endedIn')}:** ${data.attributes.endDate ? `<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) / 1000.0)}> (<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) / 1000.0)}:R>)` : context.t('kitsu_manga:noEned')}
                
                > :medal: **| ${context.t('kitsu_manga:popularityRank')}:** \`#${data.attributes.popularityRank}°\`
                > :medal: **| ${context.t('kitsu_manga:ratingRank')}:** \`#${data.attributes.ratingRank}°\`
                > :star: **| ${context.t('kitsu_manga:ratingAverage')}:** \`${data.attributes.averageRating}%\``,
				fields: [
					{
						name: `> :bookmark_tabs: ${context.t('kitsu_manga:description')}:`,
						value: `>>> \`\`\`${data.attributes.description ? `${data.attributes.description}`.shorten(300) : context.t('kitsu_manga:noDescription')}\`\`\``,
					},
				],
			} as APIEmbed;

			return {
				content: '',
				embeds: [embed],
				components: [],
			};
		}
	}
}

export default KitsuMangaSubCommand;