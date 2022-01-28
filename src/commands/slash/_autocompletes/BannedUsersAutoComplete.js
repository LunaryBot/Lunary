const { AutoComplete } = require('../../../structures/Command.js');
const Discord = require('../../../lib');

module.exports = class BannedUsersAutoComplete extends AutoComplete {
    constructor(command, client) {
        super(command, client);
    };

    /**
     * @param {Discord.CommandInteraction} interaction
     */
    async run(interaction) {
        let output = [];

        if(interaction.guild) {
            const getData = async () => {
				const bans = [...(await interaction.guild.bans.fetch()).values()]?.map(ban => ban.user);

				return {
					validTime: Date.now() + 3 * 1000 * 60,
					bans,
				};
			};

            /**
			 * @type {{
			 *  validTime: number,
			 *  bans: Discord.User[]
			 * }}
			 */
			let data = this.bansCache.get(interaction.guildId);
			if (!data || data.validTime <= Date.now()) {
				data = await getData();
				this.bansCache.set(interaction.guildId, data);
			}

			const input = interaction.options
				.get('user')
				?.value?.toLowerCase()
				.replace(/<@!?(\d{17,19})>/, '$1');

			const arr = data.bans?.map(user => {
				return {
					name: user.tag,
					value: user.id,
				};
			});

			output = input ? arr.filter(ban => ban.name.toLowerCase().includes(input) || ban.value.toLowerCase().includes(input)) : arr;
        }

        return this.client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 8,
                data: {
                    choices: [...output].slice(0, 25),
                },
            },
        });
    }
}