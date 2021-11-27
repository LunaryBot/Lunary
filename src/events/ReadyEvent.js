const Event = require("../structures/Event.js")
const sydb = require("sydb")
const { Api } = require("@top-gg/sdk")
const mutesdb = new sydb(__dirname + "/../data/mutes.json")
const DblApi = new Api(process.env.DBL_TOKEN)
module.exports = class ReadyEvent extends Event {
  constructor(client) {
    super("ready", client)
  }

  async run() {
    this.client.logger.log(`Client conectado ao Discord!`, { key: "Client", cluster: true, date: true })
    let mutes = Object.entries(mutesdb.ref().val()).filter(([k, v]) => !k.endsWith("pendent_") && v.end != "..." && this.client.guilds.cache.get(v.server))

    mutes.forEach(async([k, v]) => {
      const guild = this.client.guilds.cache.get(v.server)
      const member = await guild.members.fetch(v.user)
      if(!member || !member.roles.cache.get(v.muterole)) return

      const time = v.end - Date.now()
      if(time > 0) {
        const timeout = setTimeout(() => this.client.emit("muteEnd", v), time)
        this.client.mutes.set(`${k}`, timeout)
      } else setTimeout(() => this.client.emit("muteEnd", v), time)
    })

    if(this.client.cluster.info?.CLUSTER_COUNT == this.client.cluster.id + 1) {
      const fn = async() => {
        const guilds = await this.client.cluster.broadcastEval(`this.guilds.cache.size`).then(x => x.reduce((c, d) => c + d, 0))
        
        // await DblApi.postStats({
        //   serverCount: guilds,
        //   shardCount: this.client.cluster.info?.TOTAL_SHARDS || 0
        // })

        this.client.logger.log(`Enviado estatísticas para o Top.gg!`, { key: ["Client", "DBL"], cluster: true, date: true })
      }
      fn()
      setInterval(fn, 10 * 1000 * 60)
    }
  }
}

/* 

this.client.api.applications(this.client.user.id).guilds("869916717122469898").commands.post({
      data: {
        name: 'eval',
        description: '〔🛠️ • Owner〕Executa um código JavaScript',
        options: [
          {
            name: 'code',
            description: 'Código a ser executado.',
            type: 3,
            required: true
          },
          {
            name: 'type',
            description: 'Define a propriedade que o codigo vai ter.',
            type: 3,
            choices: [
              {
                "name": "async/await",
                "value": "--async"
              },
              {
                "name": "terminal",
                "value": "--bash"
              }
            ]
          },
          {
            name: 'hide',
            description: 'Oculta o resultado do eval.',
            type: 5
          }
        ]
      }
    })

    this.client.api.applications(this.client.user.id).commands.post({
      data: {
        name: 'clean',
        description: '〔🚨 • Administração〕Limpar uma quantidade de 1 até 99 mensagens.',
        options: [
          {
            name: 'num',
            description: 'Quantidade de mensagens a serem apagadas.',
            type: 10,
            required: true
          },
          {
            name: 'user-id',
            description: 'Filtra as mensagens de um usuário usando o id.',
            type: 3,
            required: false
          },
          {
            name: 'user',
            description: 'Filtra as mensagens de um usuário.',
            type: 6,
            required: false
          }
        ]
      }
    })
*/