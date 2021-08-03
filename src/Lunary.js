const { Client } = require("discord.js")
const ClusterClient = require("./system/cluster/ClusterClient")
const ShardManager = require("./system/cluster/ShardManager")
const Logger = require("./utils/logger")

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
        
        this.events = []
        this.commands = []

        this.on("shardReconnecting", shard => {
            console.log("Shard Reconectada")
        })
    }

    init() {
        this.loadEvents()
        this.loadCommands()
        this.login(this.config.token)
    }

    loadEvents() {
        require("./handlers/eventHandler")(this)
    }

    loadCommands() {
        require("./handlers/commandHandler")(this)
    }
}

const client = new Lunary()

module.exports = {
    client: client, 
    ClientBase: Lunary
}

client.init()