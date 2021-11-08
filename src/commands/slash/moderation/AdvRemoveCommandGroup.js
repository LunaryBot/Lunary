const SubCommand = require("../../../structures/SubCommand.js")
const ContextCommand = require("../../../structures/ContextCommand.js")
const Discord = require("../../../lib")
const AdvRemoveUserSubCommand = require("./AdvRemoveUserSubCommand.js")

module.exports = class AdvRemoveCommandGroup extends SubCommand.CommandGroup {
    constructor(client, mainCommand) {
        super({
            name: "remove",
            dirname: __dirname,
            dm: false
        }, mainCommand, client)
        
        this.subcommands = [new AdvRemoveUserSubCommand(client, this)]
    }
}