const Discord = require("discord.js")
const ContextCommand = require("../structures/ContextCommand")
const { format } = require("./format_time")

/**
 * 
 * @param {ContextCommand} ctx
 * @param {Discord.User} user
 * @param {String} reason
 */
module.exports = function confirm_punish(ctx, user, reason, time) {
    const embed = new Discord.MessageEmbed()
    .setColor(13641511)
    .setAuthor(ctx.t("confirm_punish/title"), global.emojis.get("alert").url)
    .setDescription(`**- ${ctx.t("confirm_punish/description")}**\nㅤ${user.toString()} (\`${user.tag} - ${user.id}\`)`)
    .addField(`${global.emojis.get("clipboard").mention} • ${ctx.t("geral/reason")}:`, `ㅤ${reason}${time ? `\n\n**- ${global.emojis.get("time").mention} • ${ctx.t("geral/duration")}:** \`${time != "..." ? `${format(time)}` : ctx.t("geral/not_determined")}\`` : ""}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
    .setFooter(`${ctx.t("geral/requested_by")}: ${ctx.author.tag}`, ctx.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp()

    const data = {
        embeds: [
            embed
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