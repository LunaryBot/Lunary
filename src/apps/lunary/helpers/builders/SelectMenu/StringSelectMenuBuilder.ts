import { ComponentTypes } from 'oceanic.js'

import { RawSelectMenuComponentBase, SelectMenuBuilder } from './SelectMenuBuilder'

interface RawStringSelectMenuComponent extends RawSelectMenuComponentBase<ComponentTypes.STRING_SELECT> {
    options: Array<{
        label: string
        value: string
        description?: string
        emoji?: {
            id: string
            name?: string
            animated?: boolean
        }
        default?: boolean
    }>
}

interface StringSelectMenuOption {
    label: string
    value: string
    description?: string
    emoji?: string | { id: string, name?: string, animated?: boolean }
    default?: boolean
}

export class StringSelectMenuBuilder extends SelectMenuBuilder<RawStringSelectMenuComponent> {
	constructor(data: Partial<Omit<RawStringSelectMenuComponent, 'type'>> = {}) {
		super({ type: ComponentTypes.STRING_SELECT, ...data })
	}

	addOptions(...options: Array<StringSelectMenuOption>) {
		const parsedOptions: RawStringSelectMenuComponent['options'] = options.map(option => ({
			...option,
			emoji: typeof option.emoji === 'string' ? { id: option.emoji } : option.emoji,
		}))

		this.data.options = parsedOptions

		return this
	}

	setOptions(...options: Array<StringSelectMenuOption>) {
		this.data.options = []

		return this.addOptions(...options)
	}
}