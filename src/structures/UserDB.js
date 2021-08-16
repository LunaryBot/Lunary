const { Collection } = require("discord.js")
const { Permissions } = require("./BotPermissions")
const BitField = require("./BitField")

class UserDB {
    constructor(data = {}) {
        this.aboutme = data.aboutme || ""
        this.configs = new UserConfigs(data.configs || 0)
    }
}

class UserConfigs extends BitField {
    any(permission) {
        return (super.any(permission));
    }
  
    has(permission) {
        return (super.has(permission));
    }

    static get FLAGS() {
        const FLAGS = {
            QUICK_PUNISHMENT : 1 << 0
        }

        return FLAGS
    }

    static get ALL() {
        return Object.values(UserConfigs.FLAGS).reduce((all, p) => all | p, 0)
    }

    static get DEFAULT() {
        return 0
    }

    static get defaultBit() {
        return 0
    }
}

module.exports = {
    GuildDB: GuildDB,
    GuildConfigs: GuildConfigs
}