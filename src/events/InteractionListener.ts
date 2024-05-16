import Eris, { CommandInteraction, Constants, EventListeners as ErisEventsListeners, Interaction, InteractionDataOptions } from 'eris'

import { DiscordEventListen, EventListener } from '@/helpers'

import { LunaryCluster } from '@/structures/cluster'
import { SlashCommand } from '@/structures/Command'
import { CommandInteractionOptions } from '@/structures/CommandInteractionOptions'
import { SlashCommandContext } from '@/structures/Context/CommandContext'



import { env } from '@/env'

const searchCommand = (command: SlashCommand, array: string[]): SlashCommand | undefined => {
	const subCommandName = array.shift()

	const subCommand = command.subcommands.find(subcommand => subcommand.name === subCommandName)

	if(!subCommand) return

	return array.length && subCommand.subcommands.length ? searchCommand(subCommand, array) : subCommand
}

export default class InteractionListener extends EventListener {
	@DiscordEventListen('interactionCreate')
	async on(interaction: Interaction) {
		// console.log(interaction)
		if(interaction.type === Constants.InteractionTypes.APPLICATION_COMMAND) {
			await this.handleInteractionCommand(interaction as CommandInteraction)
		}
	}

	async handleInteractionCommand(interaction: CommandInteraction) {
		await interaction.acknowledge()

		const commandName = interaction.data.name
		const mainCommand = (this.client.commands as SlashCommand[]).find((command) => 
			command.type === 'SlashCommand' &&
			command.name == commandName
		)

		if(!mainCommand) return logger.warn(`Command ${commandName} not found`, { label: `Cluster ${LunaryCluster.id}, Client, InteractionCreate` })

		if(!interaction.guildID && mainCommand.requirements?.guildOnly) return

		const options = new CommandInteractionOptions(interaction.data.resolved, interaction.data.options || [])

		const searchQuery = [] as string[]

		if(options._subcommand && mainCommand.subcommands.length) {
			if(options._group) {
				searchQuery.push(options._group)
			}

			searchQuery.push(options._subcommand)
		}

		const command = searchQuery.length ? searchCommand(mainCommand, searchQuery) ?? mainCommand : mainCommand

		const context = new SlashCommandContext(this.client, {
			command,
    		channel: interaction.channel,
    		guild: interaction.member?.guild,
    		interaction,
    		user: (interaction.user || interaction.member?.user) as Eris.User,
			options,
		})

		if(command.requirements) {
			const { requirements } = command

			if(requirements.ownerOnly === true && !this.client.owners.includes(context.user.id)) {
				return context.channel.createMessage({
					content: '<:L_angry:959094353329004544> **Eieiei**, só pessoas especiais podem usar este comando!',
				})
			}
		}

		command.run(context)
	}
}