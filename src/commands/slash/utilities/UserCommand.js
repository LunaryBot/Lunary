const Command = require("../../../structures/Command")
const UserAvatarSubCommand = require("./UserAvatarSubCommand")


module.exports = class UserCommand extends Command {
    constructor(client) {
        super({
            name: "user",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [new UserAvatarSubCommand(client, this)]
    }
}