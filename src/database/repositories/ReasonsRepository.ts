import { RequiresIsConnected } from '../Decorators'

import { database } from '..'

export class ReasonsRepository {
	@RequiresIsConnected
	static create(...args: Parameters<typeof database.reason.create>) {
		return database.reason.create(...args)
	}

    @RequiresIsConnected
	static createMany(...args: Parameters<typeof database.reason.createMany>) {
    	return database.reason.createMany(...args)
	}

    @RequiresIsConnected
    static findMany(...args: Parameters<typeof database.reason.findMany>) {
    	return database.reason.findMany(...args)
    }

    @RequiresIsConnected
    static findManyByGuildId(guildId: string, args: Omit<Parameters<typeof database.reason.findFirst>[0], 'where'> = {}) {
    	return database.reason.findMany({
    		...args,
    		where: {
    			guild_id: guildId,
    		},
    	})
    }
    
    @RequiresIsConnected
    static findOne(...args: Parameters<typeof database.reason.findFirst>) {
    	return database.reason.findFirst(...args)
    }

    @RequiresIsConnected
    static findOneById(reasonId: string, args: Omit<Parameters<typeof database.reason.findFirst>[0], 'where'> = {}) {
    	return database.reason.findUnique({
    		...args,
    		where: {
    			id: reasonId,
    		},
    	})
    }

    @RequiresIsConnected
    static update(...args: Parameters<typeof database.reason.update>) {
    	return database.reason.update(...args)
    }

    @RequiresIsConnected
    static updateMany(...args: Parameters<typeof database.reason.updateMany>) {
    	return database.reason.updateMany(...args)
    }

    @RequiresIsConnected
    static upsert(...args: Parameters<typeof database.reason.upsert>) {
    	return database.reason.upsert(...args)
    }
}