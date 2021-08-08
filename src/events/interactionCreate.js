const Event = require("../structures/Event")
const axios = require("axios")
const InteractionMessage = require("../structures/InteractionMessage")
const MessageComponent = require("../structures/components/MessageComponent")
const { Interaction } = require("discord.js")
const InteractionArgs = require("../structures/InteractionArgs")

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
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type