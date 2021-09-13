const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const { ObjRef, message_modlogs } = require("../../../utils")

module.exports = class BanInfoSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "info",
            description: "Mostra as informações do banimento de um usuário banido no servidor.",
            dirname: __dirname,
            permissions: {
                Discord: ["BAN_MEMBERS"],
                Bot: ["LUNAR_BAN_MEMBERS"],
                Lunar: ["BAN_MEMBERS"]
            },
            dm: false
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const userRegex = `${ctx.interaction.options.getString("user")}`.replace(/<@!?(\d{18})>/, "$1")
        if(!/^\d{18}$|^.{0,32}#\d{4}$/.test(userRegex)) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("ban_info/user_not_banned", {
                    user: `${ctx.interaction.options.getString("user")}`
                }), ctx.author)
            ]
        }).catch(() => {})
        
        const bans = await ctx.guild.bans.fetch()

        const ban = bans.find(x => x.user.tag == userRegex || x.user.id == userRegex)
        if(!ban) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("ban_info/user_not_banned", {
                    user: `${ctx.interaction.options.getString("user")}`
                }), ctx.author)
            ]
        }).catch(() => {})
        const banReason = ban.reason || ctx.t("geral/reason_not_informed")

        const regex = new RegExp(`${this.client.langs.map(x => "^" + x.t("geral/punished_by", {
            author_tag: ".{0,32}#\\d{4}",
            id: "(.{8}-.{4}-.{4}-.{4}-.{10})",
            reason: "(.*?)"
        }) + "$").join("|")}`, 'i')
        
        const components = new Discord.MessageActionRow()
        .addComponents([
            new Discord.MessageButton()
            .setCustomId("unban")
            .setStyle("SUCCESS")
            .setLabel("Unban")
            .setEmoji("884988947271405608")
        ])

        const embed = new Discord.MessageEmbed()
        .setColor(13641511)
        .setTitle(`(:question:) - ${ctx.t("ban_info/embed/title")}`)
        .setDescription(`**- ${ctx.t("ban_info/embed/description/user_banned")}**\nㅤ${ban.user.toString()} (\`${ban.user.tag} - ${ban.user.id}\`)`)
        .addField(`${global.emojis.get("clipboard").mention} • ${ctx.t("geral/reason")}:`, `ㅤ${banReason}`)
        .setThumbnail(ban.user.displayAvatarURL({ format: "png", dynamic: true}))
        .setTimestamp()
        
        if(regex.test(banReason)) {
            const id = banReason.replace(regex, "$1")
            
            let logsdb = await ctx.client.LogsDB.ref().once("value")
            logsdb = logsdb.val() || {}
            const logs = new ObjRef(logsdb)

            let _log = logs.ref(id).val()
            if(_log) {
                _log = JSON.parse(Buffer.from(_log, 'base64').toString('ascii'))
                if(_log.type == 1 &&_log.user == ban.user.id && _log.server == ctx.guild.id && banReason.replace(regex, "$2") == decodeURI(_log.reason))  {
                    components.addComponents([
                        new Discord.MessageButton()
                        .setURL(`${this.client.config.links.website.baseURL}/dashboard/guilds/${ctx.guild.id}/modlogs?id=${id}/`)
                        .setLabel("Lunary logs(Beta)")
                        .setStyle("LINK")
                    ])
                    embed.fields = []
                    embed.addField(`${global.emojis.get("clipboard").mention} • ${ctx.t("geral/reason")}:`, `ㅤ${banReason.replace(regex, "$2")}`)
                }
            }
        }

        await ctx.interaction.reply({
            embeds: [embed],
            components: [components]
        })

        const msg = await ctx.interaction.fetchReply()

        const coletor = msg.createMessageComponentCollector({
            filter: c => c.customId == "unban" && c.user.id == ctx.author.id,
            max: 1,
            time: 1 * 1000 * 60
        })

        coletor.on("collect", 
        /**
         * @param {Discord.ButtonInteraction} button
         */
        async(button) => {
            await button.deferUpdate().catch(() => {})
            await ctx.guild.members.unban(ban.user.id, `${ctx.t("geral/requested_by")}: ${ctx.author.tag}`)
            
            if(ctx.GuildDB.configs.has("LOG_UNBAN")) {
                const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
                if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
                    embeds: [
                        message_modlogs(ctx.author, ban.user, ctx.t("geral/reason_not_informed"), "unban", ctx.t)
                    ]
                })
            }

            msg.reply({
                content: `:white_check_mark: ─ ${ctx.t("unban/remove_ban", {
                    author_mention: ctx.author.toString(),
                    user_tag: ban.user.tag,
                    user_id: ban.user.id
                })}`
            })
        })

        coletor.on("end", async() => {
            components.components.find(x => x.customId == "unban").setDisabled()

            msg.edit({
                embeds: [embed],
                components: [components]
            })
        })
        
    }
}