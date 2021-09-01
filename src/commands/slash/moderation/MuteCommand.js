const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const sydb = require("sydb")
const mutes = new sydb(__dirname + "/../../../data/mutes.json")
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
        if(time != "...") time = timeString(time)

        if(isNaN(time) || time == 0) return ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setDescription(`**${global.emojis.get("nop").mention} • ${ctx.t("geral/invalid_time")}**`)
                .setFooter(ctx.author.tag, ctx.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .setColor("#FF0000")
                .setTimestamp()
            ]
        })

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
                date: Date.now()
            }), 'ascii').toString('base64')
        }
    }
}