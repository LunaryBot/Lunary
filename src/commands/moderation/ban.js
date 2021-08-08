const Command = require("../../structures/Command")
const Discord = require("discord.js")
const MessageButton = require("../../structures/components/MessageButton")
const MessageActionRow = require("../../structures/components/MessageActionRow")
const message_modlogs = require("../../utils/message_modlogs")
const ObjRef = require("../../utils/objref/ObjRef")
const ButtonCollector = require("../../structures/components/MessageButtonCollector")

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

  /** 
  * @param {Discord.CommandInteraction} interaction
  * @param {ObjRef} t
  * @param {ObjRef} db
  */

  async run(interaction, t, db) {
    const user = await interaction.options.getUser("user") || await this.client.users.fetch(interaction.options.getString("user-id")).catch(() => {})

    if(!user) return interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
        .setDescription(`**${t("user_not_found")}**`)
        .setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setColor("#FF0000")
        .setTimestamp()
      ]
    })

    let configs = db.ref(`Servidores/${interaction.guild.id}/Configs`).val() || {}

    let reason = interaction.options.getString("reason")
    if(!reason) {
      if(configs.ReasonObr && !interaction.member.botpermissions.has("LUNAR_NOT_REASON")) return interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
          .setDescription(`**${t("reason_obr")}**`)
          .setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
          .setColor("#FF0000")
          .setTimestamp()
        ]
      })
      else reason = t("reason_not_informed")
    }

    const membro = interaction.guild.members.cache.get(user.id)
    if(membro) {
      // if(!membro.bannable) return interaction.reply({
      //   embeds: [
      //     new Discord.MessageEmbed()
      //     .setDescription(`**${t("not_punishable")}**`)
      //     .setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
      //     .setColor("#FF0000")
      //     .setTimestamp()
      //   ]
      // })

      if(interaction.member.roles.highest.position <=  membro.roles.highest.position && interaction.user.id != interaction.guild.ownerID) return interaction.reply({
        embeds: [
          new Discord.MessageEmbed()
          .setDescription(`**${t("highest_position")}**`)
          .setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
          .setColor("#FF0000")
          .setTimestamp()
        ]
      })
    }

    if(reason > 450) return interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
        .setDescription(`**${t("very_big_reason")}**`)
        .setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setColor("#FF0000")
        .setTimestamp()
      ]
    })

    interaction.reply({
      embeds: [
        new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle("(<a:AlertRed:829429780155858974>) Confirme a punição a seguir:")
        .addField(`<:User:816454160991911988> │ Usuário a ser Banido:`, [
          `> _  _**Menção:** ${user.toString()}`,
          `> _  _**Tag:** \`${user.tag}\``,
          `> _  _**ID:** \`${user.id}\``
        ].join("\n"))
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

    let msg = await interaction.fetchReply()

    let coletor = new ButtonCollector(msg, {
      user: interaction.user,
      time: 1 * 1000 * 60,
      max: 1
    })

    coletor.on("collect", async button => {
      if(button.id == "confirm_punish") {
        let notifyDM = true
        try {
        if(membro && interaction.options.get("notify-dm") != false) await user.send(t("default_message_punish", {
          emoji: ":hammer:",
          guild_name: interaction.guild.name,
          punish: "banido de",
          reason: reason
        }))
        } catch(_) {
          notifyDM = false
        }

        await interaction.guild.members.ban(user.id, {reason: t("punished_by", {
          punish: "Banido",
          author_tag: interaction.user.tag,
          reason: reason
        })})

        interaction.channel.send(new Discord.MessageEmbed()
          .setColor("#A020F0")
          .setDescription(`<:Hammer:842549266480234516>・**_${interaction.user.toString()}, ${user.toString()} foi banido com sucesso!_**${(notifyDM == false) ? `\nNão foi possivel notificalo via dm.` : ""}`)
          .setFooter('Sistema de punição Lunar | Muito obrigado por me escolher para punir este membro!', this.client.user.displayAvatarURL({ dynamic: true, format: "png" }))
        )

        let channel_modlogs = interaction.guild.channels.cache.get(configs.ChatModLogs)
        if(channel_modlogs && channel_modlogs.permissionsFor(this.client.user.id).has(18432)) channel_modlogs.send(message_modlogs(interaction.user, user, reason, "ban"))
        
      }
    })

    coletor.on("end", () => {
      msg.delete().catch(() => {})
    })
  }
}