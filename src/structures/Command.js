const _client = require("../Lunary")

module.exports = class Command {
    /**
    * @param {_client} client
    * @param {String} name
    * @param {String} description
    * @param {?Array} aliases
    * @param {String} category
    * @param {String} dirname
    */
    constructor({
        name = null,
        description = null,
        aliases = null,
        category = null,
        dirname = null,
        subcommands = [],
        permissions = {},
        dm = false
    }, client) {
        this.client = client
        this.name = name
        this.description = description
        this.aliases = aliases
        this.category = category
        this.dirname = dirname
        this.subcommands = subcommands
        this.permissions = permissions
        this.dm = false
    }

    isDM() {
        return this.dm
    }

    verifyPerms(member, me) {
        let data = {
            me: {
                has: true
            },
            member: {
                has: true,
                type: "member"
            }
        }

        if(this.permissions.me) if(me.hasPermission(this.permissions.me)) data.me.has = false

        if(this.requires.owner) {
            if(!this.client.config.owners.includes(member.user.id)) data.member = {
                has: false,
                type: "owner"
            }
            else data.member = {
                has: true,
                type: "owner"
            }
        } else if(this.permissions.Discord) {
            if(!member.hasPermission(this.permissions.Discord)) data.member.has = false
            else data.member.has = true
        }

        return data
    }
}