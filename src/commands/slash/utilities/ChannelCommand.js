const Command = require("../../../structures/Command.js")

module.exports = class ChannelCommand extends Command {
    constructor(client) {
        super({
            name: "channel",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = []
    }
}