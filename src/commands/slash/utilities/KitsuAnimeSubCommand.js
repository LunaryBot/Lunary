const SubCommand = require('../../../structures/SubCommand.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const { searchAnime } = require('node-kitsu');

module.exports = class KitsuAnimeSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: 'anime',
				dirname: __dirname,
			},
			mainCommand,
			client,
		);
	}

	/**
	 * @param {ContextCommand} ctx
	 */

	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});
		const search = ctx.interaction.options.getString('query');

		const results = (await searchAnime(search, 0))?.slice(0, 25);

		if (results.length == 1)
			return ctx.interaction
				.followUp({
					embeds: [createEmbed(results[0])],
				})
				.catch(() => {});

		const menu = new Discord.MessageSelectMenu()
			.addOptions(
				results.map(function (anime, i) {
					return {
						label: `${`${anime.attributes.canonicalTitle}`.shorten(100)}`,
						value: `${i}`,
					};
				}),
			)
			.setCustomId('search_anime')
			.setPlaceholder(ctx.t('kitsu_anime:texts.menuLabel'))
			.setMinValues(1)
			.setMaxValues(1);

		ctx.interaction
			.followUp({
				content: `<:Kitsu:854675062498000896> | ${ctx.t('kitsu_anime:texts.chooseAnime', { search: search.shorten(300) })}`,
				components: [new Discord.MessageActionRow().addComponents([menu])],
			})
			.catch(() => {});

		const msg = await ctx.interaction.fetchReply();

		/**
		 * @type {Discord.SelectMenuInteraction}
		 */
		 const response = await msg.awaitMessageComponent({
			componentType: 'SELECT_MENU',
			filter: comp => {
				comp.deferUpdate();
				return comp.user.id == ctx.author.id
			},
			time: 1 * 1000 * 60,
		})
		.catch(() => {
			ctx.interaction.editReply({
				components: [new Discord.MessageActionRow().addComponents(menu.setDisabled(true).setPlaceholder(ctx.t('general:timeForSelectionEsgotated')))],
			});
		});

		msg.edit(createEmbed(results[Number(response.values[0])])).catch(() => {});

		function createEmbed(data) {
			const embed = new Discord.MessageEmbed()
				.setColor('#f95037')
				.setAuthor('Kitsu', 'https://cdn.discordapp.com/emojis/854675062498000896.png?v=1', 'https://kitsu.io/')
				.setTitle(data.attributes.canonicalTitle)
				.setURL(`https://kitsu.io/anime/` + data.attributes.slug)
				.setThumbnail(data.attributes.posterImage.original)
				.setDescription(
					`> :bookmark: **| ${ctx.t('kitsu_anime:texts.ID')}:** \`${data.id}\`
            > :books: **| ${ctx.t('kitsu_anime:texts.volumes')}:** \`${data.attributes.volumeCount ? data.attributes.volumeCount : ctx.t('kitsu_anime:texts.notFound')}\`
            > <:VideoPlayer:854889422927560754> **| ${ctx.t('kitsu_anime:texts.episodes')}:** \`${data.attributes.episodeCount ? data.attributes.episodeCount : ctx.t('kitsu_anime:texts.notFound')}\`
            > :alarm_clock: **| ${ctx.t('kitsu_anime:texts.episodeMinutes')}:** \`${
						data.attributes.episodeLength
							? ctx.t('kitsu_anime:texts.episodeLength', {
									minutes: data.attributes.episodeLength,
							  })
							: ctx.t('kitsu_anime:texts.notFound')
					}\`
            
            > :calendar: **| ${ctx.t('kitsu_anime:texts.startedIn')}:** <t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) / 1000.0)}> (<t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) / 1000.0)}:R>)
            > :calendar_spiral: **| ${ctx.t('kitsu_anime:texts.endedIn')}:** ${data.attributes.endDate ? `<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) / 1000.0)}> (<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) / 1000.0)}:R>)` : ctx.t('kitsu_anime:texts.noEned')}
            
            > :medal: **| ${ctx.t('kitsu_anime:texts.popularityRank')}:** \`#${data.attributes.popularityRank}°\`
            > :medal: **| ${ctx.t('kitsu_anime:texts.ratingRank')}:** \`#${data.attributes.ratingRank}°\`
            > :star: **| ${ctx.t('kitsu_anime:texts.ratingAverage')}:** \`${data.attributes.averageRating}%\``,
				)
				.addField(`> :bookmark_tabs: ${ctx.t('kitsu_anime:texts.description')}:`, `>>> \`\`\`${data.attributes.description ? `${data.attributes.description}`.shorten(300) : ctx.t('kitsu_anime:texts.noDescription')}\`\`\``);

			return {
				content: null,
				embeds: [embed],
				components: [],
			};
		}
	}
};
