const _client = require("../Lunary")
const Command = require("./Command")

module.exports = class SubCommand {
    /**
    * @param {_client} client
    * @param {string} mainCommand
    */
    constructor({
        name = null,
        description = null,
        aliases = null,
        dirname = null,
        subcommands = [],
        permissions = {},
        dm = false
    }, mainCommand, client) {
        this.client = client

        /**
         * @type {string}
         */
        this.name = name

        /**
         * @type {string}
         */
        this.description = description

        /**
         * @type {string[]}
         */
        this.aliases = aliases

        /**
         * @type {string}
         */
        this.dirname = dirname

        /**
         * @type {string}
         */
        this.nameMainCommand = mainCommand

        /**
         * @type {SubCommand[]}
         */
        this.subcommands = subcommands

        /**
         * @type {object}
         */
        this.permissions = permissions

        /**
         * @type {boolean}
         */
        this.dm = dm
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