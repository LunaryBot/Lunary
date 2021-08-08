// const app = require("express")()
// app.get("/", (req, res) => {
//     res.send("Ok")
// })

// app.listen(8080, "0.0.0.0")

const Manager = require("./system/cluster/ClusterManager");
let {token} = require("./config/config");
const Logger = require("./utils/logger");
const manager = new Manager(`${__dirname}/Lunary.js`,{
    totalShards: 1,
    totalClusters: 1, 
    mode: "process",
    token: token,
    respawn: true
})

manager.on('clusterCreate', cluster => Logger.log(`Cluster criado!`, { key: "System", cluster: cluster, date: true }));
manager.spawn(undefined, undefined, -1)