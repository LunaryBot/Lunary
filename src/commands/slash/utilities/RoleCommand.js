const Command = require("../../../structures/Command.js")
const RoleInfoSubCommand = require("./RoleInfoSubCommand.js")

module.exports = class RoleCommand extends Command {
    constructor(client) {
        super({
            name: "role",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [
            new RoleInfoSubCommand(client, this)
        ]
    }
}