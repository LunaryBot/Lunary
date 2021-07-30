const Command = require("../../structures/Command")

module.exports = class PingCommand extends Command {
    constructor(client) {
        super({
            name: "ping",
            description: "Veja o meu ping",
            category: "bot",
            dirname: __dirname,
        }, client)
    }

    async run(ctx) {
        let msg = await ctx.reply({
            content: `Ping!`
        })

        msg.edit({
            content: `:ping_pong: \`${this.client.ws.ping}\``
        })
    }
}