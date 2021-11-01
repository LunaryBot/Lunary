const Command = require("../../../structures/Command.js")
const ChannelInfoSubCommand = require("./ChannelInfoSubCommand.js")

module.exports = class ChannelCommand extends Command {
    constructor(client) {
        super({
            name: "channel",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [new ChannelInfoSubCommand(client, this)]
    }
}