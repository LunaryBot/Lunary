const Command = require(__dirname + "/../../../structures/Command.js")
const KitsuAnimeSubCommand = require(__dirname + "/KitsuAnimeSubCommand.js")
const KitsuMangaSubCommand = require(__dirname + "/KitsuMangaSubCommand.js")

module.exports = class KitsuCommand extends Command {
    constructor(client) {
        super({
            name: "kitsu",
            dirname: __dirname,
            baseCommand: true
        }, client)

        this.subcommands = [
            new KitsuMangaSubCommand(client, this), 
            new KitsuAnimeSubCommand(client, this)
        ]
    }
}