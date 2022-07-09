import Eris from 'eris';
import { KitsuMangaData } from '../../../../@types/Kitsu';

import Command, { SubCommand, IContextInteractionCommand, LunarClient, CommandGroup } from '../../../../structures/Command';

import InteractionCollector from '../../../../utils/collector/Interaction';
import { Colors, BadgesEmojis } from '../../../../utils/Constants';
import Kitsu from '../../../../utils/Kitsu';

class KitsuMangaSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'manga',
            dirname: __dirname,
        }, parent);
    }

    public async run(context: IContextInteractionCommand): Promise<any> {
        await context.interaction.acknowledge();
		const search = context.options.get('query') as string;

		const results = (await Kitsu.searchManga(search))?.slice(0, 25) as Array<any>;

		if(results.length == 1)
			return context.interaction
				.createFollowup(createEmbed(results[0]));

		const menu = {
            type: 3,
            custom_id: `${context.interaction.id}-searchManga`,
            options: results.map((anime: any, i) => ({
                label: `${`${anime.attributes.canonicalTitle}`.shorten(100)}`,
                value: `${i}`,
            })),
            placeholder: context.t('kitsu_manga:menuLabel'),
            max_values: 1,
            min_values: 1,
        } as Eris.SelectMenu;

		context.interaction.createFollowup({
			content: `<:Kitsu:854675062498000896> | ${context.t('kitsu_manga:chooseManga', { search: search.shorten(300) })}`,
			components: [{
                type: 1,
                components: [menu],
            }],
		});

        const collector = new InteractionCollector(this.client, {
            max: 1,
            user: context.user,
            time: 1 * 1000 * 60,
            filter: (interaction: Eris.ComponentInteraction) => interaction.data?.custom_id?.startsWith(`${context.interaction.id}-`),
        });

        collector.on('collect', (interaction: Eris.ComponentInteraction) => {
            interaction.editParent(createEmbed(results[Number((interaction.data as Eris.ComponentInteractionSelectMenuData).values[0])]));
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
                url: `https://kitsu.io/anime/` + data.attributes.slug,
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
            } as Eris.Embed;

			return {
				content: '',
				embeds: [embed],
				components: [] as Array<Eris.ActionRow>,
			};
		}
    }
}

export default KitsuMangaSubCommand;