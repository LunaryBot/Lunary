const Event = require("../structures/Event")
const axios = require("axios")
const InteractionMessage = require("../structures/InteractionMessage")
const MessageComponent = require("../structures/components/MessageComponent")
const { Interaction, CommandInteraction } = require("discord.js")
const InteractionArgs = require("../structures/InteractionArgs")
const { configPermissions } = require("../structures/BotPermissions")

module.exports = class InteractionCreateEvent extends Event {
    constructor(client) {
        super("interactionCreate", client)
    }

    /**
     * 
     * @param {Interaction} interaction 
     * @returns 
     */

    async run(interaction) {
        if (interaction.isCommand()) return this.client.emit("slashCommand", interaction)
        if(interaction.isButton()) return this.client.emit("clickButton", interaction)
    }

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @returns 
     */

    async executeCommand(interaction) {
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

        interaction.member.botpermissions = BotPermissions(interaction.member, db)

        let t = this.client.langs.find(x => x.lang == null || "pt-BR").t

        try {
            await command.run(interaction, t, db)
        } catch (e) {
            interaction.channel.send({
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

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type