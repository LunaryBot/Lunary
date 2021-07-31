const axios = require("axios")
const MessageButtonCollector = require("./components/MessageButtonCollector")
let _client

module.exports = class InteractionMessage {
    constructor (client, {
        interaction,
        member,
        guild,
        channel,
        author
    }) {
        _client = client
        this.interaction = interaction
        this.content = ""
        this.id = ""
        this.embeds = []
        this.author = author
        this.member = member
        this.guild = guild
        this.channel

        this.get()
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
        console.log(res.id)
        this.content = res.content
        this.id = res.id
        this.embeds = res.embeds || []
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

    delete() {
        delete this.interaction
        delete this.content
        delete this.id
        delete this.embeds
        delete this.author
        delete this.member
        delete this.guild
    }

    createButtonCollector(options) {
        let collector = new MessageButtonCollector(this, options)
        return collector
    }
}