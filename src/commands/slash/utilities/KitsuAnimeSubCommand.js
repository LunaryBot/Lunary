const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const { searchAnime } = require("node-kitsu")

module.exports = class KitsuAnimeSubCommand extends SubCommand {
    constructor(client) {
        super({
            name: "anime",
            dirname: __dirname
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        ctx.interaction.deferReply().catch(() => {})
        const search = ctx.interaction.options.getString("query")

        const results = (await searchAnime(search, 0))?.slice(0, 25)

        if(results.length == 1) return ctx.interaction.followUp({
            embeds: [createEmbed(results[0])]
        }).catch(() => {})
        
        const menu = new Discord.MessageSelectMenu()
        .addOptions(results.map(function(anime, i) {
            return {
                label: `${`${anime.attributes.canonicalTitle}`.shorten(100)}`,
                value: `${i}`
            }
        }))
        .setCustomId("search_anime")
        .setPlaceholder("Escolha o anime.")
        .setMinValues(1)
        .setMaxValues(1)

        ctx.interaction.followUp({
            content: `<:Kitsu:854675062498000896> | Selecione alguns do resultados encontrados sobre: "\`${search.shorten(300)}\`"`,
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
            .setURL(`https://kitsu.io/anime/` + data.attributes.slug)
            .setThumbnail(data.attributes.posterImage.original)
            .setDescription(`> :bookmark: **| ID:** \`${data.id}\`
            > :books: **| Volumes:** \`${data.attributes.volumeCount ? data.attributes.volumeCount : "Não encontrado."}\`
            > <:VideoPlayer:854889422927560754> **| Episódios:** \`${data.attributes.episodeCount ? data.attributes.episodeCount : "Não encontrado."}\`
            > :alarm_clock: **| Média de cada episódio:** \`${data.attributes.episodeLength ? data.attributes.episodeLength + " Minutos" : "Não encontrado."}\`
            
            > :calendar: **| Iniciado em:** <t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) /1000.0)}> (<t:${Math.floor((new Date(data.attributes.createdAt).getTime() + 3600000) /1000.0)}:R>)
            > :calendar_spiral: **| Finalizado em:** ${data.attributes.endDate ? `<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) /1000.0)}> (<t:${Math.floor((new Date(data.attributes.endDate).getTime() + 3600000) /1000.0)}:R>)` : "Não finalizado."}
            
            > :medal: **| Rank de popularidade:** \`#${data.attributes.popularityRank}°\`\n> :medal: **| Rank de valiações:** \`#${data.attributes.ratingRank}°\`
            > :star: **| Média de classificação:** \`${data.attributes.averageRating}%\``)
            .addField(`> :bookmark_tabs: Descrição:`, `>>> \`\`\`${data.attributes.description ?  `${data.attributes.description}`.shorten(300) : "Sem descrição"}\`\`\``)

            return {
                content: null,
                embeds: [embed],
                components: []
            }
        }
    }
}