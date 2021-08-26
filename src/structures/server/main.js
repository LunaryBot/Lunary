const express = require("express")
const client = require("../../Lunary")
const apiRouter = require("./apis/main")

module.exports = function initServer() {
    const app = express()
    app.get("/", (req, res) => {
        res.sendStatus(200)
    })

    app.use("/api", apiRouter)

    app.listen(Number(`${client.cluster.id}016`), "0.0.0.0")

    return app
}