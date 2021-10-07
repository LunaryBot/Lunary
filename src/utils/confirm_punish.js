const Discord = require("discord.js")
const ContextCommand = require("../structures/ContextCommand")
const { format } = require("./format_time")

/**
 * 
 * @param {ContextCommand} ctx
 * @param {Discord.User} user
 * @param {String} reason
 */
module.exports = function confirm_punishment(ctx, user, reason, time) {
    const embed = new Discord.MessageEmbed()
    .setColor("#d02727")
    .setAuthor(ctx.t("general:confirmPunishment.title"), global.emojis.get("alert").url)
    .setDescription(`**- ${ctx.t("general:confirmPunishment.description")}**\nㅤ${user.toString()} (\`${user.tag} - ${user.id}\`)`)
    .addField(`${global.emojis.get("clipboard").mention} • ${ctx.t("general:confirmPunishment.reason")}:`, `ㅤ${reason}${time ? `\n\n**- ${global.emojis.get("time").mention} • ${ctx.t("general:confirmPunishment.duration")}:** \`${time != "..." ? `${format(time)}` : ctx.t("general:confirmPunishment.durationNotDetermined")}\`` : ""}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
    .setFooter(`${ctx.t("general:requestedBy")}: ${ctx.author.tag}`, ctx.author.displayAvatarURL({ dynamic: true }))
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