const Discord = require("discord.js")
const ContextCommand = require("../structures/ContextCommand")

/**
 * 
 * @param {ContextCommand} ctx
 * @param {Discord.User} user
 * @param {String} reason
 */
module.exports = function confirm_punish(ctx, user, reason) {
    const data = {
        embeds: [
            new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setAuthor(ctx.t("confirm_punish/title"), "https://cdn.discordapp.com/emojis/829429780155858974.gif?v=1")
            .setDescription(`**- ${ctx.t("confirm_punish/description")}**\nㅤ${user.toString()} (\`${user.id}\`)`)
            .addField(`<:Motivo:816454218570792990> • ${ctx.t("geral/reason")}:`, `ㅤ${reason}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
            .setFooter(`${ctx.t("geral/requested_by")}: ${ctx.author.tag}`, ctx.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
        ],
        components: [
            new Discord.MessageActionRow()
            .addComponents([
                new Discord.MessageButton()
                .setCustomId("confirm_punish")
                .setStyle("SUCCESS")
                .setEmoji("872635474798346241"),
                new Discord.MessageButton()
                .setCustomId("cancel_punish")
                .setStyle("DANGER")
                .setEmoji("872635598660313148")
            ])
        ]
    }

    return data
}