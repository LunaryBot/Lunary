const { MessageEmbed } = require("discord.js")
const p = {
    ban: {
        cor: "RED",
        text: "Ban"
    }
}

module.exports = function message_modlogs(author, user, reason, type, t, id) {
    return new MessageEmbed()
    .setColor(p[type].cor)
    .setThumbnail(author.displayAvatarURL({ dynamic: true, format: "png" }))
    .setAuthor(`${p[type].text} | ${user.tag}`, user.displayAvatarURL({ dynamic: true, format: "png" }))
    .setDescription(`> ${global.emojis.get("author").mention} **${t("default_message_modlog/author")}:** ${author.toString()} (\`${author.id}\`)\n> ${global.emojis.get("user").mention} **${t("default_message_modlog/user")}:** ${user.toString()} (\`${user.id}\`)`)
    .addField(`${global.emojis.get("clipboard").mention} ${t("default_message_modlog/reason")}:`, `>>> ${reason.shorten(1010)}`, false)
    .setFooter("ID: " + id)
    .setTimestamp()
}