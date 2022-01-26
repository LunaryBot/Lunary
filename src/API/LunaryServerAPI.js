const router = require('express').Router();
const { Webhook } = require('@top-gg/sdk');
const dbl = new Webhook(process.env.DBL_PASSWORD);

router.post('/vote', dbl.middleware() ,async (req, res) => {
	console.log(req.vote);
});

router.get('/guild/:id_guild', async (req, res) => {
	const guildID = req.params.id_guild;
	const data = await getGuild(guildID);
	res.json(data);
});

module.exports = router;

async function getGuild(guildID) {
	try {
		const guild = await clusterManager
			.broadcastEval(
				`(() => { 
            const guild = this.guilds.cache.get("${guildID}")
            if(guild) {
                const data = {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL({ dynamic: true, format: "png" }),
                    channels: [ ...guild.channels.cache.values() ].map(x => x.toJSON()),
                    roles: [ ...guild.roles.cache.values() ].map(function(x) {
                        const json = x.toJSON()
                        json.permissions = Number(json.permissions)
                
                        return json
                    }),
                    shardID: guild.shardId,
                    clusterID: this.cluster.id
    
                }
                return data
            } else return null
        })()`,
			)
			.then(x => x.find(x => x != null));
		if (!guild)
			return {
				status: 404,
				statusText: 'Not Found',
				data: null,
				query: `Guild ${guildID}`,
			};

		return {
			status: 200,
			statusText: 'OK',
			data: guild,
			query: `Guild ${guildID}`,
		};
	} catch (e) {
		return {
			status: 400,
			statusText: 'Internal Server Error',
			data: null,
			query: `Guild ${guildID}`,
		};
	}
}
