const Command = require("../../../structures/Command.js")
const ContextCommand = require("../../../structures/ContextCommand.js")
const Discord = require("../../../lib")
const Canvas = require("node-canvas")

module.exports = class UserBannerCommand extends Command {
    constructor(client) {
        super({
            name: "User Banner",
            dirname: __dirname
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */
    async run(ctx) {
        const userID = ctx.interaction.options.getUser("user")?.id
        const user = await this.client.api.users[userID].get().catch(() => {})

        if(!user) return await ctx.interaction.reply({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getUser("user")?.id })
        }).catch(() => {})
        
        if(!user.banner && !user.banner_color) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("user_banner:texts.userDoesNotHaveBanner", { user: `<@${user.id}>` }))
            ]
        }).catch(() => {})

        const embed = new Discord.MessageEmbed()
        .setAuthor(user.username, `https://cdn.discordapp.com/emojis/${this.client.config.devs.includes(user.id) ? "844347009543569449" : "832083303627620422"}.png?size=128`)
        .setColor(this.client.config.devs.includes(user.id) ? "#FFFAFA" : "#A020F0")

        const data = { embeds: [embed] }

        if(user.banner) {
            const bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${`${user.banner}`.startsWith("a_") ? "gif" : "png"}?size=512`
            embed.setImage(bannerURL)
            data.components = [
                new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setStyle("LINK")
                    .setURL(bannerURL)
                    .setLabel(ctx.t("user_banner:texts.downloadImage"))
                ])
            ]
        }
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

        ctx.interaction.reply(data).catch(() => {})
    }
}