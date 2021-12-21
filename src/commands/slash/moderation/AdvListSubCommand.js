const SubCommand = require("../../../structures/SubCommand.js");
const ContextCommand = require("../../../structures/ContextCommand.js");
const Discord = require("../../../lib");

module.exports = class AdvListSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: "list",
				dirname: __dirname,
				permissions: {
					Discord: ["MANAGE_MESSAGES"],
					Bot: ["LUNAR_ADV_MEMBERS"],
				},
				dm: false,
			},
			mainCommand,
			client
		);
	}

	/**
	 * @param {ContextCommand} ctx
	 */

	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});

		const user = ctx.interaction.options.getUser("user") || ctx.author;

		if (!user)
			return await ctx.interaction
				.followUp({
					content: ctx.t("general:invalidUser", {
						reference: ctx.interaction.options.getString("user"),
					}),
				})
				.catch(() => {});

		let logs = await ctx.client.LogsDB.ref().once("value");
		logs = Object.entries(logs.val() || {})
			.map(function ([k, v], i) {
				const data = JSON.parse(
					Buffer.from(v, "base64").toString("ascii")
				);
				data.id = k;
				return data;
			})
			.filter((x) => x.server == ctx.guild.id);

		const advs = logs
			.filter((x) => x.user == user.id && x.type == 4)
			?.sort((a, b) => b.date - a.date)
			.map((data, i) => {
				data.index = i;
				return data;
			});
		if (!advs.length)
			return ctx.interaction
				.followUp({
					embeds: [
						this.sendError(
							ctx.t("adv_list:texts.noWarning"),
							ctx.author
						),
					],
				})
				.catch(() => {});

		const chunk = this.utils.chunk(advs, 3);
		let index = 0;

		await ctx.interaction.followUp(await chunkPage()).catch(() => {});

		const msg = await ctx.interaction.fetchReply();

		const collector = msg.createMessageComponentCollector({
			time: 2 * 60 * 1000,
			filter: (int) => int.user.id == ctx.author.id,
		});

		collector.on(
			"collect",
			/**
			 * @param {Discord.ButtonInteraction} button
			 */
			async (button) => {
				button.deferUpdate().catch(() => {});
				switch (button.customId) {
					case "next":
						if (index >= chunk.length) index = 0;
						else index++;
						break;
					case "back":
						if (index <= 0) index = chunk.length;
						else index--;
						break;
				}

				console.log(index);

				await msg.edit(await chunkPage(index)).catch(() => {});
			}
		);

		async function chunkPage(_index = 0) {
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					ctx.t("adv_list:texts.title", { user: user.tag }),
					"https://media.discordapp.net/attachments/880176654801059860/905286547421659166/emoji.png"
				)
				.setColor("YELLOW")
				.setThumbnail(
					user.displayAvatarURL({
						dynamic: true,
						format: "png",
						size: 1024,
					})
				);

			for (let i = 0; i < chunk[_index].length; i++) {
				const adv = chunk[_index][i];
				const author = (await ctx.client.users
					.fetch(adv.author)
					.catch(() => {})) || {
					username: ctx.t("adv_list:texts.unkownUser"),
					discriminator: "0000",
					id: adv.user,
				};
				embed.addField(
					`\`[ ${adv.index + 1} ]\`: ${adv.id}`,
					`**- ${ctx.t("adv_list:texts.reason")}:** \`\`\`${decodeURI(
						adv.reason
					)}\`\`\`\n- **${ctx.t("adv_list:texts.punishedBy")}:** ${
						author.username
					}**#${author.discriminator}**(\`${
						adv.author
					}\`)\n- <t:${Math.floor((adv.date + 3600000) / 1000.0)}>`
				);
			}

			const components = new Discord.MessageActionRow().addComponents([
				new Discord.MessageButton()
					.setEmoji("905602424495026206")
					.setCustomId("back")
					.setStyle("SECONDARY")
					.setDisabled(!_index),
				new Discord.MessageButton()
					.setEmoji("905602508037181451")
					.setCustomId("next")
					.setStyle("SECONDARY")
					.setDisabled(!chunk[_index + 1]?.length),
			]);

			return {
				embeds: [embed],
				components: [components],
			};
		}
	}
};
