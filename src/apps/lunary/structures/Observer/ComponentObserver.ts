import {  ComponentInteraction, MessageComponent } from 'oceanic.js'

import { Collection } from '@/utils/Collection'

import { Observer, Subscription } from './Observer'

export interface ComponentSubscriptionOptions {
	components: MessageComponent[]
	callback: CallbackFunction
}

export interface ComponentSubscriptionCallbackContext { 
	interaction: ComponentInteraction 
}

type CallbackFunction = (context: ComponentSubscriptionCallbackContext) => any

export class ComponentSubscription extends Subscription<ComponentSubscriptionCallbackContext> {
	options: Omit<ComponentSubscriptionOptions, ''>

	constructor(observer: ComponentObserver, options: ComponentSubscriptionOptions, callback: CallbackFunction) {
		super(observer as any as Observer<ComponentSubscriptionCallbackContext>, callback)

		this.options = options
	}
}

export class ComponentObserver {
	public subscriptions: Collection<ComponentSubscription> = new Collection()
  
	notify(interaction: ComponentInteraction) {
		for(const subscription of this.subscriptions.values()) {
			subscription.callback({ interaction })
		}
	}

	removeSubscription(subscription: Subscription | string) {
		const subscriptionId = typeof subscription === 'string' ? subscription : subscription._id

		return !!this.subscriptions.remove(subscriptionId)
	}

	subscribe(options: ComponentSubscriptionOptions) {
		const subscription = new ComponentSubscription(this, options, options.callback)

		this.subscriptions.set(subscription._id, subscription)

		return subscription
	}
}