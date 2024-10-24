import { ComponentInteraction } from 'oceanic.js'

import { BaseInteractionContext, InteractionContextOptions } from '../BaseInteractionContext'

export interface ComponentContextOptions<isOnlyGuild extends boolean = any> extends InteractionContextOptions<isOnlyGuild> {
    interaction: ComponentInteraction
}

export class BaseComponentContext<isOnlyGuild extends boolean = any> extends BaseInteractionContext<isOnlyGuild> {
	interaction: ComponentInteraction

	constructor(lunary: LunaryBot, options: ComponentContextOptions<isOnlyGuild>) {
		super(lunary, options)
	}

	get defer() {
		return this.interaction.deferUpdate.bind(this.interaction)
	}

	get editParentMessage() {
		return this.interaction.editParent.bind(this.originalMessage)
	}

	get customID() {
		return this.interaction.data.customID
	}
}