const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("../../../lib")

module.exports = class AboutmeCommand extends Command {
    constructor(client) {
        super({
            name: "aboutme",
            dirname: __dirname,
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const text = ctx.interaction.options.getString("text");
        
        this.client.UsersDB.ref(`Users/${ctx.author.id}/aboutme`).set(text);

        ctx.interaction.reply(ctx.t('aboutme:texts.success', {
            author: ctx.author.toString(),
        }));
    }
}