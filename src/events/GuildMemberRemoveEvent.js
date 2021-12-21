const Event = require("../structures/Event.js");
const sydb = require("sydb");
const { GuildMember } = require("../lib");
const mutesdb = new sydb(__dirname + "/../data/mutes.json");

module.exports = class GuildMemberRemoveEvent extends Event {
	constructor(client) {
		super("guildMemberRemove", client);
	}

	/**
	 * @param {GuildMember} member
	 */
	async run(member) {
		const muteref = mutesdb.ref(`${member.guild.id}_${member.id}`);
		const mute = muteref.val();
		if (!mute) return;
		console.log(mute);
		muteref.delete();
		clearTimeout(this.client.mutes.get(`${member.guild.id}_${member.id}`));
		this.client.mutes.delete(`${member.guild.id}_${member.id}`);
		if (mute.end != "..." && mute.end - Date.now() <= 0) return;

		mutesdb.ref(`pendent_${member.guild.id}_${member.id}`).set({
			user: member.id,
			server: member.guild.id,
			id: mute.id,
			time: mute.end == "..." ? "..." : mute.end - Date.now(),
		});
	}
};
