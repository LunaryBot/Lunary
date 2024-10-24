import { ComponentInteraction, ComponentTypes } from 'oceanic.js'

import { BaseComponentContext, ComponentContextOptions } from './BaseComponentContext'

export interface ButtonComponentContextOptions<isOnlyGuild extends boolean = any> extends ComponentContextOptions<isOnlyGuild> {
    interaction: ComponentInteraction<ComponentTypes.BUTTON>
}

export class ButtonComponentContext<isOnlyGuild extends boolean = any> extends BaseComponentContext<isOnlyGuild> {
	interaction: ComponentInteraction<ComponentTypes.BUTTON>

	constructor(lunary: LunaryBot, options: ButtonComponentContextOptions<isOnlyGuild>) {
		super(lunary, options)
	}
}