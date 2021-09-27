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
        const userID = `${ctx.interaction.options.getString("user")}`.replace(/<@!?(\d{18})>/, "$1")
        const user = /^\d{18}$/.test(userID) ? await this.client.users.fetch(userID).catch(() => {}) : null
        
        if(!user) return await ctx.interaction.reply({
            embeds: [
                this.sendError(ctx.t("general:invalidUser"), ctx.author)
            ]
        }).catch(() => {})

        const avatar = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 });
        
        await ctx.interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setImage(avatar)
                .setTitle(`:frame_photo: ${user.tag}`)
            ]
        })
    }
}