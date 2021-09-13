const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const { version } = require("../../../../package.json")

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super({
            name: "help",
            description: "Meu comando de ajuda.",
            category: "bot",
            dirname: __dirname,
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const Bae = await this.client.users.fetch("452618703792766987")
        const invite = this.client.generateOauth2({
            permissions: 8n,
            redirect: `${this.client.config.links.website.callback}`,
            scopes: ["bot", "applications.commands", "guilds", "identify"],
        })

        const embed = new Discord.MessageEmbed()
        .setColor("#A020F0")
        .setAuthor(`${ctx.t("help/title")} • ${version}`, this.client.user.avatarURL({ dynamic: true, format: "png", size: 1024 }), this.client.config.links.website.home)
        .setDescription(`<:YaY:835190406899695697> **|** ${ctx.t("help/description", { author: ctx.author.toString() })}`)
        .addField(`:clipboard: ${ctx.t("help/links/commands")}`, `> ${this.client.config.links.website.commands}`)
        .addField(`<:Duvida:835272427516461146> ${ctx.t("help/links/support")}`, `> ${this.client.config.links.website.support}`)
        .addField(`:love_letter: ${ctx.t("help/links/add")}`, `> [${this.client.config.links.website.invite}](${invite})`)
        .addField(`:envelope_with_arrow: ${ctx.t("help/links/vote")}`, `> ${this.client.config.links.website.vote}`)
        .addField(`:gear: ${ctx.t("help/links/dashboard")}`, `> ${this.client.config.links.website.dashboard.me}`)
        .setFooter(`• ${ctx.t("help/created_by")} ${Bae.tag}`, Bae.avatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setThumbnail("https://imgur.com/iacDuXp.png")

        const components = new Discord.MessageActionRow()
        .addComponents([
            new Discord.MessageButton()
            .setStyle("LINK")
            .setURL(invite)
            .setLabel(ctx.t("help/buttons/invite_me")),
            new Discord.MessageButton()
            .setStyle("LINK")
            .setURL(this.client.config.links.support)
            .setLabel(ctx.t("help/buttons/support")),
            new Discord.MessageButton()
            .setStyle("LINK")
            .setURL(this.client.config.links.website.home)
            .setLabel(ctx.t("help/buttons/website"))
        ])

        await ctx.interaction.reply({
            embeds: [embed],
            components: [components]
        })
    }
}