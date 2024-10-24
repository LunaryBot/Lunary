import { RequiresIsConnected } from '../Decorators'

import { database } from '..'

export class GuildsRepository {
	@RequiresIsConnected
	static create(...args: Parameters<typeof database.guild.create>) {
		return database.guild.create(...args)
	}

    @RequiresIsConnected
	static createMany(...args: Parameters<typeof database.guild.createMany>) {
    	return database.guild.createMany(...args)
	}

    @RequiresIsConnected
    static findMany(...args: Parameters<typeof database.guild.findMany>) {
    	return database.guild.findMany(...args)
    }
    
    @RequiresIsConnected
    static findOne(...args: Parameters<typeof database.guild.findFirst>) {
    	return database.guild.findFirst(...args)
    }

    @RequiresIsConnected
    static findOneById(guildId: string, args: Omit<Parameters<typeof database.guild.findFirst>[0], 'where'> = {}) {
    	return database.guild.findFirst({
    		...args,
    		where: {
    			id: guildId,
    		},
    	})
    }

    @RequiresIsConnected
    static update(...args: Parameters<typeof database.guild.update>) {
    	return database.guild.update(...args)
    }

    @RequiresIsConnected
    static updateMany(...args: Parameters<typeof database.guild.updateMany>) {
    	return database.guild.updateMany(...args)
    }

    @RequiresIsConnected
    static upsert(...args: Parameters<typeof database.guild.upsert>) {
    	return database.guild.upsert(...args)
    }
}