const Event = require("../structures/Event")

module.exports = class ReadyEvent extends Event {
  constructor(client) {
    super("ready", client)
  }

  run() {
    this.client.logger.log(`Client conectado ao Discord!`, { key: "Client", cluster: true, date: true })

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
  }
}