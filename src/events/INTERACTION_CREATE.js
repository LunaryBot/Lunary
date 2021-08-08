const Event = require("../structures/Event")
const axios = require("axios")
const InteractionMessage = require("../structures/InteractionMessage")
const MessageComponent = require("../structures/components/MessageComponent")
const { Util, APIMessage } = require("discord.js")
const InteractionArgs = require("../structures/InteractionArgs")

module.exports = class InteractionCreateEvent extends Event {
    constructor(client) {
        super("INTERACTION_CREATE", client, true)
    }

    async run(interaction) {
        if(!interaction.data.component_type) return
        switch (interaction.data.component_type) {
            case 2:
                this.client.emit("clickButton", new MessageComponent(this.client, interaction))
            break;

            case 3:
                this.client.emit("clickMenu", new MessageComponent(this.client, interaction, true))
            break;
        
            default:
                break;
        }
    }
}