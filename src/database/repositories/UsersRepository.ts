import { RequiresIsConnected } from '../Decorators'

import { database } from '..'

export class UsersRepository {
	@RequiresIsConnected
	static create(...args: Parameters<typeof database.user.create>) {
		return database.user.create(...args)
	}

    @RequiresIsConnected
	static createMany(...args: Parameters<typeof database.user.createMany>) {
    	return database.user.createMany(...args)
	}

    @RequiresIsConnected
    static findMany(...args: Parameters<typeof database.user.findMany>) {
    	return database.user.findMany(...args)
    }
    
    @RequiresIsConnected
    static findOne(...args: Parameters<typeof database.user.findFirst>) {
    	return database.user.findFirst(...args)
    }

    @RequiresIsConnected
    static findOneById(userId: string, args: Omit<Parameters<typeof database.user.findFirst>[0], 'where'> = {}) {
    	return database.user.findFirst({
    		...args,
    		where: {
    			id: userId,
    		},
    	})
    }

    @RequiresIsConnected
    static update(...args: Parameters<typeof database.user.update>) {
    	return database.user.update(...args)
    }

    @RequiresIsConnected
    static updateMany(...args: Parameters<typeof database.user.updateMany>) {
    	return database.user.updateMany(...args)
    }

    @RequiresIsConnected
    static upsert(...args: Parameters<typeof database.user.upsert>) {
    	return database.user.upsert(...args)
    }
}