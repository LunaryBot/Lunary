require("dotenv").config()
const ClusterManager = require(__dirname + "/system/cluster/ClusterManager.js");
const token = process.env.DISCORD_TOKEN
const Logger = require(__dirname + "/utils/logger.js");
const clusterManager = new ClusterManager(`${__dirname}/Lunary.js`,{
    totalShards: 1,
    totalClusters: 1, 
    mode: "process",
    token: token
})

clusterManager.on('clusterCreate', cluster => {
    Logger.log(`Cluster criado!`, { key: ["Cluster Manager", `Cluster ${cluster.id}`] , date: true })
});

global.clusterManager = clusterManager
clusterManager.spawn(undefined, undefined, -1)
require(__dirname + "/LunaryServer")()