const Command = require("../../structures/Command")
const Discord = require("discord.js")
const formatSizeUnits = require("../../utils/formatSizeUnits")
let formatNumber = new Intl.NumberFormat("pt-BR").format

module.exports = class CleanCommand extends Command {
    constructor(client) {
        super({
            name: "clean",
            description: "Limpar uma quantidade de 1 até 99 mensagens.",
            category: "administration",
            dirname: __dirname,
            permissions: {
                Discord: ["MANAGE_MESSAGES"],
                Lunar: ["MANAGE_MESSAGES"]
            }
        }, client)
    }

    async run(ctx, t) {
        let msgs = Number(ctx.args.get("num"))
        if(!msgs || isNaN(msgs) || msgs > 99 || msgs < 1) return ctx.reply({
            content: `A`
        })

        let msgsdelete = await ctx.channel.messages.fetch({
            limit: Math.floor(msgs) + 1
        });

        msgsdelete = msgsdelete.filter(msg => Date.now() - msg.createdTimestamp < 1209600000)

        ctx.channel.bulkDelete(msgsdelete).then(q => ctx.reply({
            content: `${ctx.author.toString()}, **${q.size} ${(Number(q.size) == 1) ? "mensagem foi deletada" : "mensagens foram deletadas"}!**`
        })).catch(() => {})
    }
}