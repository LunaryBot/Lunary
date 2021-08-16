const Event = require("../structures/Event")
const { Interaction, CommandInteraction, MessageEmbed } = require("discord.js")
const { configPermissions } = require("../structures/BotPermissions")
const ContextCommand = require("../structures/ContextCommand")

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
            let command = interaction.commandName ? interaction.commandName.toLowerCase() : undefined
            command = this.client.commands.slash.find(c => c.name == command)
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
                slash: true,
                dm: !Boolean(interaction.guild)
            }, { guildsDB: GuildsDB, usersDB: UsersDB })

            if(ctx.dm == false) ctx.member.botpermissions = configPermissions(ctx.member, ctx.GuildsDB)

            await command.run(ctx)
        } catch (e) {
            const data = {
                content: `${interaction.user.toString()}`,
                embeds: [
                    new MessageEmbed()
                    .setColor("#FF0000")
                    .setDescription("Aconteceu um erro ao executar o comando, que tal reportar ele para a minha equipe?\nVocê pode relatar ele no meu [servidor de suporte](https://discord.gg/8K6Zry9Crx).")
                    .addField("Erro:", `\`\`\`js\n${`${e}`.shorten(1990)}\`\`\``)
                    .setFooter("Desculpa pelo transtorno.")
                ]
            }
            if(!interaction.guild && !interaction.replied) return interaction.reply(data).catch(() => {})
            else if(!interaction.guild && interaction.replied) return interaction.editReply(data).catch(() => {})
            else return interaction.channel.send(data).catch(() => {})
        }
    }
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type