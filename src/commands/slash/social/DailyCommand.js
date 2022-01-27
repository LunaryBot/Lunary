const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

module.exports = class LuasCommand extends Command {
    constructor(client) {
        super({
            name: "daily",
            dirname: __dirname
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        const now = new Date();
        const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const { lastDaily } = ctx.UserDB;

        if(lastDaily) {
            

            if(
                lastDaily.getFullYear() === now.getFullYear() &&
                lastDaily.getMonth() === now.getMonth() &&
                lastDaily.getDate() === now.getDate()
            ) {
                return ctx.interaction.reply({
                    content: ctx.t(`daily:texts.dailyCooldown`, {
                        getDailyDate: `<t:${Math.floor(nDate.getTime() /1000.0)}:R>`
                    })
                });
            };
        };

        let plan = this.client.config.premiumPlans[ctx.GuildDB.premium_type || "free"] || null;
        if(ctx.UserDB.premium_type && (!ctx.GuildDB.premium_type || ctx.GuildDB.premium_type < 3)) plan = this.client.premiumPlans["user"];
        
        let maxLuas = plan?.maxLuas || 3500; 
        
        const luas = (Math.floor(Math.random() * (maxLuas - 300 + 1)) + 300) * (Number(plan.multiple) || 1);

        this.client.UsersDB.ref(`Users/${ctx.author.id}`).set({
            lastDaily: Date.now(),
            luas: (ctx.UserDB.luas || 0) + luas
        });
        
        ctx.interaction.reply({
            content: ctx.t("daily:texts.dailyCollect", {
                author: ctx.author.toString(),
                dailyAmount: luas,
                nextDaily: `<t:${Math.floor(nDate.getTime() /1000.0)}:R>`,
                voteLink: this.client.config.links.vote
            })
        });
    }
}