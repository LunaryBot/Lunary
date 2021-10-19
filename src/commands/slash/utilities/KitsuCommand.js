const Command = require("../../../structures/Command")

module.exports = class KitsuCommand extends Command {
    constructor(client) {
        super({
            name: "kitsu",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = []
    }
}