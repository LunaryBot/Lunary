const { Permissions, Client, Collection, Constants: { InviteScopes }, Options } = require("./lib")
const ClusterClient = require("./system/cluster/ClusterClient.js")
const ShardManager = require("./system/cluster/ShardManager.js")
const Logger = require("./utils/logger.js")
require("./functions/shorten.js")
require("./functions/emojis.js")
require("./functions/removeAccents.js")
const moment = require("moment")
require("moment-duration-format")
require("moment-timezone")
const firebase = require("firebase")
const Command = require("./structures/Command.js")
const Event = require("./structures/Event.js")
const Locale = require("./structures/Locale.js")
global.emojis = require("./utils/emojisInstance.js")
const {readFileSync} = require("fs")
const { load } = require("js-yaml")

class Lunary extends Client {
    constructor() {
        super({
            shards: ClusterClient.getinfo().SHARD_LIST,
            shardCount: ClusterClient.getinfo().TOTAL_SHARDS,
            intents: 1719,
            ws: {
                properties: { 
                    $browser: "Discord iOS" 
                },
            },
            makeCache: Options.cacheWithLimits({
                ApplicationCommandManager: 0,
                GuildBanManager: 0,
                GuildInviteManager: 0,
                MessageManager: 0,
		        PresenceManager: 0,
                UserManager: 0,
                GuildStickerManager: 0,
                StageInstanceManager: 0,
                VoiceStateManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0
            })
        })
        this.config = load(readFileSync(__dirname + "/../config.yml", "utf8"))
        this.config.token = process.env.DISCORD_TOKEN
        this.cluster = new ClusterClient(this)
        this.logger = new Logger(this.cluster)

        firebase.initializeApp(this.config.firebaseConfigGuilds)
        this.GuildsDB = firebase.database()
        this.db = this.GuildsDB

        const UsersDB = firebase.initializeApp(this.config.firebaseConfigUsers, "users")
        this.UsersDB = UsersDB.database()
        
        const LogsDB = firebase.initializeApp(this.config.firebaseConfigLogs, "logs")
        this.LogsDB = LogsDB.database()

        this.mutes = new Collection()
        this.imagesCanvas = new Collection()
        
        this.on("shardReconnecting", shard => {
            this.logger.log(`Client reconectado ao Discord!`, { key: ["Client", `Shard ${shard}`], cluster: true, date: true })
        })
    }

    init() {
        this.loadLocales()
        this.loadEvents()
        this.loadCommands()
        this.login(this.config.token)
        this.commands
    }

    /**
     * 
     * @returns {Locale[]}
     */
    loadLocales() {
        this.locales = []
        require("./handlers/localeHandler.js")(this)
        return this.locales
    }

    /**
     * 
     * @returns {Event[]}
     */
    loadEvents() {
        this.events = []
        require("./handlers/eventHandler.js")(this)
        return this.events
    }

    /**
     * 
     * @returns {Command[]{}}
     */
    loadCommands() {
        this.commands = {}
        require("./handlers/commandHandler.js")(this)
        return this.commands
    }

    /**
    * @param {{
    *   client_id:string,
    *   scopes:string[],
    *   permissions:bigint,
    *   disableGuildSelect:boolean,
    *   guild:string,
    *   redirect:string,
    *   redirect_uri:string,
    *   state:string
    * }} options
    */
     generateOauth2(options = {}) {
        if(typeof options !== 'object') throw new TypeError('INVALID_TYPE', 'options', 'object', true);
        let client_id = options.client_id
        
        if(!client_id) {
            if(!this.application) throw new Error('CLIENT_NOT_READY', 'generate an invite link');
            else client_id = this.application.id
        }
    
        const query = new URLSearchParams({
            client_id: client_id,
            response_type: "code"
        });
    
        const { scopes } = options;
        if(typeof scopes === 'undefined') throw new TypeError('INVITE_MISSING_SCOPES');
        
        if(!Array.isArray(scopes)) throw new TypeError('INVALID_TYPE', 'scopes', 'Array of OAuth2 Scopes', true);
        
        if(!scopes.some(scope => ['bot', 'applications.commands'].includes(scope)) && scopes.length == 0) throw new TypeError('OAUTH2_MISSING_SCOPES');
        
        const invalidScope = scopes.find(scope => !InviteScopes.includes(scope));
        if(invalidScope) throw new TypeError('INVALID_ELEMENT', 'Array', 'scopes', invalidScope);

        query.set('scope', scopes.join(' '));
    
        if(options.permissions) {
            const permissions = Permissions.resolve(options.permissions);
            if(permissions) query.set('permissions', permissions);
        }
    
        if(options.disableGuildSelect) query.set('disable_guild_select', true)
    
        if(options.guild) {
            const guildId = this.guilds.resolveId(options.guild);
            if(!guildId) throw new TypeError('INVALID_TYPE', 'options.guild', 'GuildResolvable');
            query.set('guild_id', guildId);
        }

        if(options.redirect_uri || options.redirect) query.set('redirect_uri', options.redirect_uri || options.redirect)
        if(options.state) query.set('state', options.state)
    
        return `${this.options.http.api}${this.api.oauth2.authorize}?${query.toString()}`;
    }
}

const client = new Lunary()

module.exports = client

process.on('warning', () => console.log("Erro!"));
client.init()