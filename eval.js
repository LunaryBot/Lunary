const Command = require("../../structures/Command")
let coderegex = /^```(?:js)?\s(.+[^\\])```$/is;
const { exec } = require("child_process");
const Discord = require("discord.js");

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super({
            name: "eval",
            description: "Execute um codigo JavaScript",
            aliases: ["e", "evl"],
            dirname: __dirname,
            subcommands: [],
            cooldown: 0,
            explaples: ["[--async|--terminal] <code>"],
            requires: {
                owner: true
            }
        }, client)
    }

    async run(message, args) {
        if(!args[0]) return message.quote(new Discord.MessageEmbed()
            .setColor('RED')
            .setDescription('**Você precisa fornecer um código para executar o eval!**')
            .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
            .setTimestamp()
        )

        let evalAsync = false
        let evalBash = false
        
        if(args[0].toLowerCase() == "--async") {
            evalAsync = true
            args.shift()
        }
        if(args[0].toLowerCase() == "--terminal") {
            evalBash = true
            args.shift()
        }
        
        let conteudo = args.join(" ")
        if(coderegex.test(conteudo)) conteudo = conteudo.replace(coderegex, "$1")

        const start = Date.now()
        try {
            let result;
            if(evalBash == true) result = consoleRun(conteudo)
            else if(evalAsync == true) result = await eval(`(async() => { ${conteudo} })()`)
            else result = await eval(conteudo)

            if (result instanceof Promise) {
                result = await result
            }

            if (typeof result !== 'string') result = await require('util').inspect(result, { depth: 0 })
            let end = (Date.now() - start)

            resultado(this.client, message, result)
        } catch (e) {
            resultado(this.client, message, e)
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