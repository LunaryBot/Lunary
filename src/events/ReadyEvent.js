const Event = require('../structures/Event.js');
const { Api } = require('@top-gg/sdk');
const DblApi = new Api(process.env.DBL_TOKEN);
module.exports = class ReadyEvent extends Event {
	constructor(client) {
		super('ready', client);
	}

	async run() {
		this.client.logger.log(`Client conectado ao Discord!`, {
			key: 'Client',
			cluster: true,
			date: true,
		});

		if (this.client.cluster.info?.CLUSTER_COUNT == this.client.cluster.id + 1) {
			const fn = async () => {
				const guilds = await this.client.cluster.broadcastEval(`this.guilds.cache.size`).then(x => x.reduce((c, d) => c + d, 0));

				// await DblApi.postStats({
				//   serverCount: guilds,
				//   shardCount: this.client.cluster.info?.TOTAL_SHARDS || 0
				// })

				this.client.logger.log(`Enviado estatísticas para o Top.gg!`, {
					key: ['Client', 'DBL'],
					cluster: true,
					date: true,
				});
			};
			fn();
			setInterval(fn, 10 * 1000 * 60);
		}
	}
};
