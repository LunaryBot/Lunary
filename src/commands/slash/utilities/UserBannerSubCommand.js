const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")
const Canvas = require("node-canvas")

module.exports = class UserBannerSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "banner",
            dirname: __dirname
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const userID = ctx.interaction.options.getString("user")?.replace(/<@!?(\d{18})>/, "$1")
        const user = (!userID || /^\d{18}$/.test(userID)) ? await this.client.api.users[userID || ctx.author.id].get().catch(() => {}) : null
        if(!user) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("general:invalidUser"), ctx.author)
            ]
        }).catch(() => {})
        
        if(!user.banner && !user.banner_color) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("user_banner:texts.userDoesNotHaveBanner", { user: `<@${user.id}>` }))
            ]
        })

        const embed = new Discord.MessageEmbed()
        .setAuthor(user.username, `https://cdn.discordapp.com/emojis/${this.client.config.devs.includes(user.id) ? "844347009543569449" : "832083303627620422"}.png?size=128`)
        .setColor(this.client.config.devs.includes(user.id) ? "#FFFAFA" : "#A020F0")

        const data = { embeds: [embed] }

        // let banner = "https://imgur.com/1uf9gqI.gif"
        if(user.banner) embed.setImage(`https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${`${user.banner}`.startsWith("a_") ? "gif" : "png"}?size=512`)
        else if (user.banner_color) {
            const canvas = Canvas.createCanvas(450, 180)
            const canvasCtx = canvas.getContext('2d')

            canvasCtx.beginPath()
            canvasCtx.rect(0, 0, 450, 180)
            canvasCtx.fillStyle = user.banner_color
            canvasCtx.fill()

            canvasCtx.font = '20px sans-serif';
            canvasCtx.fillStyle = '#ffffff';
            canvasCtx.fillText(`${user.banner_color}`, canvas.width - 90, canvas.height - 8);

            const banner = new Discord.MessageAttachment(canvas.toBuffer(), `${user.username}_color_banner.png`);
            embed.setImage(`attachment://${user.username}_color_banner.png`)
            data.files = [banner]
        }

        ctx.interaction.reply(data)
    }
}