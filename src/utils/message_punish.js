const { MessageEmbed } = require("discord.js")
const p = {
    "ban": {
        text: "Usuário banido",
        image: "https://cdn.discordapp.com/emojis/818839929135956019.png?v=1"
    }
}

module.exports = function message_modlogs(author, user, reason, type, t, client) {
    return new MessageEmbed()
    .setColor(13641511)
    .setAuthor(p[type].text, p[type].image)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png" }))
    .addFields([
        {name: `${t()}`, value: ``, inline: true},
        {name: ``, value: ``, inline: true},
    ])
}