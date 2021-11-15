const Command = require("../../../structures/Command.js")
const ContextCommand = require("../../../structures/ContextCommand.js")
const Discord = require("../../../lib")
const { loadImage, createCanvas } = require("node-canvas")
const { UserDB } = require("../../../structures/UserDB.js")
const DefaultBlack = require("../../../templates/DEFAULT_BLACK_DESIGN.js")

module.exports = class UserProfileCommand extends Command {
    constructor(client) {
        super({
            name: "User Profile",
            dirname: __dirname
        }, client)

        this.template = new DefaultBlack(client)
    }

    /** 
     * @param {ContextCommand} ctx
     */
    async run(ctx) {
        ctx.interaction.deferReply({ ephemeral: false }).catch(() => {})
        const user = ctx.interaction.options.getUser("user")

        if(!user) return await ctx.interaction.followUp({
            content: ctx.t("general:invalidUser", { reference: ctx.interaction.options.getUser("user")?.id })
        }).catch(() => {})

        const db = user.id == ctx.author.id ? ctx.UserDB : new UserDB((await this.client.UsersDB.ref(`Users/${user.id}`).once("value")).val() || {}, user)
        
        ctx.interaction.followUp({
            content: ctx.t("profile:texts.contentMessage", {
                user: user.toString()
            }),
            files: [new Discord.MessageAttachment(await this.template.build(ctx, user, db), `${[...user.username].map(x => x.removeAccents()).filter(x => /[a-z]/i.test(x))}_profile.png`)]
        })//.catch(() => {})
    }
}