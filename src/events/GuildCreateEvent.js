const Event = require('../structures/Event.js');
const { Guild, WebhookClient, User } = require('../lib');

const webhook = new WebhookClient({
	url: process.env.LOGS_GUILDS
});

module.exports = class GuildCreateEvent extends Event {
	constructor(client) {
		super('guildCreate', client);
	}

    /**
     * @param {Guild} guild
     */
	async run(guild) {
		this.client.logger.log(`Guild Create "${guild.id}"`, {
			key: 'Client',
			cluster: true,
			date: true,
		});

		webhook.send({
			embeds: [
				{
					title: "Guild Create",
					description: `Luna was added in **\`${guild.name}\`**.`,
					color: 10509236,
					fields: [
						{
							name: "Guild Id",
							value: `\`${guild.id}\``,
							inline: true
						},
						{
							name: "Owner Id",
							value: `\`${guild.ownerId}\``,
							inline: true
						},
						{
							name: "Creted in",
							value: `<t:${Math.floor((guild.createdTimestamp + 3600000) / 1000.0)}> (<t:${Math.floor((guild.createdTimestamp + 3600000) / 1000.0)}:R>)`,
							inline: false
						}
					]
				}
			]
		}).catch(() => {});
	}
};
