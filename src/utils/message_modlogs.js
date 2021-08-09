const { MessageEmbed } = require("discord.js")

let p = {
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
    .setDescription(`> <:Autor:816454125670891520> **Autor:** ${author.toString()} (\`${author.id}\`)\n> <:User:816454160991911988> **Usuário:** ${user.toString()} (\`${user.id}\`)`)
    .addField(`<:Motivo:816454218570792990> Motivo:`, `>>> **\`${reason.shorten(1010)}\`**`, false)
    .setFooter("ID: 1ecddd2c-2564-4fac-90c8-e50b1a710080")
    .setTimestamp()
}