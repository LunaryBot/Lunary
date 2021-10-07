const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const AdvRemoveSubCommand = require("./AdvRemoveSubcommand")
const {message_modlogs, message_punish, randomCharacters, ObjRef, confirm_punish} = require("../../../utils/index")

module.exports = class AdvCommand extends Command {
    constructor(client) {
        super({
            name: "adv",
            description: "Aplica uma advertência/aviso em um usuário do servidor.",
            category: "moderation",
            dirname: __dirname,
            permissions: {
                Discord: ["MANAGE_MESSAGES"],
                Bot: ["LUNAR_ADV_MEMBERS"]
            },
            dm: false
        }, client)

        this.subcommands = [new AdvRemoveSubCommand(client, this)]
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const user = await ctx.interaction.options.getMember("user") || await ctx.guild.members.fetch(ctx.interaction.options.getString("user-id")).catch(() => {})

        if(!user) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("general:invalidUser"), ctx.author)
            ]
        })

        let reason = ctx.interaction.options.getString("reason")
        if(!reason) {
            if(ctx.GuildDB.configs.has("MANDATORY_REASON") && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.interaction.reply({
                embeds: [
                    this.sendError(ctx.t("adv:texts.mandatoryReason"), ctx.author)
                ]
            })
            else reason = ctx.t("adv:texts.reasonNotInformed")
        }

        if(reason > 400) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("adv:veryBigReason"), ctx.author)
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

                const _adv = await adv()
                ctx.interaction.editReply(_adv).catch(() => {})
            })
            colletor.on("end", () => {
                if(!colletor.endReason) return ctx.interaction.deleteReply().catch(() => {})
            })
        } else {
            const _adv = await adv()
            ctx.interaction.reply(_adv).catch(() => {})
        }

        async function adv() {
            let logs = await ctx.client.LogsDB.ref().once("value")
            logs = logs.val() || {}
            logs = new ObjRef(logs)

            let id
            
            for(let i; ;i++) {
                id = `${randomCharacters(8)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(4)}-${randomCharacters(10)}`.toLowerCase()
                if(!logs.ref(id).val()) break;
            }

            const log = Buffer.from(JSON.stringify({
                type: 4,
                author: ctx.author.id,
                user: user.id,
                server: ctx.guild.id,
                reason: encodeURI(reason),
                date: Date.now(),
                id: id
            }), 'ascii').toString('base64')

            ctx.client.LogsDB.ref(id).set(log)

            let notifyDM = true
            try {
                if(ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("adv:texts.default_dm_message", {
                    emoji: ":hiking_boot:",
                    guild_name: ctx.guild.name,
                    reason: reason
                }))
            } catch(_) {
                notifyDM = false
            }

            // const channel_punish = ctx.guild.channels.cache.get(ctx.GuildDB.chat_punish)
            // if(channel_punish && channel_punish.permissionsFor(ctx.client.user.id).has(18432)) channel_punish.send({
            //     embeds: [
            //         message_punish(ctx.author, user.user, reason, "adv", ctx.t, ctx.client, ctx.UserDB.gifs.kick)
            //     ]
            // })
            const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
            if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
                embeds: [
                    message_modlogs(ctx.author, user.user, reason, "adv", ctx.t, id)
                ]
            })

            let xp = ctx.UserDB.xp
            if(ctx.UserDB.lastPunishment) {
                if(!user.user.bot) {
                    if(user.id == ctx.author || user.id != ctx.UserDB.lastPunishment.user || (user.id == ctx.UserDB.lastPunishment.user && ctx.UserDB.lastPunishment.type != 4)) {
                        if(reason != ctx.UserDB.lastPunishment.reason && reason != ctx.t("adv:texts.reasonNotInformed")) {
                            xp += generateXP()
                        }
                    }
                }
            } else xp += generateXP()
            ctx.client.UsersDB.ref(`Users/${ctx.author.id}/`).update({lastPunishment: log, xp: xp})

            function generateXP() {
                let maxXP = 39
                if(ctx.guild.rulesChannelId && reason.includes(`<#${ctx.guild.rulesChannelId}>`)) maxXP += 21
                else {
                    if(reason.replace(/<#\d{18}>/ig, "").trim().length > 12) maxXP += 6
                    if(/(.*?)<#\d{18}>(.*?)/ig.test(reason)) maxXP += 13
                }
                
                if(/https:\/\/(media|cdn)\.discordapp\.net\/attachments\/\d{18}\/\d{18}\/(.*)\.(jpge?|png|gif|apg|mp4)/ig.test(reason)) maxXP += 18

                const xp = Math.floor(Math.random() * (maxXP - 21)) + 21
                console.log(`Max XP: ${maxXP} | XP: ${xp}`)

                return xp
            }

            return {
                content: `:tada: ─ ${ctx.t("general:successfullyPunished", {
                    author_mention: ctx.author.toString(),
                    user_mention: user.toString(),
                    user_tag: user.user.tag,
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