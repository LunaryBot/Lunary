
import { VanillaCommand } from '@/apps/lunary/structures/Command'
import { SelectMenuComponentContext, VanillaCommandContext } from '@/apps/lunary/structures/Context'

import { ActionRowBuilder, StringSelectMenuBuilder } from '@/apps/lunary/helpers/builders'

export default class TestVanillaCommand extends VanillaCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { 
			name: 'test',
			requirements: {
				ownerOnly: true,
			},
		 })
	}

	async run(context: VanillaCommandContext) {
		const selectMenu = new StringSelectMenuBuilder()
			.addOptions(
				{
					label: 'Action Uno',
					value: 'uno',
				},
				{
					label: 'Action Two',
					value: 'two',
				},
				{
					label: 'Action Three',
					value: 'three',
				}
			)
			.createCustomId()

		const actionRow = new ActionRowBuilder()
			.addComponents(selectMenu)

		const message = await context.reply({
			content: 'Test',
			components: [
				actionRow.toJSON(),
			],
		})

		const interactionContext = await selectMenu.await(this.lunary) as SelectMenuComponentContext

		if(!interactionContext) return

		console.log(interactionContext.values())

		interactionContext.acknowledge()
	}
}