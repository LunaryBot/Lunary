const Command = require("../../../structures/Command.js");
const ContextCommand = require("../../../structures/ContextCommand.js");
const Discord = require("../../../lib");
const formatSizeUnits = require("../../../utils/formatSizeUnits.js");
const formatNumber = new Intl.NumberFormat("pt-BR").format;

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(
			{
				name: "ping",
				description: "Veja o meu ping",
				category: "bot",
				dirname: __dirname,
			},
			client
		);
	}

	/**
	 * @param {ContextCommand} ctx
	 */
	async run(ctx) {
		if (ctx.args[0]?.toLowerCase() == "clusters") {
			let stats = await this.client.cluster.broadcastEval(`
                [this.cluster.id, this.cluster.ids.size, this.ws.ping, this.guilds.cache.size, this.uptime, process.memoryUsage().rss]
            `);

			let k = "-".repeat(84);
			let s = [
				"```prolog\n" +
					"+" +
					k +
					"+\n" +
					`|${o("Cluster", 30)}|${o("Uptime", 16)}|${o(
						"Shards",
						8
					)}|${o("Ping", 8)}|${o("Guilds", 8)}|${o("RAM", 9)}|`,
			];

			let guilds = 0;
			let ram = 0;
			let shards = 0;

			for (let i = 0; i < 2; i++) {
				let cluster = stats.find((x) => x[0] == i);
				if (cluster && cluster[1]) shards += Number(cluster[1]);
				if (cluster && cluster[3]) guilds += Number(cluster[3]);
				if (cluster && cluster[5]) ram += Number(cluster[5]);

				cluster = {
					id: i + 1,
					name: this.client.config.clustersName[Number(i)],
					shards: cluster ? cluster[1] : "N\\A",
					ping: cluster ? `~${cluster[2]}ms` : "N\\A",
					guilds: cluster ? formatNumber(cluster[3]) : "N\\A",
					uptime: cluster ? duration(cluster[4]) : "N\\A",
					ram: cluster ? formatSizeUnits(cluster[5]) : "N\\A",
				};
				s.push(
					`|${o(
						`${this.client.cluster.id == i ? "» " : ""}Cluster ${
							cluster.id
						} (${cluster.name}) ${
							this.client.cluster.id == i ? "  " : ""
						}`,
						30
					)}|${o(cluster.uptime, 16)}|${o(cluster.shards, 8)}|${o(
						cluster.ping,
						8
					)}|${o(cluster.guilds, 8)}|${o(cluster.ram, 9)}|`
				);
			}

			let l =
				"\n|" +
				"_".repeat(84) +
				"|\n" +
				`|${o("Total", 30)}|${o("------", 16)}|${o(shards, 8)}|${o(
					"------",
					8
				)}|${o(guilds, 8)}|${o(formatSizeUnits(ram), 9)}|`;

			await ctx.message.reply({
				content: s.join("\n") + l + "\n+" + k + "+" + "```",
			});
		} else {
			let a = `**:ping_pong:•Pong!**\n**:satellite_orbital: | Shard:** ${
				Number(ctx.dm ? 0 : ctx.guild.shardId) + 1
			} - [<:foguete:871445461603590164> Cluster ${
				Number(this.client.cluster.id) + 1
			} (${
				this.client.config.clustersName[this.client.cluster.id]
			})]\n**⚡ | Shard Ping:** \`${
				this.client.ws.ping
			}ms\`\n**⏰ | Gateway Ping:**`;

			let ping = Date.now();
			let msg = await ctx.message.reply({
				content: `${a} \`--\``,
			});

			let pong = Date.now() - ping;

			await msg
				.edit({
					content: `${a} \`${pong}ms\``,
				})
				.catch(() => {});
		}
	}
};

function o(string, size) {
	if (typeof string != "string") string = `${string}`;
	let m = Math.floor((size - Number(string.length)) / 2);

	let n = (size - Number(string.length)) % 2;

	return `${" ".repeat(Number(m))}${string}${" ".repeat(
		n != 0 ? Number(m) + 1 : Number(m)
	)}`;
}

function duration(ms) {
	let tempo = require("moment")
		.duration(Number(ms), "milliseconds")
		.format("d[d] h[h] m[m] s[s]", {
			trim: "small",
		});
	return tempo;
}
