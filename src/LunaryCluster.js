require("dotenv").config()
const Manager = require("./system/cluster/ClusterManager");
let {token} = require("./config/config");
const Logger = require("./utils/logger");
const manager = new Manager(`${__dirname}/Lunary.js`,{
    totalShards: 4,
    totalClusters: 2, 
    mode: "process",
    token: token
})

manager.on('clusterCreate', cluster => Logger.log(`Cluster criado!`, { key: "System", cluster: cluster, date: true }));
manager.spawn()