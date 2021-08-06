const Event = require("../structures/Event")
const axios = require("axios")
const InteractionMessage = require("../structures/InteractionMessage")
const MessageComponent = require("../structures/components/MessageComponent")
const { Util, APIMessage, MessageEmbed } = require("discord.js")
const InteractionArgs = require("../structures/InteractionArgs")
const ObjRef = require("../utils/objref/ObjRef")
const MemberBotPermissions = require("../structures/MemberBotPermissions")

module.exports = class SlashCommandEvent extends Event {
    constructor(client) {
        super("slashCommand", client)
    }

    async run(interaction) {
        let command = interaction.data.name ? interaction.data.name.toLowerCase() : undefined
        command = this.client.commands.find(c => c.name == command)
        if(!command) return;

        let guild = this.client.guilds.cache.get(interaction.guild_id)
        let client = this.client
        let pingDB = Date.now()
        let db = await this.client.db.ref().once('value')
        db = db.val()
        pingDB = Date.now() - pingDB

        db = new ObjRef(db)
        db.ping = pingDB

        const ctx = {
            interaction: interaction,
            args: new InteractionArgs(this.client, interaction.data.options || [], guild),
            guild: guild,
            channel: guild.channels.cache.get(interaction.channel_id),
            member: guild.members.cache.get(interaction.member.user.id),
            author: this.client.users.cache.get(interaction.member.user.id),
            reply: async function(data, files) {
                if(files == undefined || !Array.isArray(files)) files = []
                if(files.length) files = await Promise.all(files.map(file => APIMessage.resolveFile(file)))
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: data
                    },
                    files: files
                })

                if(data.flags == 1 << 6) return

                let msg = await new InteractionMessage(client, {
                    interaction: interaction,
                    member: this.member,
                    guild: guild,
                    channel: this.channel,
                    author: this.author
                })
                return msg
            }
        }

        ctx.member.botpermissions = MemberBotPermissions(ctx.member, db)

        let t = this.client.langs.find(x => x.lang == null || "pt-BR").t

        try {
            await command.run(ctx, t, db)
        } catch (e) {
            ctx.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).")
                    .addField("Erro:", `\`\`\`js\n${e}\`\`\``)
                    .setFooter("Desculpa pelo transtorno.")
                ],
                flags: 1 << 6
            })
        }
    }
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type