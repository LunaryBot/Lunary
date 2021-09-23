const Event = require("../structures/Event")
const { Interaction, CommandInteraction, MessageEmbed } = require("discord.js")
const { configPermissions } = require("../structures/BotPermissions")
const ContextCommand = require("../structures/ContextCommand")
const Command = require("../structures/Command")

module.exports = class InteractionCreateEvent extends Event {
    constructor(client) {
        super("interactionCreate", client)
    }

    /**
     * 
     * @param {Interaction} interaction 
     * @returns 
     */

    async run(interaction) {
        if (interaction.isCommand()) return this.executeCommand(interaction)
    }

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @returns 
     */
    
    async executeCommand(interaction) {
        try {
            /**
             * @type {Command}
             */
            let command = this.client.commands.slash.find(c => c.name == interaction.commandName.toLowerCase())
            if(!command) return;
            const subcommand = interaction.options.data.find(x => ["SUB_COMMAND_GROUP", "SUB_COMMAND"].includes(x.type))
            if(subcommand && subcommand.name && command.subcommands && command.subcommands.find(sc => sc.name == subcommand.name)) command = command.subcommands.find(sc => sc.name == subcommand.name)
            if(!command) return;

            let GuildsDB = interaction.guild ? await this.client.db.ref().once('value') : null
            if(GuildsDB) GuildsDB = GuildsDB.val() || {}

            let UsersDB = await this.client.UsersDB.ref().once('value')
            UsersDB = UsersDB.val() || {}

            const ctx = new ContextCommand({
                client: this.client,
                interaction: interaction,
                guild: interaction.guild,
                channel: interaction.channel,
                user: interaction.user,
                command: command,
                mainCommand: this.client.commands.slash.find(c => c.name == interaction.commandName),
                slash: true,
                dm: !Boolean(interaction.guild)
            }, { guildsDB: GuildsDB, usersDB: UsersDB })
            
            await command.run(ctx)
        } catch (e) {
            console.log(e)
            interaction.channel.send({
                content: `${interaction.user.toString()}`,
                embeds: [
                    new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).")
                    .addField("Erro:", `\`\`\`js\n${`${e}`.shorten(1990)}\`\`\``)
                    .setFooter("Desculpa pelo transtorno.")
                ]
            }).catch(() => {})
        }
    }
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type