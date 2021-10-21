const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("../../../lib")
const sydb = require("sydb")
const mutesdb = new sydb(__dirname + "/../../../data/mutes.json")
const {message_modlogs, message_punish, randomCharacters, ObjRef, highest_position, confirm_punish, timeString, format_time: {format}} = require("../../../utils/index")

module.exports = class NameCommand extends Command {
    constructor(client) {
        super({
            name: "mute",
            dirname: __dirname,
            permissions: {
                Discord: ["MUTE_MEMBERS"],
                Bot: ["LUNAR_MUTE_MEMBERS"],
                Lunar: ["MANAGE_CHANNELS", "MANAGE_ROLES"]
            },
            dm: false
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const userID = ctx.interaction.options.getString("user")?.replace(/<@!?(\d{17,19})>/, "$1")
        const user = this.utils.validateUser(userID) ? await ctx.guild.members.fetch(userID).catch(() => {}) : null

        if(!user) return await ctx.interaction.reply({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getString("user") })
        }).catch(() => {})

        let reason = ctx.interaction.options.getString("reason")
        if(!reason) {
            if(ctx.GuildDB.configs.has("MANDATORY_REASON") && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("mute:texts.mandatoryReason"), ctx.author)
                ]
            }).catch(() => {})
            else reason = ctx.t("mute:texts.reasonNotInformed")
        }

        if(!highest_position(ctx.me, user)) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("general:lunyMissingPermissionsToPunish"), ctx.author)
            ]
        }).catch(() => {})
            
        if(!highest_position(ctx.member, user)) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("general:userMissingPermissionsToPunish"), ctx.author)
            ]
        }).catch(() => {})

        if(reason > 400) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("general:veryBigReason"), ctx.author)
            ]
        }).catch(() => {})

        let time = ctx.interaction.options.getString("time") || "..."
        if(time != "...") {
            time = timeString(time)
            if(isNaN(time) || time == 0) return ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("mute:texts.invalidTime"), ctx.author)
                ]
            }).catch(() => {})
        }

        let muterole = ctx.guild.roles.cache.get(ctx.GuildDB.muterole)
        
        if(!muterole) {
            const muterolePerms = new Discord.Permissions()
    
            if(ctx.me.permissions.has("READ_MESSAGE_HISTORY")) muterolePerms.add("READ_MESSAGE_HISTORY")
            if(ctx.me.permissions.has("VIEW_CHANNEL")) muterolePerms.add("VIEW_CHANNEL")
            muterole = await ctx.guild.roles.create({
                data: {
                    name: '🔇>>Mutado-Lunar',
                    color: '#FFFAFA',
                    permissions: muterolePerms.bitfield,
                    hoist: true,
                    mentionable: false
                },
                reason: ctx.t("mute:texts.createMuterole"),
            })
            this.client.db.ref(`Servers/${ctx.guild.id}/`).update({muterole: muterole.id})
        }

        if(muterole && ctx.guild.roles.cache.get(muterole.id).position >= ctx.guild.me.roles.highest.position) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("mute:texts.lunyMissingPermissionsToManagerMuterole"), ctx.author)
            ]
        }).catch(() => {})

        if(muterole && user.roles.cache.has(muterole.id)) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("mute:texts.userMuted"), ctx.author)
            ]
        }).catch(() => {})

        if(!ctx.UserDB.configs.has("QUICK_PUNISHMENT")) {
            await ctx.interaction.reply(confirm_punish(ctx, user.user, reason, time)).catch(() => {})

            const msg = await ctx.interaction.fetchReply()
            
            const filter = c => ["confirm_punish", "cancel_punish"].includes(c.customId) && c.user.id == ctx.author.id
            const colletor = msg.createMessageComponentCollector({ filter, time: 1 * 1000 * 60, max: 1, errors: ["time"] })

            colletor.on("collect", async c => {
                await c.deferUpdate().catch(() => {})
                if(c.customId != "confirm_punish") return ctx.interaction.deleteReply().catch(() => {})

                const _mute = await mute()
                ctx.interaction.editReply(_mute).catch(() => {})
            })
            colletor.on("end", () => {
                if(!colletor.endReason) return ctx.interaction.deleteReply().catch(() => {})
            })
        } else {
            const _mute = await mute()
            ctx.interaction.reply(_mute).catch(() => {})
        }

        async function mute() {
            if(!highest_position(ctx.me, user)) return {
                embeds: [
                    this.sendError(ctx.t("general:texts.lunyMissingPermissionsToPunish"), ctx.author)
                ]
            }
            let notifyDM = true
            try {
                if(ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("mute:texts.default_dm_messages_punish", {
                    emoji: ":mute:",
                    guild_name: ctx.guild.name,
                    reason: reason,
                    time: time != "..." ? format(time) : ctx.t("general:durationNotDetermined")
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

            const end = time != "..." ? Date.now() + time : time
            const log = Buffer.from(JSON.stringify({
                type: 3,
                author: ctx.author.id,
                user: user.id,
                server: ctx.guild.id,
                reason: encodeURI(reason),
                date: Date.now(),
                time: time
            }), 'ascii').toString('base64')

            ctx.client.LogsDB.ref(id).set(log)
            
            const roles = user.roles.cache.filter(x => !x.managed && x.id != ctx.guild.id).map(x => x.id) || []
            
            const data = {
                user: user.id,
                server: ctx.guild.id,
                id: id,
                roles: roles,
                muterole: muterole.id,
                end: end
            }
            mutesdb.ref(`${ctx.guild.id}_${user.id}`).set(data)

            if(roles && roles.length) await user.roles.remove(roles).catch(() => {})

            await user.roles.add(muterole.id)

            // const channel_punish = ctx.guild.channels.cache.get(ctx.GuildDB.chat_punish)
            // if(channel_punish && channel_punish.permissionsFor(ctx.client.user.id).has(18432)) channel_punish.send({
            //     embeds: [
            //         message_punish(ctx.author, user.user, reason, "mute", ctx.t, ctx.client, ctx.UserDB.gifs.mute, time)
            //     ]
            // })
            const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
            if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
                embeds: [
                    message_modlogs(ctx.author, user.user, reason, "mute", ctx.t, id, time)
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

            if(time != "...") {
                const timeout = setTimeout(() => ctx.client.emit("muteEnd", data), time)
                ctx.client.mutes.set(`${ctx.guild.id}_${user.id}`, timeout)
            }

            let xp = ctx.UserDB.xp
            if(ctx.UserDB.lastPunishmentApplied) {
                if(!user.user.bot) {
                    if(user.id != ctx.author.id) {
                        if(time != "..." && time > 10 * 1000 * 60) {
                            if(
                                user.id != ctx.UserDB.lastPunishmentApplied.user 
                                || (user.id == ctx.UserDB.lastPunishmentApplied.user && ctx.UserDB.lastPunishmentApplied.type != 3)
                                || ((!isNaN(ctx.UserDB.lastPunishmentApplied.date) 
                                && user.id == ctx.UserDB.lastPunishmentApplied.user 
                                && (Date.now() - ctx.UserDB.lastPunishmentApplied.date) > 13 * 1000 * 60))
                            ) {
                                if(reason != ctx.UserDB.lastPunishmentApplied.reason && reason != ctx.t("adv:texts.reasonNotInformed")) {
                                    xp += generateXP()
                                }
                            }
                        }
                    }
                }
            } else xp += generateXP()

            ctx.client.UsersDB.ref(`Users/${ctx.author.id}/`).update({lastPunishmentApplied: log, xp: xp, advs: ctx.UserDB.punishmentsApplied.advs + 1})

            function generateXP() {
                let maxXP = 21
                if(ctx.guild.rulesChannelId && reason.includes(`<#${ctx.guild.rulesChannelId}>`)) maxXP += 17
                else {
                    if(reason.replace(/<#\d{17,19}>/ig, "").trim().length > 12) maxXP += 6
                    if(/(.*?)<#\d{17,19}>(.*?)/ig.test(reason)) maxXP += 13
                }
                
                if(/https:\/\/(media|cdn)\.discordapp\.net\/attachments\/\d{17,19}\/\d{17,19}\/(.*)\.(jpge?|png|gif|apg|mp4)/ig.test(reason)) maxXP += 18

                const _xp = Math.floor(Math.random() * maxXP) + 1
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