const SubCommand = require("../../../structures/SubCommand.js")
const ContextCommand = require("../../../structures/ContextCommand.js")
const Discord = require("../../../lib")

module.exports = class ChannelInfoSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "info",
            dirname: __dirname,
            dm: false
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const channel = ctx.interaction.options.getChannel("channel") || ctx.channel

        const embed = new Discord.MessageEmbed()
        .setTitle(`${channel.name}`)
        .setColor(channel.type == "GUILD_NEWS" ? "#7289DA" : "#FFB6C1")

        ctx.interaction.reply({
            embeds: [embed]
        })
    }
}