const Command = require("../../structures/Command")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;
const { exec } = require("child_process");
const Discord = require("discord.js");
const MessageButton = require("../../structures/components/MessageButton");
const MessageSelectMenu = require("../../structures/components/MessageSelectMenu");
const MessageSelectMenuOption = require("../../structures/components/MessageSelectMenuOption");
const MessageActionRow = require("../../structures/components/MessageActionRow");
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

    async run(ctx) {
        if(ctx.author.id != "699416429338034268") return ctx.reply({
            embeds: [new Discord.MessageEmbed().setColor("RED").setDescription("**Apenas meus desenvolvedores podem usar este comando!**")]
        })
        const start = Date.now()
        try {
            let result;
            if(ctx.args.get("type") == "--bash") result = consoleRun(ctx.args.get("code"))
            else if(ctx.args.get("type") == "--async") result = await eval(`(async() => { ${ctx.args.get("code")} })()`)
            else result = await eval(ctx.args.get("code"))

            if (result instanceof Promise) {
                result = await result
            }

            if (typeof result !== 'string') result = await require('util').inspect(result, { depth: 0 })
            let end = (Date.now() - start)

            let msg = await ctx.reply({
                content: `\`\`\`js\n${result.replace(this.client.token, "🙃").slice(0, 1990)}\`\`\``,
                flags: ctx.args.get("hide") ? 1 << 6 : 0,
            })
        } catch (err) {
            ctx.reply({
                content: `\`\`\`js\n${`${err}`.replace(this.client.token, "🙃").slice(0, 1990)}\`\`\``,
                flags: ctx.args.get("hide") ? 1 << 6 : 0
            })
        }
    } 
}

function consoleRun(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stout, sterr) => err || sterr ? reject(err || sterr) : resolve(stout.replace(/\\r|\\n/g, '')))
    })
}