import * as Messages from '@/@messages/_base'
import { Embed } from 'oceanic.js'

import { RegexUtils } from '@/utils'

interface MessageObject {
	content?: string
	embeds?: Array<Omit<Embed, 'video'>>
}

interface MessagesKitOptions {
	id: string
	isNative: boolean
	messages: Messages.MessageKitMap
}

const beginChar = RegexUtils.formartStringToRegex('{{')
const endChar = RegexUtils.formartStringToRegex('}}')
const tagRegex = new RegExp(`${beginChar}([^${endChar}]+)${endChar}`, 'mg')

export class MessagesKit {
	id: string
	isNative: boolean
	messages: Messages.MessageKitMap

	constructor(options: MessagesKitOptions) {
		this.id = options.id
		this.isNative = options.isNative
		this.messages = options.messages as Messages.MessageKitMap
	}

	get useMessage() {
		return this.use.bind(this)
	}

	useButton() {
		
	}

	use<Key extends keyof typeof Messages>(key: Key, ...placeholders: Parameters<typeof Messages[Key]['val']>) {
		const message = this.messages[key]

		if(typeof message === 'function') return message(...placeholders)
		else if(typeof message === 'object') return Object.assign(message)
		else return message
	}

	private replacePlaceholders(string: string, placeholders: Record<string, any>) {
		const output = string.replace(tagRegex, (tagFull, tagKey) => {
			const value = placeholders[tagKey as string]

			return value ?? tagFull
		})

		return output
	}
}