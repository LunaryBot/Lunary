const express = require("express")
const apiRouter = require(__dirname + "/LunaryServerAPI")

module.exports = function initServer() {
    const app = express()
    app.get("/", (req, res) => {
        res.sendStatus(200)
    })

    app.use("/api", apiRouter)

    app.listen(process.env.PORT)

    return app
}