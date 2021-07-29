const { Client } = require("discord.js")
const ClusterClient = require("./system/cluster/ClusterClient")
const ShardManager = require("./system/cluster/ShardManager")

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
    }

    init() {
        this.login(this.config.token)
    }
}

const client = new Lunary()
client.init()