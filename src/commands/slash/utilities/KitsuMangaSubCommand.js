const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const { searchManga } = require("node-kitsu")

module.exports = class KitsuMangaSubCommand extends SubCommand {
    constructor(client) {
        super({
            name: "manga",
            dirname: __dirname
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        ctx.interaction.deferReply().catch(() => {})
        const search = ctx.interaction.options.getString("query")

        const results = (await searchManga(search, 0))?.slice(0, 25)

        if(results.length == 1) return ctx.interaction.followUp({
            embeds: [createEmbed(results[0])]
        }).catch(() => {})
        
        const menu = new Discord.MessageSelectMenu()
        .addOptions(results.map(function(manga, i) {
            return {
                label: `${`${manga.attributes.canonicalTitle}`.shorten(100)}`,
                value: `${i}`
            }
        }))
        .setCustomId("search_manga")
        .setPlaceholder(ctx.t("kitsu_manga:texts.menuLabel"))
        .setMinValues(1)
        .setMaxValues(1)

        ctx.interaction.followUp({
            content: `<:Kitsu:854675062498000896> | ${ctx.t("kitsu_manga:texts.chooseManga", { search: search.shorten(300) })}`,
            components: [new Discord.MessageActionRow().addComponents([menu])]
        }).catch(() => {})

        const msg = await ctx.interaction.fetchReply()

        const coletor = msg.createMessageComponentCollector({
            filter: (comp) => comp.user.id == ctx.author.id,
            max: 1,
            time: 1 * 1000 * 60
        })

        coletor.on("collect", 
        /**
         * @param {Discord.SelectMenuInteraction} menu
         */
        async menu => {
            menu.deferUpdate().catch(() => {})
            msg.edit(createEmbed(results[Number(menu.values[0])])).catch(() => {})
        })

        function createEmbed(data) {
            const embed = new Discord.MessageEmbed()
            .setColor("#f95037")
            .setAuthor("Kitsu", "https://cdn.discordapp.com/emojis/854675062498000896.png?v=1", "https://kitsu.io/")
            .setTitle(data.attributes.canonicalTitle)
            .setURL(`https://kitsu.io/manga/` + data.attributes.slug)
            .setThumbnail(data.attributes.posterImage.original)
            .setDescription(`> :bookmark: **| ${ctx.t("kitsu_manga:texts.ID")}:** \`${data.id}\`
            > :books: **| ${ctx.t("kitsu_manga:texts.volumes")}:** \`${data.attributes.volumeCount ? data.attributes.volumeCount : ctx.t("kitsu_manga:texts.notFound")}\`
            > :bookmark_tabs: **| ${ctx.t("kitsu_manga:texts.chapters")}:** \`${data.attributes.chapterCount ? data.attributes.chapterCount : ctx.t("kitsu_manga:texts.notFound")}\`
            
            > :calendar: **| ${ctx.t("kitsu_manga:texts.startedIn")}:** <t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) /1000.0)}> (<t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) /1000.0)}:R>)
            > :calendar_spiral: **| ${ctx.t("kitsu_manga:texts.endedIn")}:** ${data.attributes.endDate ? `<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) /1000.0)}> (<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) /1000.0)}:R>)` : `\`${ctx.t("kitsu_manga:texts.noEned")}\``}
            
            > :medal: **| ${ctx.t("kitsu_manga:texts.popularityRank")}** \`#${data.attributes.popularityRank}°\`
            > :medal: **| ${ctx.t("kitsu_manga:texts.ratingRank")}:** \`#${data.attributes.ratingRank}°\`
            > :star: **| ${ctx.t("kitsu_manga:texts.ratingAverage")}** \`${data.attributes.averageRating}%\``)
            .addField(`> :bookmark_tabs: ${ctx.t("kitsu_manga:texts.description")}:`, `>>> \`\`\`${data.attributes.description ?  `${data.attributes.description}`.shorten(300) : ctx.t("kitsu_manga:texts.noDescription")}\`\`\``)

            return {
                content: null,
                embeds: [embed],
                components: []
            }
        }
    }
}