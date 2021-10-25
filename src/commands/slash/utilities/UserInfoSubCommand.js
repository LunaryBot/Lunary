const SubCommand = require(__dirname + "/../../../structures/SubCommand.js")
const ContextCommand = require(__dirname + "/../../../structures/ContextCommand.js")
const Discord = require(__dirname + "/../../../lib")

module.exports = class UserInfoSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "info",
            dirname: __dirname
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const user = ctx.interaction.options.getUser("user") || ctx.author

        if(!user) return await ctx.interaction.reply({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getUser("user")?.id })
        }).catch(() => {})

        const avatar = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 });
        const base_embed = new Discord.MessageEmbed()
        .setAuthor(user.username, `https://cdn.discordapp.com/emojis/${this.client.config.devs.includes(user.id) ? "844347009543569449" : "832083303627620422"}.png?size=128`)
        .setColor(this.client.config.devs.includes(user.id) ? "#FFFAFA" : "#A020F0")
        .setThumbnail(avatar)
        const badges = user.flags.toArray().filter(x => x != "VERIFIED_BOT").map(flag => global.emojis.get(flag).mention).join(" ")

        const embed_main = new Discord.MessageEmbed(base_embed.toJSON())
        .addField(`:bookmark: ${ctx.t("user_info:texts.userTagDiscord")}`, `\`${user.tag}\``, true)
        .addField(`:computer: ${ctx.t("user_info:texts.userIdDiscord")}`, `\`${user.id}\``, true)
        .addField(`:calendar_spiral: ${ctx.t("user_info:texts.userCreatedTimestamp")}`, `<t:${Math.floor((user.createdTimestamp + 3600000) /1000.0)}> (<t:${Math.floor((user.createdTimestamp + 3600000) /1000.0)}:R>)`)
        
        if(badges) embed_main.setDescription(`> ${badges}`)

        const member = user.id == ctx.author.id ? ctx.member : ctx.interaction.options.getMember("user")
        if(!member) return ctx.interaction.reply({
            embeds: [embed_main]
        }).catch(() => {})

        embed_main.addField(`:star2: ${ctx.t("user_info:texts.memberJoinedTimestamp")}`, `<t:${Math.floor((member.joinedTimestamp + 3600000) /1000.0)}> (<t:${Math.floor((member.joinedTimestamp + 3600000) /1000.0)}:R>)`)
        if(member.premiumSinceTimestamp) embed_main.addField(`<:booster:892131133800742973> ${ctx.t("user_info:texts.memberPremiumSinceTimestamp")}`, `<t:${Math.floor((member.premiumSinceTimestamp + 3600000) /1000.0)}> (<t:${Math.floor((member.premiumSinceTimestamp + 3600000) /1000.0)}:R>)`)
        let secondy_embed = null
        
        const comp_back = new Discord.MessageActionRow()
        .addComponents([
            new Discord.MessageButton()
            .setCustomId("back")
            .setStyle("SECONDARY")
            .setEmoji("858168570055491604")
        ])

        const comp_next = new Discord.MessageActionRow()
        .addComponents([
            new Discord.MessageButton()
            .setCustomId("next")
            .setStyle("SECONDARY")
            .setEmoji("858168497950818324")
        ])

        ctx.interaction.reply({
            embeds: [embed_main],
            components: [comp_next]
        }).catch(() => {})

        const msg = await ctx.interaction.fetchReply()

        const collector = msg.createMessageComponentCollector({
            filter: comp => ["next", "back"].includes(comp.customId) && comp.user.id == ctx.author.id,
            time: 1 * 1000 * 60
        })

        collector.on("collect", 
        /**
         * @param {Discord.ButtonInteraction} button 
         */
        async button => {
            await button.deferUpdate().catch(() => {})
            switch (button.customId) {
                case "next":
                    if(secondy_embed == null) {
                        let roles = member.roles.cache.filter(x => x.id != ctx.guild.id)

                        roles = roles.sort(function(a, b) {
                            return b.position - a.position
                        }).map(x => x.name)

                        secondy_embed = new Discord.MessageEmbed(base_embed.toJSON())
                        .addField(`<:Tools:853645102575910963> ${ctx.t("user_info:texts.memberRoles", {
                            size: roles.length
                        })}`, `> ${(roles.length == 0) ? "\`🤷‍♀️ Esse membro não possui cargos...\`" : `${(roles.length > 40) ? `${roles.slice(0, 40).map(x => `\`${(x.length > 47) ? x.slice(0, 44) + "..." : x }\``).join(", ")} e mais ${roles.length - 40} cargo${(roles.length - 40 == 1) ? "" : "s"}` : roles.map(x => `\`${(x.length > 47) ? x.slice(0, 44) + "..." : x }\``).join(", ")}`}`)
                        .addField(`:closed_lock_with_key: ${ctx.t("user_info:texts.memberPermissions", {
                            rank_permissions: (() => {
                                if(ctx.guild.ownerId == user.id) return `(${ctx.t("user_info:texts.rank_owner")})`
                                else if(member.permissions.has(8n)) return `(${ctx.t("user_info:texts.rank_adminstrator")})`
                                else return null
                            })()
                        })}`, "> " + member.permissions.toArray().map((x) => `\`${ctx.t(`permissions:${x}`)}\``).join(", ") || "🙅‍♀️ Esse membro não possui permissões...")
                    }
                    msg.edit({
                        embeds: [secondy_embed],
                        components: [comp_back]
                    }).catch(() => {})
                break;

                case "back":
                    msg.edit({
                        embeds: [embed_main],
                        components: [comp_next]
                    }).catch(() => {})
                break;
            }
        })
    }
}