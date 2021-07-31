const Command = require("../../structures/Command")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;
const { exec } = require("child_process");
const Discord = require("discord.js");
const MessageButton = require("../../structures/components/MessageButton");

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
            embeds: [new Discord.MessageEmbed().setColor("RED").setDescription("**Apenas meus desenvolvedores podem usar este commando!**")]
        })
        const start = Date.now()
        try {
            let result;
            if(ctx.args.find(x => x.name == "type") && ctx.args.find(x => x.name == "type").value == "--bash") result = consoleRun(ctx.args.find(x => x.name == "code").value)
            else if(ctx.args.find(x => x.name == "type") && ctx.args.find(x => x.name == "type").value == "--async") result = await eval(`(async() => { ${ctx.args.find(x => x.name == "code").value} })()`)
            else result = await eval(ctx.args.find(x => x.name == "code").value)

            if (result instanceof Promise) {
                result = await result
            }

            if (typeof result !== 'string') result = await require('util').inspect(result, { depth: 0 })
            let end = (Date.now() - start)

            let msg = await ctx.reply({
                content: `\`\`\`js\n${result.replace(this.client.token, "🙃").slice(0, 1990)}\`\`\``,
                flags: ctx.args.find(x => x.name == "hide") ? 1 << 6 : 0,
                components: [
                    {
                        type: 1,
                        components: [
                            new MessageButton().setLabel("Click Me!").setStyle("red").setEmoji("833753487514533898").setID("b1")
                        ]
                    }
                ]
            })

            let collector = msg.createButtonCollector({
                user: ctx.author,
                buttonID: "b1",
                max: 1,
                stopOnCollect: true
            })

            collector.on('collect', button => {
                button.defer()
                msg.edit({
                    content: "Collected!"
                })
            })
        } catch (err) {
            console.log(`${err}`)
            ctx.reply({
                content: `\`\`\`js\n${`${err}`.replace(this.client.token, "🙃").slice(0, 1990)}\`\`\``,
                flags: ctx.args.find(x => x.name == "hide") ? 1 << 6 : 0
            })
        }
    } 
}

async function resultado(client, message, result) {
    message.quote(`${result}`.replace(client.token, "🙃").slice(0, 1990), {code: "js"})
}

function consoleRun(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stout, sterr) => err || sterr ? reject(err || sterr) : resolve(stout.replace(/\\r|\\n/g, '')))
    })
}