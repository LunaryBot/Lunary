const Command = require("../../../structures/Command.js")
const ServerInfoSubCommand = require("../utilities/ServerInfoSubCommand.js")

module.exports = class ServerCommand extends Command {
    constructor(client) {
        super({
            name: "server",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [
            new ServerInfoSubCommand(client, this)
        ]
    }
}