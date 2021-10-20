const { User } = require("../lib")
const { Permissions } = require("./BotPermissions")
const BitField = require("./BitField")

class UserDB {
    /**
     * 
     * @param {Object} data 
     * @param {User} user 
     * @param {Permissions} perms 
     */
    constructor(data = {}, user, perms) {
        this.user = user
        this.aboutme = data.aboutme || `Olá eu sou ${user.username} | #ModereaçãoLunática`
        this.configs = new UserConfigs(data.configs || 0)
        this.gifs = data.gifs || {}
        this.xp = Number(data.xp || 0)
        this.luas = Number(data.luas || 0)
        this.emblem = data.emblem
        this.lastPunishmentApplied = data.lastPunishmentApplied ? JSON.parse(Buffer.from(data.lastPunishmentApplied, 'base64').toString('ascii')) : null
        if(this.lastPunishmentApplied) this.lastPunishmentApplied.reason = decodeURIComponent(this.lastPunishmentApplied.reason)
        this.punishmentsApplied = data.punishmentsApplied || {bans: 0, kicks: 0, mutes: 0, advs: 0}
        if(perms) this.permissions = perms
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
    UserDB: UserDB,
    UserConfigs: UserConfigs
}