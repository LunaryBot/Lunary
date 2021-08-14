const { Collection } = require("discord.js")
const { Permissions } = require("./BotPermissions")

class GuildDB {
    constructor(data) {
        this.perms = new Collection()
    }
}