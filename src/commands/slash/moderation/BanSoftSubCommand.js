const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("../../../lib")
const {message_modlogs, message_punish, randomCharacters, ObjRef, highest_position, confirm_punish} = require("../../../utils/index")

module.exports = class BanSoftSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "soft",
            dirname: __dirname,
            permissions: {
                Discord: ["BAN_MEMBERS"],
                Bot: ["LUNAR_BAN_MEMBERS"],
                me: ["BAN_MEMBERS"]
            },
            dm: false
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */
    async run(ctx) {
        const user = ctx.interaction.options.getUser("user")

        if(!user) return await ctx.interaction.reply({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getUser("user")?.id })
        }).catch(() => {})

        let reason = ctx.interaction.options.getString("reason")
        if(!reason) {
            if(ctx.GuildDB.configs.has("MANDATORY_REASON") && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("ban_soft:texts.mandatoryReason"), ctx.author)
                ]
            }).catch(() => {})
            else reason = ctx.t("ban_soft:texts.reasonNotInformed")
        }

        const membro = await ctx.interaction.guild.members.fetch(user.id).catch(() => {})
        if(membro) {
            if(!membro.bannable) return await ctx.interaction.reply({
              embeds: [
                this.sendError(ctx.t("general:lunyMissingPermissionsToPunish"), ctx.author)
              ]
            }).catch(() => {})
            
            if(!highest_position(ctx.interaction.member, membro)) return await ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("general:userMissingPermissionsToPunish"), ctx.author)
                ]
            }).catch(() => {})
        }

        if(reason > 400) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("ban_soft:veryBigReason"), ctx.author)
            ]
        }).catch(() => {})

        if(!ctx.UserDB.configs.has("QUICK_PUNISHMENT")) {
            await ctx.interaction.reply(confirm_punish(ctx, user, reason)).catch(() => {})

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
                    this.sendError(ctx.t("general:lunyMissingPermissionsToPunish"), ctx.author)
                ]
            }
            let notifyDM = true
            try {
                if(membro && ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("ban_soft:texts.default_dm_message", {
                    emoji: ":hammer:",
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

            await ctx.guild.members.ban(user.id, {reason: ctx.t("ban_soft:texts.punishedBy", {
                author_tag: ctx.author.tag,
                reason: reason,
                id: id
            }).shorten(512), days: 7})


            const log = Buffer.from(JSON.stringify({
                type: 1,
                author: ctx.author.id,
                user: user.id,
                server: ctx.guild.id,
                reason: encodeURI(reason),
                date: Date.now()
            }), 'ascii').toString('base64')

            ctx.client.LogsDB.ref(id).set(log)

            // const channel_punish = ctx.guild.channels.cache.get(ctx.GuildDB.chat_punish)
            // if(channel_punish && channel_punish.permissionsFor(ctx.client.user.id).has(18432n)) channel_punish.send({
            //     embeds: [
            //         message_punish(ctx.author, user, reason, "ban", ctx.t, ctx.client, ctx.UserDB.gifs.ban)
            //     ]
            // })
            const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
            if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
                embeds: [
                    message_modlogs(ctx.author, user, reason, "ban", ctx.t, id)
                ],
                components: [
                    new Discord.MessageActionRow()
                    .addComponents([
                        new Discord.MessageButton()
                        .setURL(`${ctx.client.config.links.website.baseURL}/dashboard/guilds/${ctx.guild.id}/modlogs?id=${id}/`)
                        .setLabel("Lunary logs(Beta)")
                        .setStyle("LINK")
                    ])
                ]
            }).catch(() => {})

            let xp = ctx.UserDB.xp
            if(membro) {
                if(ctx.UserDB.lastPunishmentApplied) {
                    if(!user.user.bot) {
                        if(user.id != ctx.author.id) {
                            if(
                                user.id != ctx.UserDB.lastPunishmentApplied.user 
                                || (user.id == ctx.UserDB.lastPunishmentApplied.user && ctx.UserDB.lastPunishmentApplied.type != 1)
                                || ((!isNaN(ctx.UserDB.lastPunishmentApplied.date) 
                                && user.id == ctx.UserDB.lastPunishmentApplied.user 
                                && (Date.now() - ctx.UserDB.lastPunishmentApplied.date) > 13 * 1000 * 60))
                            ) {
                                if(reason != ctx.UserDB.lastPunishmentApplied.reason && reason != ctx.t("ban_soft:texts.reasonNotInformed")) {
                                    xp += generateXP()
                                }
                            }
                        }
                    }
                } else xp += generateXP()
            }

            ctx.client.UsersDB.ref(`Users/${ctx.author.id}/`).update({lastPunishmentApplied: log, xp: xp, bans: ctx.UserDB.punishmentsApplied.bans + 1})

            function generateXP() {
                let maxXP = 39
                if(ctx.guild.rulesChannelId && reason.includes(`<#${ctx.guild.rulesChannelId}>`)) maxXP += 21
                else {
                    if(reason.replace(/<#\d{17,19}>/ig, "").trim().length > 12) maxXP += 6
                    if(/(.*?)<#\d{17,19}>(.*?)/ig.test(reason)) maxXP += 13
                }
                
                if(/https:\/\/(media|cdn)\.discordapp\.net\/attachments\/\d{17,19}\/\d{17,19}\/(.*)\.(jpge?|png|gif|apg|mp4)/ig.test(reason)) maxXP += 18

                const _xp = Math.floor(Math.random() * (maxXP - 21)) + 21
                console.log(`Max XP: ${maxXP} | XP: ${_xp}`)

                if(Number(`${((xp + _xp) / 1000)}`.charAt(0)) > Number(`${(xp / 1000)}`.charAt(0))) ctx.interaction.followUp({
                    content: ctx.t("general:levelUP", {level: Number(`${xp + _xp}`.charAt(0)), user: ctx.author.toString()}),
                    ephemeral: true
                }).catch(() => {})
                
                return _xp
            }

            return {
                content: `:tada: ─ ${ctx.t("general:successfullyPunished", {
                    author_mention: ctx.author.toString(),
                    user_mention: user.toString(),
                    user_tag: user.tag,
                    user_id: user.id,
                    id: id,
                    notifyDM: !notifyDM ? ctx.t("general:notNotifyDm") : "."
                })}`,
                embeds: [],
                components: []
            }
        }
    }
}