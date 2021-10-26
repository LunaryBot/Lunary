const express = require("express")
const { join } = require("path")
const path = require("path/posix")
const apiRouter = require("./LunaryServerAPI")

module.exports = function initServer() {
    const app = express()
    app.get("/", (req, res) => {
        res.sendStatus(200)
    })

    app.use("/api", apiRouter)
    app.use("/database", express.static(join(__dirname, "../database")))

    app.listen(process.env.PORT)

    return app
}