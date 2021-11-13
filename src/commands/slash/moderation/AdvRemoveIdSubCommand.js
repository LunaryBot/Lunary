const SubCommand = require("../../../structures/SubCommand.js")
const ContextCommand = require("../../../structures/ContextCommand.js")
const Discord = require("../../../lib")
const advRegex = /^.{8}-.{4}-.{4}-.{4}-.{10}$/i

module.exports = class AdvRemoveIdSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "id",
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
        ctx.interaction.deferReply().catch(() => {})
        const id = ctx.interaction.options.getString("id")

        if(!advRegex.test(id)) return ctx.interaction.followUp({
            content: ctx.t("adv_remove_id:texts.warningNotFound", { id: id.replace(/`/g, "") })
        }).catch(() => {})

        let adv = await this.client.LogsDB.ref(id).once("value")
        adv = adv.val()

        if(adv) adv = JSON.parse(Buffer.from(adv, 'base64').toString('ascii'))

        if(!adv || adv.server != ctx.guild.id || adv.type != 4) return ctx.interaction.followUp({
            content: ctx.t("adv_remove_id:texts.warningNotFound", { id: id.replace(/`/g, "") })
        }).catch(() => {})

        const user = await this.client.users.fetch(adv.user).catch(() => {}) || { tag: ctx.t("adv_remove_id:texts.unkownUser") + "#0000", toString: () => `<@${adv.user}>`}

        await this.client.LogsDB.ref(id).remove()
        await ctx.interaction.followUp({
            content: ctx.t("adv_remove_id:texts.warningRemoved", { 
                id,
                author_mention: ctx.author.toString(),
                user_tag: user.tag,
                user_id: user.id
            })
        }).catch(() => {})
    }
}