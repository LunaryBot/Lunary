import Eris from 'eris'

import { LunaryModule } from '@/structures/LunaryModule'

import { StringUtils } from '@/utils'

type EventCallback = (...args: any[]) => void

export function EventListen(...events: string[]) {
	return function (_: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value as (...args: any[]) => any
        
		descriptor.value = function() {
			const self = this as EventListener

			for(const event of events) {
				self.client.on(event, original.bind(self))
			}

			return events
		}
	}
}

export const DiscordEventListen = EventListen as (...events: Array<keyof Eris.EventListeners>) => Function

export class EventListener extends LunaryModule {
    [key: `on${string}`]: EventCallback

    public readonly events = [] as string[]

    listen() {
    	const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(this))

    	for(const key of keys) {
			// @ts-expect-error
    		const property = this[key]
    		if(key.startsWith('on') && typeof property === 'function') {
    			this.events.push(...property.bind(this)())
    		}
    	}
    }
}