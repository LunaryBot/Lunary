const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

module.exports = class LuasCommand extends Command {
    constructor(client) {
        super({
            name: "luas",
            dirname: __dirname
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const user = ctx.interaction.options.getUser('user') || ctx.author;
        const luasAmount = user.id == ctx.author.id ? ctx.UserDB.luas : ctx.UsersDB.ref(`Users/${user.id}/luas`).val();

        ctx.interaction.reply({
            content: ctx.t(`luas:texts.${user.id == ctx.author.id ? "author" : "user"}Luas`, {
                author: ctx.author.toString(),
                user: user.toString(),
                luasAmount: luasAmount
            }),
            allowedMentions: {
                user: true
            }
        })
    }
}