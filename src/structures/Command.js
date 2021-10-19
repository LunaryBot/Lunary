const _client = require("../Lunary")
const SubCommand = require("./SubCommand")
const Discord = require("discord.js")
const utils = require("../utils/index")
const data = require("../data/commands.json")

module.exports = class Command {
    /**
    * @param {_client} client
    */
    constructor({
        name = null,
        aliases = null,
        dirname = null,
        subcommands = [],
        permissions = {},
        dm = false,
        baseCommand = false
    }, client) {
        this.client = client

        /**
         * @type {string}
         */
        this.name = name

        /**
         * @type {string[]?}
         */
        this.aliases = aliases

        /**
         * @type {string}
         */
        this.dirname = dirname

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

        /**
         * @type {boolean}
         */
         this.baseCommand = baseCommand
    }

    get fullName() {
        return this.name
    }

    get data() {
        return data[this.name]?.data
    }

    get utils() {
        return utils
    }

    isDM() {
        return this.dm == false
    }

    /**
     * @param {string}
     * @param {Discord.User|Discord.GuildMember} user
     */
    sendError(description, user) {
        if(user instanceof Discord.GuildMember) user = user.user
        
        const embed = new Discord.MessageEmbed()
        .setDescription(`**${global.emojis.get("nop").mention} • ${description}**`)
        .setColor("#FF0000")
        .setTimestamp()

        if(user instanceof Discord.User) {
            embed
            .setFooter(user.tag, user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        }

        return embed
    }
}