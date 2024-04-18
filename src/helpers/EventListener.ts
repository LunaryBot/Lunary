import Eris from 'eris'

import { StringUtils } from '@/utils'

type EventCallback = (...args: any[]) => void

export class EventListener<EventsName extends string = string> {
    [key: `on${string}`]: EventCallback
    
    public readonly client: LunaryClient
    public readonly events: Array<EventsName>
    public readonly multipleOnFunctions: boolean
    
    constructor(client: LunaryClient, events: EventsName|Array<EventsName>, multipleOnFunctions = false) {
    	Object.defineProperty(this, 'client', {
    		value: client,
    		enumerable: false,
    		writable: false,
    	})

    	this.events = Array.isArray(events) ?  events : [events]

    	this.multipleOnFunctions = multipleOnFunctions
    }

    listen() {
    	this.events.forEach(eventName => {
    		if(this.multipleOnFunctions) {
    			this.client.on(eventName, (...args: unknown[]) => this[`on${StringUtils.toTitleCase(eventName)}`](...args))
    		} else {
    			this.client.on(eventName, (...args: unknown[]) => this.on(...args))  
    		}
    	})
    }
}

export class DiscordEventListener extends EventListener<keyof Eris.EventListeners> {}

export class ExempleEventListener extends EventListener {
	constructor(client: LunaryClient) {
		super(client, [])
	}
}