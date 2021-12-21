const Event = require("../structures/Event.js");
const sydb = require("sydb");
const { GuildMember } = require("../lib");
const mutesdb = new sydb(__dirname + "/../data/mutes.json");
const { GuildDB } = require("../structures/GuildDB.js");

module.exports = class GuildMemberRemoveEvent extends Event {
	constructor(client) {
		super("guildMemberAdd", client);
	}

	/**
	 * @param {GuildMember} member
	 */
	async run(member) {
		const muteref = mutesdb.ref(`pendent_${member.guild.id}_${member.id}`);
		const mute = muteref.val();
		if (!mute) return;
		muteref.delete();
		if (!member.guild.me.permissions.has("MANAGE_ROLES")) return;
		if (mute.time != "..." && mute.time <= 0) return;
		const time = mute.time != "..." ? Date.now() + mute.time : "...";

		setTimeout(async () => {
			const guildDB = await this.client.db
				.ref(`Servers/${member.guild.id}/`)
				.once("value")
				.then((x) => new GuildDB(x.val() || {}));
			const roles =
				member.roles.cache
					.filter((x) => !x.managed && x.id != member.guild.id)
					.map((x) => x.id) || [];
			const muterole = member.guild.roles.cache.get(guildDB.muterole);
			if (!muterole) return;
			if (muterole.position >= member.guild.me.roles.highest.position)
				return;
			const data = {
				user: member.id,
				server: member.guild.id,
				id: mute.id,
				roles: roles,
				muterole: muterole.id,
				end: time,
			};

			if (roles && roles.length)
				await member.roles.remove(roles).catch(() => {});

			await member.roles.add(muterole.id);
			mutesdb.ref(`${member.guild.id}_${member.id}`).set(data);
			if (time != "...") {
				const timeout = setTimeout(
					() => this.client.emit("muteEnd", data),
					time - Date.now()
				);
				this.client.mutes.set(
					`${member.guild.id}_${member.id}`,
					timeout
				);
			}
		}, 1000);
	}
};
