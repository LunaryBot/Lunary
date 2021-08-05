const { MessageEmbed } = require("discord.js")

let p = {
    ban: {
        cor: "RED",
        text: "Ban"
    }
}

module.exports = function message_modlogs(author, user, reason, type, t) {
    return new MessageEmbed()
    .setColor(p[type].cor)
    .setAuthor(`${p[type].text} | ${user.tag}`, user.displayAvatarURL({ dynamic: true, format: "png" }))
    .setDescription(`> <:Autor:816454125670891520> **Autor:** ${author.toString()} | **${author.username}**#${author.discriminator}(ID: ${author.id})\n> <:User:816454160991911988> **Usuário:** ${user.toString()} | **${user.username}**#${user.discriminator}(ID: ${user.id})`)
    .addField(`<:Motivo:816454218570792990> Motivo:`, `> ${reason}`.shorten(1024))
}