import { ButtonComponent, ComponentTypes, MessageActionRow, SelectMenuComponent } from 'oceanic.js'

import { BaseBuilder } from './BaseBuilder'
import { ButtonBuilder } from './ButtonBuilder'
import { SelectMenuBuilder } from './SelectMenu/SelectMenuBuilder'

interface RawActionRow extends MessageActionRow {
    type: ComponentTypes.ACTION_ROW
    components: Array<ButtonComponent | SelectMenuComponent>
}

type Component = ButtonBuilder | ButtonComponent | SelectMenuComponent | SelectMenuBuilder

export class ActionRowBuilder extends BaseBuilder<RawActionRow> {
	constructor(...components: Array<Component | Component[]>) {
		super({
			type: ComponentTypes.ACTION_ROW, 
			components: components.flat().map(ActionRowBuilder.resolveComponent),
		})
	}

	addComponent(component: Component) {
		this.data.components.push(ActionRowBuilder.resolveComponent(component))

		return this
	}

	addComponents(...components: Array<Component | Component[]>) {
		this.data.components.push(...components.flat().map(ActionRowBuilder.resolveComponent))
        
		return this
	}

	toJSON() {
		return this.data
	}

	static resolveComponent(component: Component) {
		if(component instanceof ButtonBuilder || component instanceof SelectMenuBuilder) {
			return component.toJSON()
		}

		return component as ButtonComponent | SelectMenuComponent
	}
}