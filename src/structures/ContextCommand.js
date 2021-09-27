const _client = require("../Lunary")
const { Message, CommandInteraction, User, Guild, GuildMember, DMChannel, GuildChannel } = require("discord.js")
const ObjRef = require("../utils/objref/ObjRef")
const { GuildDB } = require("./GuildDB")
const { UserDB } = require("./UserDB")
const Language = require("../languages/Language")
const { configPermissions } = require("./BotPermissions")
const Locale = require("./Locale")

module.exports = class ContextCommand {
    constructor({client, message = null, interaction = null, args = null, guild, channel, user, command, slash = false, prefix, dm = false}, { usersDB, guildsDB }) {
        
        /**
         * @type {_client}
         */
        this.client = client
        
        /**
         * @type {?Message}
         */
        this.message = message

        /**
         * @type {?Array}
         */
        this.args = args
        
        /**
         * @type {?CommandInteraction}
         */
        this.interaction = interaction

        /**
         * @type {User}
         */
        this.author = user

        /**
         * @type {Guild}
         */
        this.guild = guild || null
        
        /**
         * @type {GuildChannel}
         */
        this.channel = channel
        
        /**
         * @type {GuildMember}
         */
        this.member = this.guild ? (this.interaction || this.message).member : null
        
        /**
         * @type {GuildMember}
         */
        this.me = this.guild ? this.guild.me : this.client 

        /**
         * @type {Command}
         */
        this.command = command

        /**
         * @type {boolean}
         */
        this.slash = Boolean(slash)
        
        /**
         * @type {boolean}
         */
        this.dm = Boolean(dm)
        
        /**
         * @type {?string}
         */
        this.prefix = this.slash == true ? "/" : prefix || null
        
        this.GuildsDB = new ObjRef(guildsDB || {})
        this.UsersDB = new ObjRef(usersDB || {})

        this.GuildDB = this.guild ? new GuildDB(this.GuildsDB.ref(`Servers/${this.guild.id}/`).val()) : null
        this.UserDB = new UserDB(this.UsersDB.ref(`Users/${this.author.id}/`).val(), !this.dm ? configPermissions(this.member, this.GuildsDB) : null)

        /**
         * @type {Locale}
         */
        const locale = this.client.locales.find(x => x.locale == (GuildDB.locale || this.client.config.defaultLocale))
        
        this.locale = locale
        this.t = locale.t
    }
}