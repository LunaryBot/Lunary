const axios = require("axios")
const { APIMessage } = require("discord.js")
const MessageButtonCollector = require("./components/MessageButtonCollector")
const MenuCollector = require("./components/MessageSelectMenuCollector")
let _client

module.exports = class InteractionMessage {
    constructor (client, {
        interaction,
        member,
        guild,
        channel,
        author
    }, hideFlag) {
        _client = client
        this.interaction = interaction
        this.content = ""
        this.id = ""
        this.embeds = []
        this.author = author
        this.member = member
        this.guild = guild
        this.channel

        return this.get()
    }

    get client() {
        return _client
    }

    async get() {
        let res
        try {
            res = await axios
            .get(`https://discord.com/api/v8/webhooks/${this.client.user.id}/${this.interaction.token}/messages/@original`)
            .then((res) => {
                return res.status == 200 ? res.data : {}
            }).catch(() => {})
        } catch (error) {
            res = {}
        }
        try {
            this.content = res.content
            this.id = res.id
            this.embeds = res.embeds || []  
        } catch (_) {}
        return this
    }

    async edit(data) {
        const res = await axios
        .patch(`https://discord.com/api/v8/webhooks/${this.client.user.id}/${this.interaction.token}/messages/@original`, data)
        .then((res) => {
            return res.data
        })
       this.content = res.content
       this.id = res.id
       this.embeds = res.embeds || []
       return this
    }

    async delete() {
        delete this.content
        delete this.id
        delete this.embeds
        delete this.author
        delete this.member
        delete this.guild
        await axios
        .delete(`https://discord.com/api/v8/webhooks/${this.client.user.id}/${this.interaction.token}/messages/@original`)
    }

    createButtonCollector(options) {
        let collector = new MessageButtonCollector(this, options)
        return collector
    }

    createMenuCollector(options) {
        let collector = new MenuCollector(this, options)
        return collector
    }
}