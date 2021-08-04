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

    let configs = db.ref(`Servidores/${ctx.guild.id}/Configs`).val() || {}

    let reason = ctx.args.get("reason")
    if(!reason) {
      if(configs.ReasonObr && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.reply({
        embeds: [
          new Discord.MessageEmbed()
          .setDescription(`**${t("reason_obr")}**`)
          .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
          .setColor("#FF0000")
          .setTimestamp()
        ]
      })
      else reason = t("reason_not_informed")
    }

    ctx.reply({
      content: reason
    })
  }
}