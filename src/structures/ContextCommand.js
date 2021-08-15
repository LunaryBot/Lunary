const _client = require("../Lunary")
const { Message, CommandInteraction, User, Guild, GuildMember, DMChannel, GuildChannel } = require("discord.js")
const ObjRef = require("../utils/objref/ObjRef")

module.exports = class ContextCommand {
    constructor({client, message = null, interaction = null, guild, channel, user, command, slash = false, prefix, dm = false}, { usersDB, guildsDB }) {
        
        /**
         * @type {_client}
         */
        this.client = client
        
        /**
         * @type {?Message}
         */
        this.message = message
        
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
        this.guild = dm == false ? guild : null
        
        /**
         * @type {GuildChannel}
         */
        this.channel = channel
        
        /**
         * @type {GuildMember}
         */
        this.member = dm == false ? this.guild.members.cache.get(this.author.id) : null
        
        /**
         * @type {GuildMember}
         */
        this.me = dm == false ? this.guild.me : this.client 

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

        this.GuildDB = guildsDB

        this.UserDB = usersDB

        this.GuildsDB = new ObjRef(guildsDB || {})

        this.UsersDB = new ObjRef(usersDB || {})
    }
}