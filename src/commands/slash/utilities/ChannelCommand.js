const Command = require("../../../structures/Command.js")
const ChannelLockSubCommand = require("../administration/ChannelLockSubCommand.js")
const ChannelInfoSubCommand = require("./ChannelInfoSubCommand.js")

module.exports = class ChannelCommand extends Command {
    constructor(client) {
        super({
            name: "channel",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [
            new ChannelInfoSubCommand(client, this),
            new ChannelLockSubCommand(client, this)
        ]
    }
}