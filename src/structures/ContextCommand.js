const _client = require('../Lunary.js')
const { Message, User, Guild, GuildMember, DMChannel, GuildChannel } = require("discord.js")
const Command = require("./Command")
const ObjRef = require('../utils/objref/ObjRef.js')

class ContextCommand {
    constructor({client, message = null, guild, channel, user, command, slash = false, prefix, dm = false}, { usersDB, guildsDB }) {
        
        /**
         * @type {_client}
         */
        this.client = client
        
        /**
         * @type {?Message}
         */
        this.message = message

        /**
         * @type {User}
         */
        this.author = user

        /**
         * @type {Guild}
         */
        this.guild = dm == true ? guild : null
        
        /**
         * @type {GuildChannel}
         */
        this.channel = channel
        
        /**
         * @type {GuildMember}
         */
        this.member = dm == true ? this.guild.members.cache.get(this.user.id) : null
        
        /**
         * @type {GuildMember}
         */
        this.me = dm == true ? this.guild.me : this.client 

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
        this.prefix = prefix || null

        this.GuildDB = guildsDB
        
        this.UserDB = usersDB
    }
} // https://lunary.ml/