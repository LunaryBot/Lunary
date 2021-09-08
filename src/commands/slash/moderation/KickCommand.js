const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const {message_modlogs, message_punish, randomCharacters, ObjRef, highest_position, confirm_punish} = require("../../../utils/index")

module.exports = class KickCommand extends Command {
    constructor(client) {
        super({
            name: "kick",
            description: "Expulsa um usuário do servidor.",
            category: "moderation",
            dirname: __dirname,
            permissions: {
                Discord: ["KICK_MEMBERS"],
                Bot: ["LUNAR_KICK_MEMBERS"],
                Lunar: ["KICK_MEMBERS"]
            },
            dm: false
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const user = await ctx.interaction.options.getMember("user") || await ctx.guild.members.fetch(ctx.interaction.options.getString("user-id")).catch(() => {})

        if(!user) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("geral/user_not_found"), ctx.author)
            ]
        })

        let reason = ctx.interaction.options.getString("reason")
        if(!reason) {
            if(ctx.GuildDB.configs.has("MANDATORY_REASON") && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("geral/reason_obr"), ctx.author)
                ]
            })
            else reason = ctx.t("geral/reason_not_informed")
        }

        if(!user.kickable) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("geral/not_punishable"), ctx.author)
            ]
        })
            
        if(!highest_position(ctx.member, user)) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("geral/highest_position"), ctx.author)
            ]
        })

        if(reason > 400) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("geral/very_big_reason"), ctx.author)
            ]
        })

        if(!ctx.UserDB.configs.has("QUICK_PUNISHMENT")) {
            await ctx.interaction.reply(confirm_punish(ctx, user.user, reason))

            const msg = await ctx.interaction.fetchReply()
            
            const filter = c => ["confirm_punish", "cancel_punish"].includes(c.customId) && c.user.id == ctx.author.id
            const colletor = msg.createMessageComponentCollector({ filter, time: 1 * 1000 * 60, max: 1, errors: ["time"] })

            colletor.on("collect", async c => {
                await c.deferUpdate().catch(() => {})
                if(c.customId != "confirm_punish") return ctx.interaction.deleteReply().catch(() => {})

                let _kick = await kick()
                ctx.interaction.editReply(_kick).catch(() => {})
            })
            colletor.on("end", () => {
                if(!colletor.endReason) return ctx.interaction.deleteReply().catch(() => {})
            })
        } else {
            let kick = await kick()
            ctx.interaction.reply(_kick).catch(() => {})
        }

        async function kick() {
            if(!user.kickable) return {
                embeds: [
                    this.sendError(ctx.t("geral/not_punishable"), ctx.author)
                ]
            }
            let notifyDM = true
            try {
                if(ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("default_dm_messages_punish/kick", {
                    emoji: ":hiking_boot:",
                    guild_name: ctx.guild.name,
                    reason: reason
                }))
            } catch(_) {
                notifyDM = false
            }

            let logs = await ctx.client.LogsDB.ref().once("value")
            logs = logs.val() || {}
            logs = new ObjRef(logs)

            let id
            
            for(let i; ;i++) {
                id = `${randomCharacters(8)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(10)}`.toLowerCase()
                if(!logs.ref(id).val()) break;
            }

            await user.kick(ctx.t("geral/punished_by", {
                author_tag: ctx.author.tag,
                reason: reason,
                id: id
            }).shorten(512))


            const log = Buffer.from(JSON.stringify({
                type: 2,
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
                    message_punish(ctx.author, user.user, reason, "kick", ctx.t, ctx.client, ctx.UserDB.gifs.kick)
                ]
            })
            const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
            if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
                embeds: [
                    message_modlogs(ctx.author, user.user, reason, "kick", ctx.t, id)
                ]
            })

            return {
                content: `:tada: ─ ${ctx.t("default_message_punish/sucess_punish", {
                    author_mention: ctx.author.toString(),
                    user_mention: user.toString(),
                    user_tag: user.user.tag,
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