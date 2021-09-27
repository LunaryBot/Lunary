const Command = require("../../../structures/Command")
const UserAvatarSubCommand = require("./UserAvatarSubCommand")
const UserBannerSubCommand = require("./UserBannerSubCommand")
const UserInfoSubCommand = require("./UserInfoSubCommand")

module.exports = class UserCommand extends Command {
    constructor(client) {
        super({
            name: "user",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [new UserAvatarSubCommand(client, this), new UserBannerSubCommand(client, this), new UserInfoSubCommand(client, this)]
    }
}