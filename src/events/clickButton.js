const Discord = require("discord.js")
const Event = require("../structures/Event")
const axios = require("axios")
const InteractionMessage = require("../structures/InteractionMessage")

module.exports = class ClickButtonEvent extends Event {
    constructor(client) {
        super("clickButton", client)
    }

    async run(button) {
        
    }
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type