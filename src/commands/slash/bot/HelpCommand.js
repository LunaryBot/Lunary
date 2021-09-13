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

        const embed = new Discord.MessageEmbed()
        .setColor("#A020F0")
        .setAuthor(`Lunary ajuda • ${version}`, this.client.user.avatarURL({ dynamic: true, format: "png", size: 1024 }), this.client.config.links.website.home)
        .setDescription(`<:YaY:835190406899695697> **|** Olá ${ctx.author}, eu sou a Lunar, sou um bot com um grande sonho,\nMeu foco principal é manter seu servidor organizado, ajudando na moderação e administração. Este é meu painel de ajuda, aqui você poderá descobrir no que eu posso ajudar a você e o servidor.`)
        .addField(":clipboard: Minha lista de comandos", `> ${this.client.config.links.website.commands}`)
        .addField("<:Duvida:835272427516461146> Precisando de ajuda? Pergunte no meu servidor de suporte!", `> ${this.client.config.links.website.support}`)
        .addField(":envelope_with_arrow: Que tal votar em mim para me ajudar a  chegar em outras pessoas?", `> ${this.client.config.links.website.vote}`)
        .addField(":love_letter: Que tal me adicionar em seu servidor?", `> [${this.client.config.links.website.invite}](${this.client.generateOauth2({
            permissions: 8n,
            redirect: `${this.client.config.links.website.callback}`,
            scopes: ["bot", "applications.commands", "guilds", "identify"],
        })})`)
        .addField(":gear: Me configure pela minha dashboard", `> ${this.client.config.links.website.dashboard.me}`)
        .setFooter(`• Fui criada e desenvolvida por: ${Bae.tag}`, Bae.avatarURL({ dynamic: true, format: "png", size: 1024 }))

        await ctx.interaction.reply({
            embeds: [embed]
        })
    }
}