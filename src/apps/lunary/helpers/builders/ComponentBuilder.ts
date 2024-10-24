import { randomUUID } from 'crypto'
import { AnyTextableGuildChannel, ComponentTypes, MessageComponent, TextableChannel } from 'oceanic.js'

import { BaseComponentContext, ButtonComponentContext, SelectMenuComponentContext } from '../../structures/Context'
import { ComponentSubscriptionOptions as BaseComponentSubscriptionOptions } from '../../structures/Observer/ComponentObserver'

interface ComponentSubscriptionOptions extends Omit<BaseComponentSubscriptionOptions, 'callback' | 'components'> {
	callback(context: BaseComponentContext): any
	time?: number
}

const SelectMenuTypes = [
	ComponentTypes.CHANNEL_SELECT,
	ComponentTypes.MENTIONABLE_SELECT,
	ComponentTypes.ROLE_SELECT,
	ComponentTypes.STRING_SELECT,
	ComponentTypes.ROLE_SELECT,
	ComponentTypes.USER_SELECT,
]

export abstract class BaseComponentBuilder<DataType extends { custom_id: string | null, type: ComponentTypes }> {
	toJSON(): MessageComponent {
		return undefined as any as MessageComponent
	}

	data: DataType

	constructor(data: Partial<DataType>) {
		this.data = data as DataType
	}

	createCustomId() {
		this.data.custom_id = randomUUID()
		return this
	}

	subscribe(lunary: LunaryBot, options: Omit<ComponentSubscriptionOptions, 'components'> | ComponentSubscriptionOptions['callback']) {
		const callback = typeof options === 'function' ? options : options.callback

		const { custom_id: customID, type: componentType } = this.data

		const subscriptionCallback: BaseComponentSubscriptionOptions['callback'] = ({ interaction }) => {
			if(interaction.data.componentType === componentType && interaction.data.customID === customID) {
				let context = {} as BaseComponentContext
				if(interaction.data.componentType === ComponentTypes.BUTTON) {
					context = new ButtonComponentContext(
						lunary,
						{
							channel: interaction.channel as TextableChannel<AnyTextableGuildChannel>,
							guild: interaction.guild ?? undefined,
							interaction,
							user: interaction.user,
						}
					)
				}
				
				if(SelectMenuTypes.includes(interaction.data.componentType)) {
					context = new SelectMenuComponentContext(
						lunary,
						{
							channel: interaction.channel as TextableChannel<AnyTextableGuildChannel>,
							guild: interaction.guild ?? undefined,
							interaction,
							user: interaction.user,
						}
					)
				}

				callback(context as BaseComponentContext)
			}
		}

		const subscription = lunary.observers.components.subscribe({
			...(typeof options === 'object' ? options : {}),
			components: [this.toJSON()],
			callback: subscriptionCallback,
		})
	
		return subscription
	}

	await(lunary: LunaryBot, options: Omit<ComponentSubscriptionOptions, 'callback'> = {}) {
		return new Promise<BaseComponentContext>((resolve, reject) => {
			const subscription = this.subscribe(lunary, {
				...options,
				callback(context) {
					removeSubscription()

					resolve(context)
				},
			})

			function removeSubscription() {
				subscription.remove()
			}
		})
	}
}