import { ChannelTypes, ComponentTypes, SelectMenuComponent } from 'oceanic.js'

import { BaseComponentBuilder } from '../ComponentBuilder'

type NoStringSelectMenuTypes = ComponentTypes.CHANNEL_SELECT | ComponentTypes.MENTIONABLE_SELECT | ComponentTypes.ROLE_SELECT | ComponentTypes.USER_SELECT
type AllSelectMenuTypes = ComponentTypes.STRING_SELECT | NoStringSelectMenuTypes

export interface RawSelectMenuComponentBase<Type extends AllSelectMenuTypes = AllSelectMenuTypes> {
	type: Type
    placeholder: string | null
    custom_id: string | null
    disabled: boolean | null
	min_values: number | null
	max_values: number | null
}

interface RawSelectMenuComponent extends RawSelectMenuComponentBase {
	default_values: Array<{
		id: string
		type: 'user' | 'role' | 'channel'
	}> | null
	channel_types: ChannelTypes[] | null
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

export class SelectMenuBuilder<RawComponent extends RawSelectMenuComponentBase = RawSelectMenuComponentBase> extends BaseComponentBuilder<RawSelectMenuComponent> {
	constructor(data: Partial<RawComponent> & { type: AllSelectMenuTypes }) {
		super(data)
	}

	setCustomId(customId: string) {
		this.data.custom_id = customId
		return this
	}

	setDisabled(disabled = true) {
		this.data.disabled = disabled
		return this
	}

	setPlaceholder(label: string) {
		this.data.placeholder = label
		return this
	}

	setValues(values : number | { min?: number, max?: number }): this {
		const { max, min } = typeof values === 'object' ? values : { max: values, min: values }
		
		if(min) {
			this.data.min_values = min
		}
		if(max) {
			this.data.max_values = max
		}

		return this
	}

	toJSON() {
		return {
			type: this.data.type,
			customID: this.data.custom_id,
			options: this.data.options,
			placeholder: this.data.placeholder,
			minValues: this.data.min_values,
			maxValues: this.data.max_values,
			disabled: this.data.disabled,
			channelTypes: this.data.channel_types,
			defaultValues: this.data.default_values,
		} as SelectMenuComponent
	}
}