const SubCommand = require("../../../structures/SubCommand")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

module.exports = class BanInfoSubCommand extends SubCommand {
    constructor(client, mainCommand) {
        super({
            name: "info",
            description: "Mostra as informações do banimento de um usuário banido no servidor.",
            dirname: __dirname,
            permissions: {
                Discord: ["BAN_MEMBERS"],
                Bot: ["LUNAR_BAN_MEMBERS"],
                Lunar: ["BAN_MEMBERS"]
            },
            dm: false
        }, mainCommand, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const userRegex = ctx.interaction.options.getString("user") ?? /^\d{18}$|^.{0,32}#\d{4}$/.test(`${ctx.interaction.options.getString("user")}`.replace(/<@!?(\d{18})>/, "$1"))
        
        const bans = await ctx.guild.bans.fetch()

        const ban = bans.find(x => x.user.tag == userRegex || x.user.id == userRegex)
        if(!ban) return await ctx.interaction.reply({
            
        }).catch(() => {})

        console.log(ban.user)
    }
}