const Command = require("../../../structures/Command")
const ContextCommand = require("../../../structures/ContextCommand")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;
const { exec } = require("child_process");
const Discord = require("discord.js");
const MemberBotPermissions = require("../../../structures/BotPermissions");
const message_modlogs = require("../../../utils/message_modlogs");
const message_punish = require("../../../utils/message_punish");
let m = { label: "Rogue", value: "rogue", description: "Sneak n stab", emoji: { name: "emoji_1", id: "870329125259337769" } }

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super({
            name: "eval",
            description: "Execute um código JavaScript",
            category: "owner",
            dirname: __dirname,
        }, client)
    }

    /** 
     * @param {ContextCommand} ctx
     */

    async run(ctx) {
        if(!this.client.config.devs.includes(ctx.author.id)) return ctx.interaction.reply({
            embeds: [new Discord.MessageEmbed().setColor("RED").setDescription("**Apenas meus desenvolvedores podem usar este comando!**")]
        })
        const start = Date.now()
        try {
            let result;
            if(ctx.interaction.options.getString("type") == "--bash") result = consoleRun(ctx.interaction.options.getString("code"))
            else if(ctx.interaction.options.getString("type") == "--async") result = await eval(`(async() => { ${ctx.interaction.options.getString("code")} })()`)
            else result = await eval(ctx.interaction.options.getString("code"))

            if (result instanceof Promise) {
                result = await result
            }

            if (typeof result !== 'string') result = await require('util').inspect(result, { depth: 0 })
            let end = (Date.now() - start)

            let msg = await ctx.interaction.reply({
                content: `\`\`\`js\n${result.replace(this.client.token, "🙃").replace(/```/g, "\\`\\`\\`").slice(0, 1990)}\`\`\``,
                ephemeral: ctx.interaction.options.getBoolean("hide") ? true : false,
            })
        } catch (err) {
            ctx.interaction.reply({
                content: `\`\`\`js\n${`${err}`.replace(this.client.token, "🙃").slice(0, 1990)}\`\`\``,
                ephemeral: ctx.interaction.options.getBoolean("hide") ? true : false
            })
        }
    } 
}

function consoleRun(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stout, sterr) => err || sterr ? reject(err || sterr) : resolve(stout.replace(/\\r|\\n/g, '')))
    })
}