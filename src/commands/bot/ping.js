const Command = require("../../structures/Command")
const Discord = require("discord.js")

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
        let ping = Date.now()
        let msg = await ctx.reply({
            content: `**:ping_pong:•Pong!**\n**:satellite_orbital: | Shard:** ${Number(ctx.guild.shardID) + 1} - [<:foguete:871445461603590164> Cluster ${Number(this.client.cluster.id) + 1} (Pinho)]\n**⚡ | Shard Ping:** \`${this.client.ws.ping}ms\`\n**⏰ | Gateway Ping:** \`--\`\n**:dividers: | Banco de dados:** \`--\``
        })

        let pong = Date.now() - ping
        
        msg.edit({
            content: `**:ping_pong:•Pong!**\n**:satellite_orbital: | Shard:** ${Number(ctx.guild.shardID) + 1} - [<:foguete:871445461603590164> Cluster ${Number(this.client.cluster.id) + 1} (Pinho)]\n**⚡ | Shard Ping:** \`${this.client.ws.ping}ms\`\n**⏰ | Gateway Ping:** \`${pong}ms\`\n**:dividers: | Banco de dados:** \`--\``
        })
    }
}