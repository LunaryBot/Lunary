const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

module.exports = class AdvRemoveSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "remove",
            description: "Remove as advertências/avisos de um usuário do servidor.",
            dirname: __dirname,
            permissions: {
                Discord: ["MANAGE_MESSAGES"],
                Bot: ["LUNAR_ADV_MEMBERS"]
            },
            dm: false
        }, mainCommand, client)
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

        let logs = await ctx.client.LogsDB.ref().once("value")
        logs = Object.entries(logs.val() || {}).map(function([k, v]) {
            const data = JSON.parse(Buffer.from(v, 'base64').toString('ascii'))
            data.id = k
            return data
        }).filter(x => x.server == ctx.guild.id)

        const advs = logs.filter(x => x.user == user.id && x.type == 4)
        if(!advs.length) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("adv_remove/no_warning"))
            ]
        })

        await logs.forEach(x => ctx.client.LogsDB.ref(x.id).remove())

        await ctx.interaction.reply({
            content: `${global.emojis.get("yep").mention} ${ctx.t(`adv_remove/deleted_warning${advs.length > 1 ? "s" : ""}`, {
                size: advs.length,
                user_tag: user.tag
            })}`
        })
    }
}