import { ChannelTypes, ComponentTypes } from 'oceanic.js'

import { RawSelectMenuComponentBase, SelectMenuBuilder } from './SelectMenuBuilder'

interface RawChannelSelectMenuComponent extends RawSelectMenuComponentBase<ComponentTypes.CHANNEL_SELECT> {
    channel_types: ChannelTypes[] | null
    default_values: Array<{
		id: string
		type: 'channel'
	}> | null
}

export class ChannelSelectMenuBuilder extends SelectMenuBuilder<RawChannelSelectMenuComponent> {
	constructor(data: Partial<Omit<RawChannelSelectMenuComponent, 'type'>> = {}) {
		super({ type: ComponentTypes.CHANNEL_SELECT, ...data })
	}

	setDefaultValues(ids: string[]) {
		this.data.default_values = ids.map(id => ({
			id,
			type: 'channel',
		}))

		return this
	}

	setChannelTypes(...types: ChannelTypes[]) {
		this.data.channel_types = types
	}
}