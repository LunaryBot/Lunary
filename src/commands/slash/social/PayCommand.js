const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
const Discord = require("discord.js")

module.exports = class PayCommand extends Command {
    constructor(client) {
        super({
            name: "pay",
            dirname: __dirname
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        await ctx.interaction.deferReply().catch(() => {});
        const user = ctx.interaction.options.getUser('user');

        if(user.id == ctx.author.id) return ctx.interaction.followUp({
            content: ctx.t("pay:texts.userMismatch")
        }).catch(() => {});

        const amount = ctx.interaction.options.getInteger('amount');

        if(amount < 1) return ctx.interaction.followUp({
            content: ctx.t("pay:texts.valueMismatch")
        }).catch(() => {});
        
        let authorLuas = await ctx.UserDB.luas;

        if(authorLuas < amount) return ctx.interaction.followUp({
            content: ctx.t("pay:texts.notEnoughLuas", { luasAmount: amount - authorLuas })
        }).catch(() => {});

        const components = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId("confirm_pay")
                    .setEmoji("872635474798346241")
                    .setStyle("SUCCESS"),
            )
    
        await ctx.interaction.followUp({
            content: ctx.t("pay:texts.confirm", { 
                luasAmount: amount, 
                author: ctx.author.toString(),
                user: user.toString()
            }),
            components: [components]
        })
        
        const msg = await ctx.interaction.fetchReply();
        
        const collector = msg.createMessageComponentCollector({
            filter: m => {
                return [ctx.author.id, user.id].includes(m.user.id)
            },
            time: 10 * 1000 // 1 minute
        })
        
        collector.on("collect", 
        /**
         * @param {Discord.ButtonInteraction} m
         */
        async m => {
            if(!collector.users.has(user.id) || !collector.users.has(ctx.author.id)) {
                return m.reply({
                    content: ctx.t("pay:texts.awaitingConfirmation", {
                        interactionAuthor: m.user.toString(),
                        user: (!collector.users.has(user.id) ? user : ctx.author).toString()
                    }),
                    ephemeral: true
                })
            }
            
            m.deferUpdate().catch(() => {});
            const db = (await this.client.UsersDB.ref("Users").once("value")).val();

            authorLuas = db[ctx.author.id]?.luas || 0;

            if(authorLuas < amount) return ctx.interaction.followUp({
                content: ctx.t("pay:texts.notEnoughLuas2", { 
                    author: ctx.author.toString(),
                    luasAmount: amount - authorLuas 
                })
            })

            const userLuas = (db[user.id]?.luas || 0) + amount;

            await this.client.UsersDB.ref(`Users/${user.id}/luas`).set(userLuas);
            await this.client.UsersDB.ref(`Users/${ctx.author.id}/luas`).set(authorLuas - amount);

            ctx.interaction.followUp({
                content: ctx.t("pay:texts.transferred", { 
                    luasAmount: amount, 
                    author: ctx.author.toString(),
                    user: user.toString()
                }), 
            }).catch(() => {});
        })

        collector.on("end", async (_, reason) => {
            components.components.find(c => c.customId == "confirm_pay").setDisabled(true);

            ctx.interaction.editReply({
                components: [components]
            }).catch(() => {});

            if(reason == "time") {
                if(!collector.users.has(user.id) && !collector.users.has(ctx.author.id)) return ctx.interaction.followUp({
                    content: ctx.t("pay:texts.noOneConfirmed", {
                        user: user.toString(),
                        author: ctx.author.toString()
                    })
                }).catch(() => {});

                if(!collector.users.has(user.id) || !collector.users.has(ctx.author.id)) return ctx.interaction.followUp({
                    content: ctx.t("pay:texts.oneConfirmation", {
                        userConfirmaed: (collector.users.has(user.id) ? user : ctx.author).toString(),
                        userNotConfirmed: (!collector.users.has(user.id) ? user : ctx.author).toString(),
                    })
                }).catch(() => {});
            }
        })
    }
}