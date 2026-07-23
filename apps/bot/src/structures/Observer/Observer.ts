import { randomUUID } from 'crypto'

import { Collection } from '@/utils/Collection'

export class Subscription<CallbackArgType = any> {
  readonly _id: string = randomUUID()

  callback: (arg: CallbackArgType) => any

  constructor(
    readonly observer: Observer<CallbackArgType>,
  ) {}

  remove() {
    return this.observer.removeSubscription(this)
  }

  setCallback(callback: (arg: CallbackArgType) => any) {
    this.callback = callback
  }
}

export class Observer<CallbackArgType = unknown> {
  public subscriptions: Collection<Subscription> = new Collection()
  
  notify(arg: CallbackArgType) {
    for(const subscription of this.subscriptions.values()) {
      subscription.callback(arg)
    }
  }

  removeSubscription(subscription: Subscription | string) {
    const subscriptionId = typeof subscription === 'string' ? subscription : subscription._id

    return !!this.subscriptions.remove(subscriptionId)
  }

  subscribe(callback: (arg: CallbackArgType) => any) {
    const subscription = new Subscription(this)

    subscription.setCallback(callback)

    this.subscriptions.set(subscription._id, subscription)

    return subscription
  }
}