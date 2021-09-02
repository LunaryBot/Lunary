const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const sydb = require("sydb")
const mutesdb = new sydb(__dirname + "/../../../data/mutes.json")
const {message_modlogs, message_punish, randomCharacters, ObjRef, highest_position, confirm_punish, timeString, format_time: {format}} = require("../../../utils/index")

module.exports = class NameCommand extends Command {
    constructor(client) {
        super({
            name: "mute",
            description: "Silencia um usuário por um período de tempo determinado no servidor.",
            category: "moderation",
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
        const user = await ctx.interaction.options.getMember("user") || await ctx.guild.members.fetch(ctx.interaction.options.getString("user-id")).catch(() => {})

        if(!user) return await ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("geral/user_not_found")}**`)
                .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

        let reason = ctx.interaction.options.getString("reason")
        if(!reason) {
            if(ctx.GuildDB.configs.has("MANDATORY_REASON") && !ctx.member.botpermissions.has("LUNAR_NOT_REASON")) return ctx.interaction.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("geral/reason_obr")}**`)
                    .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                    .setColor("#FF0000")
                    .setTimestamp()
                ]
            })
            else reason = ctx.t("geral/reason_not_informed")
        }

        // if(!highest_position(ctx.me, user)) return await ctx.interaction.reply({
        //     embeds: [
        //         new Discord.MessageEmbed()
        //         .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("geral/not_punishable")}**`)
        //         .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        //         .setColor("#FF0000")
        //         .setTimestamp()
        //     ]
        // })
            
        if(!highest_position(ctx.member, user)) return await ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("geral/highest_position")}**`)
                .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

        if(reason > 450) return ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("geral/very_big_reason")}**`)
                .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

        let time = ctx.interaction.options.getString("time") || "..."
        if(time != "...") {
            time = timeString(time)
            if(isNaN(time) || time == 0) return ctx.interaction.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("mute/invalid_time")}**`)
                    .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                    .setColor("#FF0000")
                    .setTimestamp()
                ]
            })
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
                reason: 'Cargo de mute',
            })
            this.client.db.ref(`Servers/${ctx.guild.id}/`).update({muterole: muterole.id})
        }

        if(muterole && ctx.guild.roles.cache.get(muterole.id).position >= ctx.guild.me.roles.highest.position) return ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("mute/manager_position")}**`)
                .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

        if(muterole && user.roles.cache.has(muterole.id)) return ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("mute/user_muted")}**`)
                .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

        if(!ctx.UserDB.configs.has("QUICK_PUNISHMENT")) {
            await ctx.interaction.reply(confirm_punish(ctx, user.user, reason, time))

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
                    new Discord.MessageEmbed()
                    .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("geral/not_punishable")}**`)
                    .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                    .setColor("#FF0000")
                    .setTimestamp()
                ]
            }
            let notifyDM = true
            try {
                if(ctx.interaction.options.getBoolean("notify-dm") != false) await user.send(ctx.t("default_dm_messages_punish/mute", {
                    emoji: ":mute:",
                    guild_name: ctx.guild.name,
                    reason: reason,
                    time: time != "..." ? format(time) : ctx.t("geral/not_determined")
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
                type: 4,
                author: ctx.author.id,
                user: user.id,
                server: ctx.guild.id,
                reason: encodeURI(reason),
                date: Date.now(),
                time: time
            }), 'ascii').toString('base64')
            
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

            const channel_punish = ctx.guild.channels.cache.get(ctx.GuildDB.chat_punish)
            if(channel_punish && channel_punish.permissionsFor(ctx.client.user.id).has(18432)) channel_punish.send({
                embeds: [
                    message_punish(ctx.author, user.user, reason, "mute", ctx.t, ctx.client, ctx.UserDB.gifs.mute, time)
                ]
            })
            const channel_modlogs = ctx.guild.channels.cache.get(ctx.GuildDB.chat_modlogs)
            if(channel_modlogs && channel_modlogs.permissionsFor(ctx.client.user.id).has(18432)) channel_modlogs.send({
                embeds: [
                    message_modlogs(ctx.author, user.user, reason, "mute", ctx.t, id, time)
                ]
            })

            if(time != "...") {
                const timeout = setTimeout(() => ctx.client.emit("muteEnd", data), time)
                ctx.client.mutes.set(`${ctx.guild.id}_${user.id}`, timeout)
            }

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