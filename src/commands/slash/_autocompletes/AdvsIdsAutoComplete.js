const { AutoComplete } = require('../../../structures/Command.js');
const Discord = require('../../../lib');

module.exports = class AdvsIdsAutoComplete extends AutoComplete {
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
				const logs = await this.client.LogsDB.ref().once('value');
				const advs = Object.entries(logs.val() || {})
					.map(function ([k, v], i) {
						const data = JSON.parse(Buffer.from(v, 'base64').toString('ascii'));
						return data;
					})
					.filter(x => x.server == interaction.guild.id && x.type == 4)
					?.sort((a, b) => b.date - a.date)
					.map(x => x.id)
					.filter(x => x);

				return {
					validTime: Date.now() + 3 * 1000 * 60,
					advs,
				};
			};

            /**
			 * @type {{
			 *  validTime: number,
			 *  advs: string[]
			 * }}
			 */
			let data = this.cache.get(interaction.guildId);
			if (!data || data.validTime <= Date.now()) {
				data = await getData();
				this.cache.set(interaction.guildId, data);
			}

			const input = interaction.options
				.get('id')
				?.value
                ?.toLowerCase()

			const arr = data.advs?.map(id => {
				return {
					name: id,
					value: id,
				};
			});

			output = input
            ? arr.filter(adv => {
                return adv.value.toLowerCase().includes(input);
              })
            : arr;
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