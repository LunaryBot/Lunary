import { LunaryModule } from '@/structures/LunaryModule'

export class BaseContext extends LunaryModule {
	constructor(client: LunaryClient) {
		super(client)
	}
}