import { RequiresIsConnected } from '../Decorators'

import { database } from '../client'

export class PunishmentsRepository {
    @RequiresIsConnected
	static create(...args: Parameters<typeof database.punishment.create>) {
		return database.punishment.create(...args)
	}

    @RequiresIsConnected
    static createMany(...args: Parameters<typeof database.punishment.createMany>) {
    	return database.punishment.createMany(...args)
    }

    @RequiresIsConnected
    static findMany(...args: Parameters<typeof database.punishment.findMany>) {
    	return database.punishment.findMany(...args)
    }
    
    @RequiresIsConnected
    static findOne(...args: Parameters<typeof database.punishment.findFirst>) {
    	return database.punishment.findFirst(...args)
    }

    @RequiresIsConnected
    static findOneById(punishmentId: number, args: Omit<Parameters<typeof database.punishment.findFirst>[0], 'where'> = {}) {
    	return database.punishment.findFirst({
    		...args,
    		where: {
    			id: punishmentId,
    		},
    	})
    }

    @RequiresIsConnected
    static update(...args: Parameters<typeof database.punishment.update>) {
    	return database.punishment.update(...args)
    }

    @RequiresIsConnected
    static updateMany(...args: Parameters<typeof database.punishment.updateMany>) {
    	return database.punishment.updateMany(...args)
    }

    @RequiresIsConnected
    static upsert(...args: Parameters<typeof database.punishment.upsert>) {
    	return database.punishment.upsert(...args)
    }
}