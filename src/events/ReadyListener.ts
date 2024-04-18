import { Constants } from 'eris'

import { DiscordEventListener } from '@/helpers'

export default class ReadyListener extends DiscordEventListener {
	constructor(client: LunaryClient) {
		super(client, 'ready')
	}

	async on() {
		console.log('a')
		await this.client.editStatus('idle')
	}
}