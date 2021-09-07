const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const BanInfoSubCommand = require("./BanInfoSubCommand")
const {message_modlogs, message_punish, randomCharacters, ObjRef, highest_position, confirm_punish} = require("../../../utils/index")

module.exports = class BanCommand extends Command {
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

        this.subcommands = [new BanInfoSubCommand(client, this)]
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const user = await ctx.interaction.options.getUser("user") || await this.client.users.fetch(ctx.interaction.options.getString("user-id")).catch(() => {})

        if(!user) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("geral/user_not_found"))
            ]
        })

        let reason = ctx.interaction.options.getString("reason")
        if(!reason) {
            if(ctx.GuildDB.configs.has("MANDATORY_REASON") && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("geral/reason_obr"))
                ]
            })
            else reason = ctx.t("geral/reason_not_informed")
        }

        const membro = await ctx.interaction.guild.members.fetch(user.id).catch(() => {})
        if(membro) {
            if(!membro.bannable) return await ctx.interaction.reply({
              embeds: [
                this.sendError(ctx.t("geral/not_punishable"))
              ]
            })
            
            if(!highest_position(ctx.interaction.member, membro)) return await ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("geral/highest_position"))
                ]
            })
        }

        if(reason > 450) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("geral/very_big_reason"))
            ]
        })

        if(!ctx.UserDB.configs.has("QUICK_PUNISHMENT")) {
            await ctx.interaction.reply(confirm_punish(ctx, user, reason))

            const msg = await ctx.interaction.fetchReply()
            
            const filter = c => ["confirm_punish", "cancel_punish"].includes(c.customId) && c.user.id == ctx.author.id
            const colletor = msg.createMessageComponentCollector({ filter, time: 1 * 1000 * 60, max: 1, errors: ["time"] })

            colletor.on("collect", async c => {
                await c.deferUpdate().catch(() => {})
                if(c.customId != "confirm_punish") return ctx.interaction.deleteReply().catch(() => {})

                const _ban = await ban()
                ctx.interaction.editReply(_ban).catch(() => {})
            })
            colletor.on("end", () => {
                if(!colletor.endReason) return ctx.interaction.deleteReply().catch(() => {})
            })
        } else {
            const _ban = await ban()
            ctx.interaction.reply(_ban).catch(() => {})
        }

        async function ban() {
            if(membro && !membro.bannable) return {
                embeds: [
                    this.sendError(ctx.t("geral/not_punishable"))
                ]
            }
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

            await ctx.guild.members.ban(user.id, {reason: ctx.t("geral/punished_by", {
                author_tag: ctx.author.tag,
                reason: reason
            })})

           let logs = await ctx.client.LogsDB.ref().once("value")
            logs = logs.val() || {}
            logs = new ObjRef(logs)

            let id
            
            for(let i; ;i++) {
                id = `${randomCharacters(8)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(10)}`.toLowerCase()
                if(!logs.ref(id).val()) break;
            }

            const log = Buffer.from(JSON.stringify({
                type: 1,
                author: ctx.author.id,
                user: user.id,
                server: ctx.guild.id,
                reason: encodeURI(reason),
                date: Date.now()
            }), 'ascii').toString('base64')

            ctx.client.LogsDB.ref(id).set(log)

            const channel_punish = ctx.guild.channels.cache.get(ctx.GuildDB.chat_punish)
            if(channel_punish && channel_punish.permissionsFor(ctx.client.user.id).has(18432)) channel_punish.send({
                embeds: [
                    message_punish(ctx.author, user, reason, "ban", ctx.t, ctx.client, ctx.UserDB.gifs.ban)
                ]
            })
            const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
            if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
                embeds: [
                    message_modlogs(ctx.author, user, reason, "ban", ctx.t, id)
                ]
            })

            return {
                content: `:tada: ─ ${ctx.t("default_message_punish/sucess_punish", {
                    author_mention: ctx.author.toString(),
                    user_mention: user.toString(),
                    user_tag: user.tag,
                    user_id: user.id,
                    id: id,
                    notifyDM: !notifyDM ? ctx.t("default_message_punish/not_notify_dm") : "."
                })}`,
                embeds: [],
                components: []
            }
        }
    }
}