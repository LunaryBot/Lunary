const Command = require(__dirname + "/../../../structures/Command.js")
const UserAvatarSubCommand = require(__dirname + "/UserAvatarSubCommand.js")
const UserBannerSubCommand = require(__dirname + "/UserBannerSubCommand.js")
const UserInfoSubCommand = require(__dirname + "/UserInfoSubCommand.js")

module.exports = class UserCommand extends Command {
    constructor(client) {
        super({
            name: "user",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [
            new UserAvatarSubCommand(client, this), 
            new UserBannerSubCommand(client, this), 
            new UserInfoSubCommand(client, this)
        ]
    }
}