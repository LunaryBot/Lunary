const Command = require("../../structures/Command")
const Discord = require("discord.js")
const { client } = require("../../Lunary")
let formatNumber = new Intl.NumberFormat("pt-BR").format
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
        if(ctx.args.get("type") !== "clusters") {
            let embed = new Discord.MessageEmbed()

            let stats = await this.client.cluster.broadcastEval(`
                [this.cluster.id, this.cluster.ids.size, this.ws.ping, this.guilds.cache.size, this.users.cache.size, this.uptime, process.memoryUsage().rss]
            `)

            let k = "-".repeat(82)
            let s = ["```prolog\n" + "+" + k + "+\n" + `|${o("Cluster", 20)}|${o("Uptime", 14)}|${o("Shards", 8)}|${o("Ping", 8)}|${o("Guilds", 8)}|${o("Users", 10)}|${o("RAM", 8)}|`]

            for(let i = 0; i < this.client.cluster.info.CLUSTER_COUNT; i++) {
                let cluster = stats.find(x => x[0] == i)
                console.log(cluster)
                if(cluster) {
                    s.push(`|${o(`Cluster ${cluster[0]}`, 20)}|${o("N\\A", 14)}|${o(cluster[1], 8)}|${o(`~${cluster[2]}ms`, 8)}|${o(formatNumber(cluster[3]), 8)}|${o(formatNumber(cluster[4]), 10)}|${o(cluster[6], 8)}|`)
                } else {
                    
                }
            }

            ctx.reply({
                content: s.join("\n|" + k + "|\n") + "\n+" + k + "+" + "```"
            })
        } else {
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
}

function o(string, size) {
    if(typeof string != "string") string = `${string}`
    let m = Math.floor(((size - Number(string.length)) / 2))

    let n = (size - Number(string.length)) % 2

    return `${" ".repeat(Number(m))}${string}${" ".repeat(n != 0 ? Number(m) + 1 : Number(m))}`
}