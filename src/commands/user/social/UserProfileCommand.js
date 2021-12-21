const Command = require("../../../structures/Command.js");
const ContextCommand = require("../../../structures/ContextCommand.js");
const Discord = require("../../../lib");
const { UserDB } = require("../../../structures/UserDB.js");

module.exports = class UserProfileCommand extends Command {
	constructor(client) {
		super(
			{
				name: "User Profile",
				dirname: __dirname,
			},
			client
		);
	}

	/**
	 * @param {ContextCommand} ctx
	 */
	async run(ctx) {
		ctx.interaction.deferReply({ ephemeral: false }).catch(() => {});
		const user = ctx.interaction.options.getUser("user");

		if (!user)
			return await ctx.interaction
				.followUp({
					content: ctx.t("general:invalidUser", {
						reference: ctx.interaction.options.getUser("user")?.id,
					}),
				})
				.catch(() => {});

		const db =
			user.id == ctx.author.id
				? ctx.UserDB
				: new UserDB(
						(
							await this.client.UsersDB.ref(
								`Users/${user.id}`
							).once("value")
						).val() || {},
						user
				  );

		const xpRank =
			Object.entries(ctx.UsersDB.ref("Users").val())
				.filter(([k, v]) => v["xp"])
				.sort((a, b) => b[1]["xp"] - a[1]["xp"])
				.slice(0, 100)
				.findIndex(([k, v]) => k == user.id) + 1;
		const rankPosition = xpRank
			? ((i) => {
					if (i == 1) return "1st";
					if (i == 2) return "2nd";
					if (i == 3) return "3rd";
					return `${i}th`;
			  })(xpRank)
			: "N/A";

		const design =
			this.client.designsProfile.find(
				(template) => template.name == db.design
			) ||
			this.client.designsProfile.find(
				(template) => template.name == "DEFAULT_BLACK_DESIGN"
			);
		ctx.interaction
			.followUp({
				content: ctx.t("profile:texts.contentMessage", {
					user: user.toString(),
				}),
				files: [
					new Discord.MessageAttachment(
						await design.build({
							avatar: user.avatarURL({
								format: "png",
								dynamic: false,
							}),
							username: user.username,
							backgroundName: db.background,
							rankPosition,
							xp: db.xp,
							bans: db.bans,
							bio: db.aboutme,
							emblem: db.emblem,
							flags: user.flags,
							luas: db.luas,
							rank: db.rank,
						}),
						`${[...user.username]
							.map((x) => x.removeAccents())
							.filter((x) => /[a-z]/i.test(x))}_profile.png`
					),
				],
			})
			.catch(() => {});
	}
};
