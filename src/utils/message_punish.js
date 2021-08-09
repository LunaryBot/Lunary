const { MessageEmbed } = require("discord.js")

let p = {
    "ban": {
        text: "Usuário banido",
        image: "https://cdn.discordapp.com/emojis/818839929135956019.png?v=1"
    }
}

module.exports = function message_modlogs(author, user, reason, type, t, client) {
    return new MessageEmbed()
    .setColor("#FF0000")
    .setAuthor(p[type].text, p[type].image)
    .setDescription([
        `**<:User:816454160991911988>•Informações do usuário:**`,
        `>  **Nome:** \`${user.tag}\``,
        `>  **ID:** \`${user.id}\``,
        `**<:Autor:816454125670891520>•Informações do autor:**`,
        `>  **Nome:** \`${author.tag}\``,
        `>  **ID:** \`${author.id}\``
    ].join("\n"))
    .addField(`<:Motivo:816454218570792990>•Motivo:`, `>>>  ${reason}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png" }))
    .setTimestamp()
    .setFooter('Sistema de punição Lunar', client.user.displayAvatarURL({ dynamic: true, format: "png" }))
}