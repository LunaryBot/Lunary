const { API } = require("@top-gg/sdk")

async function DBLPostStats() {
    const guilds = await clusterManager.broadcastEval(`this.guilds.cache.size`).then(x => x.reduce((c, d) => c + d, 0))

    console.log(guilds)
}

module.exports = DBLPostStats