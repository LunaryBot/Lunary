import { AnyTextableGuildChannel, CommandInteraction, ComponentInteraction, ComponentTypes, Constants, Interaction, TextableChannel } from 'oceanic.js'

import { SlashCommand } from '@/apps/lunary/structures/Command'
import { SlashCommandContext } from '@/apps/lunary/structures/Context'
import { LunaryCluster } from '@/apps/lunary/structures/LunaryCluster'

import { DiscordEventListen, EventListener } from '@/apps/lunary/helpers'

import { logger } from '@/logger'

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

		switch (interaction.type) {
			case Constants.InteractionTypes.APPLICATION_COMMAND: {
				await this.handleInteractionCommand(interaction as CommandInteraction)

				break
			}

			case Constants.InteractionTypes.MESSAGE_COMPONENT: {

				if(interaction.isComponentInteraction() && interaction.data.componentType === ComponentTypes.BUTTON) {
					interaction
				}
				await this.handleInteractionComponent(interaction as ComponentInteraction)
				
				break
			}
		}
	}

	async handleInteractionCommand(interaction: CommandInteraction) {
		await interaction.defer()

		const commandName = interaction.data.name
		const mainCommand = (this.lunary.commands as SlashCommand[]).find((command) => 
			command.type === 'SlashCommand' &&
			command.name === commandName
		)

		if(!mainCommand) return logger.warn(`Command ${commandName} not found`, { tags: `Cluster ${LunaryCluster.id}, Client, InteractionCreate` })

		if(!interaction.guildID && mainCommand.requirements?.guildOnly) return

		const options = interaction.data.options

		const searchQuery = options.getSubCommand() || []

		const command = searchQuery.length ? searchCommand(mainCommand, searchQuery) ?? mainCommand : mainCommand

		const context = new SlashCommandContext(this.lunary, {
			command,
    		channel: interaction.channel as TextableChannel<AnyTextableGuildChannel>,
    		guild: interaction.member?.guild,
    		interaction,
    		user: interaction.user,
		})

		// _G.lastInteraction = context

		if(command.requirements) {
			const { requirements } = command

			if(requirements.ownerOnly === true && !this.lunary.devs.includes(context.user.id)) {
				return context.channel.createMessage({
					content: '<:L_angry:959094353329004544> **Eieiei**, só pessoas especiais podem usar este comando!',
				})
			}
		}

		await command.run(context)
	}

	async handleInteractionComponent(interaction: ComponentInteraction) {
		this.lunary.observers.components.notify(interaction)
	}
}