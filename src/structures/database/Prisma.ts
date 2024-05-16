import { type Prisma as _Prisma, PrismaClient } from '@prisma/client'

export type PrismaClientOptions = _Prisma.Subset<_Prisma.PrismaClientOptions, _Prisma.PrismaClientOptions>

export class Prisma extends PrismaClient {
	public readonly client: LunaryClient
    
	constructor(client: LunaryClient, options?: PrismaClientOptions) {
		super(options)

		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		})
	}
}