const Event = require("../structures/Event")
const axios = require("axios")
const InteractionMessage = require("../structures/InteractionMessage")
const { CommandInteraction, MessageEmbed } = require("discord.js")
const ObjRef = require("../utils/objref/ObjRef")
const MemberBotPermissions = require("../structures/MemberBotPermissions")

module.exports = class SlashCommandEvent extends Event {
    constructor(client) {
        super("slashCommand", client)
    }

    /**
     * @param {CommandInteraction} interaction 
     * @returns 
     */

    async run(interaction) {
        let command = interaction.commandName ? interaction.commandName.toLowerCase() : undefined
        command = this.client.commands.find(c => c.name == command)
        if(!command) return;

        let guild = this.client.guilds.cache.get(interaction.guild.id)
        let client = this.client
        let pingDB = Date.now()
        let db = await this.client.db.ref().once('value')
        db = db.val()
        pingDB = Date.now() - pingDB

        db = new ObjRef(db)
        db.ping = pingDB

        interaction.member.botpermissions = MemberBotPermissions(interaction.member, db)

        let t = this.client.langs.find(x => x.lang == null || "pt-BR").t

        try {
            await command.run(interaction, t, db)
        } catch (e) {
            if(!interaction.replied) interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).")
                    .addField("Erro:", `\`\`\`js\n${`${e}`.shorten(1990)}\`\`\``)
                    .setFooter("Desculpa pelo transtorno.")
                ]
            })
            else interaction.channel.send({
                content: `${interaction.user.toString()}`,
                embeds: [
                    new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).")
                    .addField("Erro:", `\`\`\`js\n${`${e}`.shorten(1990)}\`\`\``)
                    .setFooter("Desculpa pelo transtorno.")
                ]
            })
        }
    }
}

class ContextCommand {
    constructor() {}
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type