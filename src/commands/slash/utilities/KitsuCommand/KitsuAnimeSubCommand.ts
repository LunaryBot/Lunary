import { Command, SubCommand } from '@Command';
import { CommandContext } from '@Contexts';

import { ComponentType, APIEmbed } from '@discord/types';
import { ComponentInteraction, SelectMenuInteraction } from '@libs/discord';

import { ComponentCollector } from '@utils/Collectors';
import { Colors, BadgesEmojis } from '@utils/Constants';

import { KitsuAnimeData } from '../../../../@types/Kitsu.d';
import { APIBaseSelectMenuComponent } from 'discord-api-types/v10';

class KitsuAnimeSubCommand extends SubCommand {
	constructor(client: LunaryClient, parent: Command) {
		super(client, {
			name: 'anime',
			dirname: __dirname,
		}, parent);
	}

	public async run(context: CommandContext) {
		const search = context.options.get('query') as string;

		const results = (await this.client.apis.kitsu.searchAnime(search))?.slice(0, 25);

		if(results.length == 1)
			return context
				.createMessage(createEmbed(results[0] as any));

		const menu = {
			type: 3,
			custom_id: `${context.interaction.id}-searchAnime`,
			options: results.map((anime: any, i) => ({
				label: `${`${anime.attributes.canonicalTitle}`.shorten(100)}`,
				value: `${i}`,
			})),
			placeholder: context.t('kitsu_anime:menuLabel'),
			max_values: 1,
			min_values: 1,
		} as APIBaseSelectMenuComponent<ComponentType.StringSelect>;

		await context.createMessage({
			content: `<:Kitsu:854675062498000896> | ${context.t('kitsu_anime:chooseAnime', { search: search.shorten(300) })}`,
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

		function createEmbed(data: { attributes: KitsuAnimeData, id: string }) {
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
				description: `> :bookmark: **| ${context.t('kitsu_anime:ID')}:** \`${data.id}\`
                > <:VideoPlayer:854889422927560754> **| ${context.t('kitsu_anime:episodes')}:** \`${data.attributes.episodeCount ? data.attributes.episodeCount : context.t('kitsu_anime:notFound')}\`
                > :alarm_clock: **| ${context.t('kitsu_anime:episodeMinutes')}:** \`${
					data.attributes.episodeLength
						? context.t('kitsu_anime:episodeLength', {
							minutes: data.attributes.episodeLength,
						})
						: context.t('kitsu_anime:notFound')
				}\`
                
                > :calendar: **| ${context.t('kitsu_anime:startedIn')}:** <t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) / 1000.0)}> (<t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) / 1000.0)}:R>)
                > :calendar_spiral: **| ${context.t('kitsu_anime:endedIn')}:** ${data.attributes.endDate ? `<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) / 1000.0)}> (<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) / 1000.0)}:R>)` : context.t('kitsu_anime:noEned')}
                
                > :medal: **| ${context.t('kitsu_anime:popularityRank')}:** \`#${data.attributes.popularityRank}°\`
                > :medal: **| ${context.t('kitsu_anime:ratingRank')}:** \`#${data.attributes.ratingRank}°\`
                > :star: **| ${context.t('kitsu_anime:ratingAverage')}:** \`${data.attributes.averageRating}%\``,
				fields: [
					{
						name: `> :bookmark_tabs: ${context.t('kitsu_anime:description')}:`,
						value: `>>> \`\`\`${data.attributes.description ? `${data.attributes.description}`.shorten(300) : context.t('kitsu_anime:noDescription')}\`\`\``,
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

export default KitsuAnimeSubCommand;