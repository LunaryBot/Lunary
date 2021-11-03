const SubCommand = require("../../../structures/SubCommand.js")
const ContextCommand = require("../../../structures/ContextCommand.js")
const Discord = require("../../../lib")

module.exports = class AdvListSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "list",
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

        const user = ctx.interaction.options.getUser("user") || ctx.author

        if(!user) return await ctx.interaction.followUp({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getString("user") })
        }).catch(() => {})
        
        let logs = await ctx.client.LogsDB.ref().once("value")
        logs = Object.entries(logs.val() || {}).map(function([k, v]) {
            const data = JSON.parse(Buffer.from(v, 'base64').toString('ascii'))
            data.id = k
            return data
        }).filter(x => x.server == ctx.guild.id)

        const advs = logs.filter(x => x.user == user.id && x.type == 4)?.sort((a, b) => b.date - a.date)
        if(!advs.length) return ctx.interaction.followUp({
            embeds: [
                this.sendError(ctx.t("adv_remove:texts.noWarning"), ctx.author)
            ]
        }).catch(() => {})
        let text = ""

        for(let i = 0; i < advs.length; i++) {
            const adv = advs[i]
            text += `\n- [${adv.id}][${data(adv.date)}] (${await this.client.users.fetch(adv.author).then(user => user.tag).catch(() => {})}/${adv.user}): ${decodeURI(adv.reason)}`
        }
        
        const embed = new Discord.MessageEmbed()
        .setAuthor(`Advertências de ${user.tag}`, user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
        .setColor("YELLOW")
        .setDescription(`\`\`\`diff\n${text}\`\`\``)

        ctx.interaction.followUp({
            embeds: [embed]
        }).catch(() => {})
    }
}

function data(a) {
    let data = new Date(a)
    const ano = data.getFullYear()
    let m = data.getMonth() + 1
    if(m < 10) m = "0" + m
    let d = data.getDate()
    if(d < 10) d = "0" + d
    data.setHours(data.getHours() - 3)
    let h = data.getUTCHours()
    if(h < 10) h = "0" + h
    let min = data.getMinutes()
    if(min < 10) min = "0" + min
    return `${d}/${m}/${ano} - ${h}:${min}`
}