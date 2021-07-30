const Discord = require("discord.js")
const Event = require("../structures/Event")
const axios = require("axios")
const InteractionMessage = require("../utils/InteractionMessage")

module.exports = class InteractionCreateEvent extends Event {
    constructor(client) {
        super("INTERACTION_CREATE", client, true)
    }

    async run(interaction) {
        if(interaction.type == 2) this.execCommand(interaction)
    }

    async execCommand(interaction) {
        let command = interaction.data.name ? interaction.data.name.toLowerCase() : undefined
        command = this.client.commands.find(c => c.name == command)
        if(!command) return;

        let guild = this.client.guilds.cache.get(interaction.guild_id)
        let client = this.client
        let ctx = {
            interaction: interaction,
            args: interaction.data.options,
            guild: guild,
            channel: guild.channels.cache.get(interaction.channel_id),
            member: guild.members.cache.get(interaction.member.user.id),
            author: this.client.users.cache.get(interaction.member.user.id),
            reply: async function(data) {
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: data
                    }
                })

                let msg = new InteractionMessage(client, {
                    interaction: interaction,
                    member: this.member,
                    guild: guild,
                    channel: this.channel,
                    author: this.author
                })
                return msg
            }
        }

        command.run(ctx)
    }
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type