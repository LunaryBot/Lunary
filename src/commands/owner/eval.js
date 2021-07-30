const Command = require("../../structures/Command")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;
const { exec } = require("child_process");
const Discord = require("discord.js");
require("discord-buttons")

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
                flags: !ctx.args.find(x => x.name == "hide") ? 1 << 6 : 0
            })
        } catch (err) {
            ctx.reply({
                content: `\`\`\`js\n${`${err}`.replace(this.client.token, "🙃").slice(0, 1990)}\`\`\``,
                flags: 1 << 6
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