const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

module.exports = class CleanCommand extends Command {
    constructor(client) {
        super({
            name: "clean",
            dirname: __dirname,
            permissions: {
                Discord: ["MANAGE_MESSAGES"],
                Lunar: ["MANAGE_MESSAGES"]
            }
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        ctx.interaction.deferReply({ ephemeral: true }).catch(() => {})

        const amount = Math.floor(ctx.interaction.options.getNumber("amount"))
        if(!amount || isNaN(amount) || amount > 500 || amount < 2) return ctx.interaction.followUp({
            embeds: [
                this.sendError(ctx.t("clean:texts.invalidAmount"), ctx.author)
            ]
        })

        const userID = ctx.interaction.options.getString("user")?.replace(/<@!?(\d{18})>/, "$1")

        let deletes = 0
        let _amount = amount
        for(let i = 0; _amount != 0; i++) {
            let ss = 100
            if(_amount < 100) {
                ss = _amount
                _amount = _amount - ss
            } else _amount = _amount - 100

            /**
             * @type {Discord.Collection<Discord.Message>}
             */
            let msgs = await ctx.channel.messages.fetch({
                limit: ss
            })

            msgs = msgs.filter(msg => Date.now() - msg.createdTimestamp < (14 * 1000 * 60 * 60 * 24) && !msg.pinned && (userID ? userID == msg.author.id : true))
            const messagesD = await ctx.channel.bulkDelete(msgs).catch(() => {})
            deletes += messagesD.size || 0
            if(ss != messagesD.size) break;
        }

        if(deletes == 0) return ctx.interaction.followUp({
            embeds: [
                this.sendError(ctx.t("clean:texts.noMessagesFound"), ctx.author)
            ]
        }).catch(() => {})

        ctx.interaction.followUp({
            content: `${ctx.t("clean:texts.messagesDelete", { channel: ctx.channel.toString(), size: deletes })}${deletes != amount ? "\n" + ctx.t("clean:texts.faliedDeletingMessages", { size: amount - deletes }) + " :woman_shrugging:" : ""}`
        }).catch(() => {})
    }
}