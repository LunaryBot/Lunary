const Event = require("../structures/Event")
const { Interaction, CommandInteraction, MessageEmbed, Collection, User } = require("../lib")
const ContextCommand = require("../structures/ContextCommand")
const Command = require("../structures/Command")

module.exports = class InteractionCreateEvent extends Event {
    constructor(client) {
        super("interactionCreate", client)

        this.bansCache = new Collection()
        setInterval(() => {
            this.bansCache.clear()
        }, 10 * 1000 * 60)
    }

    /**
     * 
     * @param {Interaction} interaction 
     * @returns 
     */

    async run(interaction) {
        if(interaction.isCommand()) return this.executeCommand(interaction)
        if(interaction.isAutocomplete()) {
            if(`${interaction.commandName} ${interaction.options._subcommand}` == "ban info") return this.autocompleteBanInfo(interaction)
        }
    }
    
    /**
     * 
     * @param {CommandInteraction} interaction
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

            if(!interaction.guild && command.isDM()) return interaction.reply({
                content: "<:Per:833078041084166164> • Esse comando não pode ser usado em mensagens diretas!"
            })

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

    /**
     * 
     * @param {CommandInteraction} interaction
     */
    async autocompleteBanInfo(interaction) {
        const getData = async() => {
            const bans = [ ...(await interaction.guild.bans.fetch()).values() ]?.map(ban => ban.user)
            const requestTime = Date.now()
            return {
                validTime: requestTime + (1 * 1000 * 60),
                requestTime,
                bans
            }
        }

        /**
         * @type {{
         * validTime: number,
         * requestTime: number,
         * bans: User[]
         * }}
         */
        let data = this.bansCache.get(`${interaction.guildId}`)
        if(!data || data.validTime <= Date.now()) data = await getData()

        const input = interaction.options.get("user")?.value?.toLowerCase()

        const arr = data.bans?.map(user => {
            return {
                name: user.tag,
                value: user.id
            }
        }).slice(0, 25)
        
        const outout = input ? arr.filter(ban => ban.name.toLowerCase().includes(input) || ban.value.toLowerCase().includes(input)) : arr 
        
        this.client.api.interactions(interaction.id, interaction.token).callback.post({ 
            data: { 
                type: 8,
                data: { 
                    choices: [...outout] 
                } 
            } 
        })
    }
}

// Tipos de Interactions https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type