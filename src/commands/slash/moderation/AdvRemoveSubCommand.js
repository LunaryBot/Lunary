const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("../../../lib")

module.exports = class AdvRemoveSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "remove",
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
        const userID = ctx.interaction.options.getString("user")?.replace(/<@!?(\d{17,19})>/, "$1")
        const user = this.utils.validateUser(userID) ? await this.client.users.fetch(userID).catch(() => {}) : null

        if(!user) return await ctx.interaction.reply({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getString("user") })
        }).catch(() => {})

        let logs = await ctx.client.LogsDB.ref().once("value")
        logs = Object.entries(logs.val() || {}).map(function([k, v]) {
            const data = JSON.parse(Buffer.from(v, 'base64').toString('ascii'))
            data.id = k
            return data
        }).filter(x => x.server == ctx.guild.id)

        const advs = logs.filter(x => x.user == user.id && x.type == 4)
        if(!advs.length) return ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("adv_remove:texts.noWarning"), ctx.author)
            ]
        }).catch(() => {})

        await logs.forEach(x => ctx.client.LogsDB.ref(x.id).remove())

        await ctx.interaction.reply({
            content: `:white_check_mark: ─ ${ctx.t(`adv_remove:texts.deletedWarning${advs.length > 1 ? "s" : ""}`, {
                size: advs.length,
                user_tag: user.tag,
                user_id: user.id,
            })}`
        }).catch(() => {})
    }
}