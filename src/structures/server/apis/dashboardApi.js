const client = require("../../../Lunary")

const router = require("express").Router()

router.get("/:id_guild", async(req, res) => {
    const guildID = req.params.id_guild

    const data = await getGuild(guildID)

    res.json(data)
})

module.exports = router

/**
 * @param {client} client
 */
 async function getGuild(guildID) {
    const guild = await client.guilds.fetch(guildID).catch(() => {})
    if(!guild) return {
        status: 404,
        statusText: "Not Found",
        data: null,
        query: `Guild ${guildID}`
    }
    
    let res = await client.cluster.broadcastEval(`(() => {
        const guild = this.guilds.cache.get('${guildID}')
        if(guild) return {
            shardID: guild.shardId,
            clusterID: this.cluster.id
        }
    })()`).then(x => x.find(x => x != null))

    const data = {}
    data.name = guild.name
    data.icon = guild.iconURL({ dynamic: true })
    data.id = guild.id
    data.channels = [ ...guild.channels.cache.values() ].map(x => x.toJSON())
    data.roles = [ ...guild.roles.cache.values() ].map(x => x.toJSON())
    data.shardId = res?.shardID
    data.clusterId = res?.clusterID

    return {
        status: 200,
        statusText: "OK",
        data: data,
        query: `Guild ${guildID}`
    }
}

module.exports.getGuild = getGuild