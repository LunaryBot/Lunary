import { PrismaClient } from '@prisma/client';

class Prisma extends PrismaClient {
	public readonly client: LunaryClient;
    
	constructor(client: LunaryClient) {
		super({
			datasources: {
				db: {
					url: process.env.DATABASE_URL,
				},
			},
		});

		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});
	}
}

export default Prisma;