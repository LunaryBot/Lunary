const Command = require("../../structures/Command")
const Discord = require("discord.js")
const MessageButton = require("../../structures/components/MessageButton")
const MessageActionRow = require("../../structures/components/MessageActionRow")

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
    const user = await this.client.users.fetch(ctx.args.get("user") || ctx.args.get("user-id")).catch(() => {})

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

    const membro = ctx.guild.members.cache.get(user.id)
    if(membro) {
      // if(!membro.bannable) return ctx.reply({
      //   embeds: [
      //     new Discord.MessageEmbed()
      //     .setDescription(`**${t("not_punishable")}**`)
      //     .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
      //     .setColor("#FF0000")
      //     .setTimestamp()
      //   ]
      // })

      if(ctx.member.roles.highest.position <=  membro.roles.highest.position && ctx.author.id != ctx.guild.ownerID) return ctx.reply({
        embeds: [
          new Discord.MessageEmbed()
          .setDescription(`**${t("highest_position")}**`)
          .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
          .setColor("#FF0000")
          .setTimestamp()
        ]
      })
    }

    if(reason > 450) return ctx.reply({
      embeds: [
        new Discord.MessageEmbed()
        .setDescription(`**${t("very_big_reason")}**`)
        .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setColor("#FF0000")
        .setTimestamp()
      ]
    })

    let msg = await ctx.reply({
      embeds: [
        new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle("(<a:AlertRed:829429780155858974>) Confirme a punição a seguir:")
        .addField(`<:User:816454160991911988> │ Usuário a ser Banido:`, [
          `> _  _**Menção:** ${user.toString()}`,
          `> _  _**Tag:** \`${user.tag}\``,
          `> _  _**ID:** \`${user.id}\``
        ])
        .addField(`<:Motivo:816454218570792990> │ Motivo:`, `ㅤ${reason}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
      ],
      components: [
        new MessageActionRow()
        .addComponent(
          new MessageButton()
          .setID("confirm_punish")
          .setStyle("green")
          .setEmoji("872635474798346241")
        )
        .addComponent(
          new MessageButton()
          .setID("cancel_punish")
          .setStyle("red")
          .setEmoji("872635598660313148")
        )
      ]
    })

    let coletor = msg.createButtonCollector({
      user: ctx.author,
      time: 1 * 1000 * 60,
      max: 1
    })

    coletor.on("collect", async button => {
      
      let notifyDM = true
      if(button.id == "confirm_punish") {
        try {
        if(membro && ctx.args.get("notify-dm") != false) await user.send(t("default_message_punish", {
          emoji: ":hammer:",
          guild_name: ctx.guild.name,
          punish: "banido de",
          reason: reason
        }))
        } catch(_) {
          notifyDM = false
        }

        await ctx.guild.members.ban(user.id, {reason: t("punished_by", {
          punish: "Banido",
          author_tag: ctx.author.tag,
          reason: reason
        })})

        ctx.channel.send(new Discord.MessageEmbed()
        .setColor("#A020F0")
        .setDescription(`<:Hammer:842549266480234516>・**_${ctx.author.toString()}, ${user.toString()} foi banido com sucesso!_**${(notifyDM == false) ? `\nNão foi possivel notificalo via dm.` : ""}`)
        .setFooter('Sistema de punição Lunar | Muito obrigado por me escolher para punir este membro!', this.client.user.displayAvatarURL({ dynamic: true, format: "png" }))
        )
      }
    })

    coletor.on("end", () => {
      msg.delete().catch(() => {})
    })
  }
}