import { ClientEvents } from 'oceanic.js'

import { LunaryModule } from '@/apps/lunary/structures/LunaryModule'

import { database, DatabaseEvents } from '@/database'

type EventCallback = (...args: any[]) => void

export const DiscordEventListen = (...events: Array<keyof ClientEvents>): Function => {
	return function (_: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value as (...args: any[]) => any
        
		descriptor.value = function() {
			const self = this as EventListener

			for(const event of events) {
				self.lunary.on(event as keyof ClientEvents, original.bind(self))
			}

			return events
		}
	}
}

export const DatabaseEventListen = (...events: Array<keyof DatabaseEvents>): Function => {
	return function (_: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value as (...args: any[]) => any
        
		descriptor.value = function() {
			const self = this as EventListener

			for(const event of events) {
				database.$events.on(event, original.bind(self))
			}

			return events
		}
	}
}

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