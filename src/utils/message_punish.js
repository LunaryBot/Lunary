const { MessageEmbed } = require("discord.js")
const { format } = require("./format_time")
const p = {
    "ban": {
        text: "banned"
    },
    "kick": {
        text: "kicked"
    },
    "adv": {
        text: "warned"
    }
}

module.exports = function message_modlogs(author, user, reason, type, t, client, gif, time) {
    type = p[type]

    const embed = new MessageEmbed()
    .setColor(13641511)
    .setAuthor(`${t(`default_message_punish/${type.text}_user`)}`, global.emojis.get("alert").url)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png" }))
    .addFields([
        {name: `${global.emojis.get("user").mention}${t(`default_message_punish/${type.text}_user`)}`, value: `${user.toString()}\n(\`${user.id}\`)`, inline: true},
        {name: `${global.emojis.get("author").mention}${t(`default_message_punish/${type.text}_by`)}`, value: `${author.toString()}\n(\`${author.id}\`)`, inline: true},
    ])
    
    if(time) embed.addField(`${global.emojis.get("time").mention}${t("default_message_punish/time")}`, `${format(time)}`)
    
    embed.addField(`${global.emojis.get("clipboard").mention}${t("default_message_punish/reason")}`, reason)
    
    if(gif) embed.image = gif

    return embed
}