const Discord = require('discord.js')

module.exports = class EvalCommand {
    constructor() {
        this.name = "reload"
        this.aliases = ["r"]
        this.description = "..."
        this.categoria = "developer"
        this.run = this.run
    }

    async run(client, message, args) {
        if(!["452618703792766987", "699416429338034268", "343778106340802580"].includes(message.author.id)) return message.quote(new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setAuthor("Comando restrito", "https://cdn.discordapp.com/emojis/829429780155858974.gif?size=2048")
        .setDescription("**Apenas meus desenvolvedores podem usar este comando!**"))

        if(!args[0]) return message.quote("Ei, você precisa informar o que é para fazer o reload...")
        try {
            let cmd = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]))
            if(!cmd) return message.quote(`Não achei este comando!`)

            let c = `../${cmd.categoria}/${cmd.name}.js`

            delete require.cache[require.resolve(c)]

            let base = require(c)
            let command = new base()
            client.commands.set(command.name, command);
            if (command.aliases && Array.isArray(command.aliases)) {
                for (let apelido of command.aliases) {
                    client.aliases.set(apelido, command.name);
                };
            };
        } catch (e) {
            message.quote(`Aconteceu um erro...\n\`\`\`js\n${e}\`\`\``)
        }
    }
}