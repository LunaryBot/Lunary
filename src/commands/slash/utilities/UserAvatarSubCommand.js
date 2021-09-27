const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

module.exports = class UserAvatarSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "avatar",
            dirname: __dirname
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const userID = ctx.interaction.options.getString("user")?.replace(/<@!?(\d{18})>/, "$1")
        const user = !userID || userID == ctx.author.id ? ctx.author : (/^\d{18}$/.test(userID) ? await this.client.users.fetch(userID).catch(() => {}) : null)  
        
        if(!user) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("general:invalidUser"), ctx.author)
            ]
        }).catch(() => {})

        const avatar = user.displayAvatarURL({ dynamic: true, format: "png" });
        
        await ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setAuthor(user.username, `https://cdn.discordapp.com/emojis/${this.client.config.devs.includes(user.id) ? "844347009543569449" : "832083303627620422"}.png?size=128`)
                .setDescription(`${asl(128)} | ${asl(256)} | ${asl(512)} | ${asl(1024)} | ${asl(2048)}`)
                .setImage(avatar + "?size=1024")
                .setColor(this.client.config.devs.includes(user.id) ? "#FFFAFA" : "#A020F0")
            ],
            components: [
                new Discord.MessageActionRow()
                .addComponents([
                    new Discord.MessageButton()
                    .setStyle("LINK")
                    .setURL(avatar + "?size=1024")
                    .setLabel(ctx.t("user_avatar:texts.downloadImage"))
                ])
            ]
        })
        
        function asl(size) {
            return `[x${size}](${avatar}?size=${size})`
        }
    }
}