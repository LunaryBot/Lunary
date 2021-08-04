const Command = require("../../structures/Command")
const Discord = require("discord.js")

module.exports = class CleanCommand extends Command {
  constructor(client) {
    super({
      name: "ban",
      description: "Bane um usuário do servidor.",
      category: "moderation",
      dirname: __dirname,
      permissions: {
        Discord: ["BAN_MEMBERS"],
        Bot: ["LUNAR_BAN_MEMBERS"],
        Lunar: ["BAN_MEMBERS"]
      }
    }, client)
  }

  async run(ctx, t, db) {
    let user = await this.client.users.fetch(ctx.args.get("user") || ctx.args.get("user-id")).catch(() => {})

    if(!user) return ctx.reply({
      embeds: [
        new Discord.MessageEmbed()
        .setDescription(`**${t("user_not_found")}**`)
        .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setColor("#FF0000")
        .setTimestamp()
      ]
    })

    ctx.reply({
      content: "A"
    })
  }
}