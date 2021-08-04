const { Client } = require("discord.js")
const ClusterClient = require("./system/cluster/ClusterClient")
const ShardManager = require("./system/cluster/ShardManager")
const Logger = require("./utils/logger")
require("./functions/shorten")
const moment = require("moment")
require("moment-duration-format")
const firebase = require('firebase')

class Lunary extends Client {
    constructor() {
        super({
            shards: ClusterClient.getinfo().SHARD_LIST,
	        shardCount: ClusterClient.getinfo().TOTAL_SHARDS,
            ws: { 
                properties: { 
                    $browser: "Discord iOS" 
                },
            intents: 1719 
            }, 
            fetchAllMembers: true
        })
        this.config = require("./config/config")
        this.cluster = new ClusterClient(this)
        this.shard = new ShardManager(this)
        this.logger = new Logger(this.cluster)

        firebase.initializeApp(this.config.firebaseConfig)
        this.db = firebase.default.database()
        this.on("shardReconnecting", shard => {
            console.log("Shard Reconectada")
        })
    }

    init() {
        this.loadLanguage()
        this.loadEvents()
        this.loadCommands()
        this.login(this.config.token)
    }

    loadLanguage() {
        this.langs = []
        require("./handlers/langHandler")(this)
    }

    loadEvents() {
        this.events = []
        require("./handlers/eventHandler")(this)
    }

    loadCommands() {
        this.commands = []
        require("./handlers/commandHandler")(this)
    }
}

const client = new Lunary()

module.exports = {
    client: client, 
    ClientBase: Lunary
}

client.init()