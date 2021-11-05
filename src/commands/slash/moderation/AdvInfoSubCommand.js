const SubCommand = require("../../../structures/SubCommand.js")
const ContextCommand = require("../../../structures/ContextCommand.js")
const Discord = require("../../../lib")
const advRegex = /^.{8}-.{4}-.{4}-.{4}-.{10}$/i

module.exports = class AdvInfoSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "info",
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
            content: ctx.t("adv_info:texts.warningNotFound", { id: id.replace(/`/g, "") })
        }).catch(() => {})

        let adv = await this.client.LogsDB.ref(id).once("value")
        adv = adv.val()

        if(adv) adv = JSON.parse(Buffer.from(adv, 'base64').toString('ascii'))

        if(!adv || adv.server != ctx.guild.id || adv.type != 4) return ctx.interaction.followUp({
            content: ctx.t("adv_info:texts.warningNotFound", { id: id.replace(/`/g, "") })
        }).catch(() => {})

        const components = new Discord.MessageActionRow()
        .addComponents([
            new Discord.MessageButton()
            .setCustomId("adv-remove")
            .setEmoji("905969547801165834")
            .setLabel(ctx.t("adv_info:texts.buttons.remove"))
            .setStyle("DANGER"),
            new Discord.MessageButton()
            .setCustomId("adv-edit")
            .setEmoji("905968459362492456")
            .setLabel(ctx.t("adv_info:texts.buttons.edit"))
            .setStyle("SECONDARY")
        ])

        const embed = new Discord.MessageEmbed()

        ctx.interaction.followUp({
            embeds: [embed],
            components: [components]
        }).catch(() => {})
    }
}