// const app = require("express")()
// app.get("/", (req, res) => {
//     res.send("Ok")
// })

// app.listen(8080, "0.0.0.0")
require("./functions/quote")
const Manager = require("./system/cluster/ClusterManager");
let {token} = require("./config/config");
const manager = new Manager(`${__dirname}/Lunary.js`,{
    totalShards: 1,
    totalClusters: 1, 
    mode: "process",
    token: token
})

manager.on('clusterCreate', cluster => console.log(`[System] [Cluster ${cluster.id}] Cluster criado!`));
manager.spawn(undefined, undefined, -1)