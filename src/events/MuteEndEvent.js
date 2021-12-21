const Event = require("../structures/Event.js");
const { GuildDB } = require("../structures/GuildDB.js");
const sydb = require("sydb");
const mutesdb = new sydb(__dirname + "/../data/mutes.json");
const { message_modlogs, message_punish } = require("../utils/index");
const reason = "Tempo de mute expirou.";

module.exports = class MuteEndEvent extends Event {
	constructor(client) {
		super("muteEnd", client);
	}

	async run(data) {
		const data2 = mutesdb.ref(`${data.server}_${data.user}`).val();
		if (!data2) return;
		const guild = this.client.guilds.cache.get(data.server);
		if (!guild || !guild.me.permissions.has("MANAGE_ROLES")) return;
		const user = await guild.members.fetch(data.user).catch(() => {});
		if (!user) return;
		if (!user.roles.cache.has(data.muterole)) return;
		const muterole = guild.roles.cache.get(data.muterole);
		if (muterole.position >= guild.me.roles.highest.position) return;

		await user.roles.remove(data.muterole).catch(() => {});
		if (data.roles?.length) {
			const roles = data.roles.filter(function (x) {
				if (x == data.muterole) return;
				const role = guild.roles.cache.get(x);
				if (!role) return;
				console.log(role.name);
				if (role.position < guild.me.roles.highest.position)
					return true;
			});
			console.log(roles);
			await user.roles.add(roles).catch(() => {});
		}

		const guildDB = await this.client.db
			.ref(`Servers/${guild.id}/`)
			.once("value")
			.then((x) => new GuildDB(x.val() || {}));
		const t = this.client.locales.find(
			(x) => x.locale == guildDB.locale || "pt-BR"
		).t;

		if (guildDB.configs.has("LOG_UNMUTE")) {
			const channel_punish = guild.channels.cache.get(
				guildDB.chat_punish
			);
			if (
				channel_punish &&
				channel_punish.permissionsFor(this.client.user.id).has(18432)
			)
				channel_punish.send({
					embeds: [
						message_punish(
							this.client.user,
							user.user,
							reason,
							"unmute",
							t,
							this.client
						),
					],
				});
		}

		const channel_modlogs = guild.channels.cache.get(guildDB.chat_modlogs);
		if (
			channel_modlogs &&
			channel_modlogs.permissionsFor(this.client.user.id).has(18432)
		)
			channel_modlogs.send({
				embeds: [
					message_modlogs(
						this.client.user,
						user.user,
						reason,
						"unmute",
						t,
						data.id
					),
				],
			});

		this.client.mutes.delete(`${data.server}_${data.user}`);
		mutesdb.ref(`${data.server}_${data.user}`).delete();
	}
};
