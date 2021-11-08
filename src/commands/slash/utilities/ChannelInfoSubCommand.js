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
        .setTitle(`${channel.isText() ? ":pencil:" : ":loud_sound:"}${channel.nsfw ? ":underage:" : ""}${ctx.guild.rulesChannelId == channel.id ? ":closed_book:" : ""} ${channel.name}`)
        .setColor(channel.isText() ? "#A020F0" : "#FFFAFA")
        .setDescription(channel.isText() ? (channel.topic || "Tópico do canal não definido.") : "")
        .addField(":bookmark: Menção do canal:", `\`${channel.toString()}\``, true)
        .addField(":open_file_folder: ID", `\`${channel.id}\``, true)
        .addField(":calendar_spiral: Canal criado em", `<t:${Math.floor((channel.createdTimestamp + 3600000) /1000.0)}> (<t:${Math.floor((channel.createdTimestamp + 3600000) /1000.0)}:R>)`)
        
        ctx.interaction.reply({
            embeds: [embed]
        })
    }
}