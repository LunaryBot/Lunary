const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

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

        const regex = new RegExp(`${this.client.langs.map(x => x.t("geral/punished_by", {
            author_tag: ".{0,32}#\\d{4}",
            id: "(.{8}-.{4}-.{4}-.{4}-.{10})",
            reason: "(.*?)"
        })).join("|")}`, 'i')

        const components = new Discord.MessageActionRow()
        .addComponents([
            new Discord.MessageButton()
            .setCustomId("unban")
            .setStyle("SUCCESS")
            .setLabel("Unban")
            .setEmoji("884988947271405608")
        ])
        
        await ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setColor(13641511)
                .setTitle(`(:question:) - ${ctx.t("ban_info/embed/title")}`)
                .setDescription(`**- ${ctx.t("ban_info/embed/user_banned")}**\nㅤ${ban.user.toString()} (\`${ban.user.tag} - ${ban.user.id}\`)`)
                .addField(`${global.emojis.get("clipboard").mention} • ${ctx.t("geral/reason")}:`, `ㅤ${ban.reason}`)
                .setTimestamp()
            ],
            components: [components]
        })
    }
}