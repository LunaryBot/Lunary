require("dotenv").config()
const ClusterManager = require("./system/cluster/ClusterManager");
const {token} = require("./config/config");
const Logger = require("./utils/logger");
const clusterManager = new ClusterManager(`${__dirname}/Lunary.js`,{
    totalShards: 1,
    totalClusters: 1, 
    mode: "process",
    token: token
})

clusterManager.on('clusterCreate', cluster => {
    Logger.log(`Cluster criado!`, { key: "System", cluster: cluster, date: true })
});

global.clusterManager = clusterManager
clusterManager.spawn()
require("./LunaryServer")()