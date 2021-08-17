const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const confirm_punish = require("../../../utils/confirm_punish")
const highest_position = require("../../../utils/highest_position")

module.exports = class NameCommand extends Command {
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
            },
            dm: false
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const user = await ctx.interaction.options.getUser("user") || await this.client.users.fetch(ctx.interaction.options.getString("user-id")).catch(() => {})

        if(!user) return await ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**<:NaoRed:818109994112516136> • ${ctx.t("geral/user_not_found")}**`)
                .setFooter(ctx.interaction.user.tag, ctx.interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

        let reason = ctx.interaction.options.getString("reason")
        if(!reason) {
            if(ctx.GuildDB.configs.has("MANDATORY_REASON") && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.interaction.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setDescription(`**<:NaoRed:818109994112516136> • ${ctx.t("geral/reason_obr")}**`)
                    .setFooter(ctx.interaction.user.tag, ctx.interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                    .setColor("#FF0000")
                    .setTimestamp()
                ]
            })
            else reason = ctx.t("geral/reason_not_informed")
        }

        const membro = await ctx.interaction.guild.members.fetch(user.id)
        if(membro) {
            // if(!membro.bannable) return await ctx.interaction.reply({
            //   embeds: [
            //     new Discord.MessageEmbed()
            //     .setDescription(`**<:NaoRed:818109994112516136> • ${ctx.t("geral/not_punishable")}**`)
            //     .setFooter(ctx.interaction.user.tag, ctx.interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
            //     .setColor("#FF0000")
            //     .setTimestamp()
            //   ]
            // })
            
            if(!highest_position(ctx.interaction.member, membro)) return await ctx.interaction.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setDescription(`**<:NaoRed:818109994112516136> • ${ctx.t("geral/highest_position")}**`)
                    .setFooter(ctx.interaction.user.tag, ctx.interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                    .setColor("#FF0000")
                    .setTimestamp()
                ]
            })
        }

        if(reason > 450) return ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**<:NaoRed:818109994112516136> • ${ctx.t("geral/very_big_reason")}**`)
                .setFooter(ctx.interaction.user.tag, ctx.interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

        if(!ctx.UserDB.configs.has("QUICK_PUNISHMENT")) {
            await ctx.interaction.reply(confirm_punish(ctx, user, reason))

            const msg = await ctx.interaction.fetchReply()
            
            const colletor = msg.createMessageComponentCollector((c => ["confirm_punish", "cancel_punish"].includes(c.customId) && c.user.id == ctx.message.author.id), { time: 1 * 1000 * 60, max: 1 })

            colletor.on("collect", async c => {
                await c.deferUpdate().catch(() => {})
                if(c.customId != "confirm_punish") return ctx.interaction.deleteReply()

                ctx.interaction.editReply(await ban())
            })
        } else ctx.interaction.reply(await ban())

        async function ban() {
            let notifyDM = true
            try {
                if(membro && ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("default_dm_messages_punish/ban", {
                    emoji: ":hammer:",
                    guild_name: ctx.guild.name,
                    reason: reason
                }))
            } catch(_) {
                notifyDM = false
            }

            

            return {
                content: "Calma"
            }
        }
    }
}