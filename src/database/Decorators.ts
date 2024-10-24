import { GlobalVariables } from '@/global'

export function RequiresIsConnected(_this: any, key: string, desc: PropertyDescriptor) {
	const original = desc.value as (...args: any[]) => any
  
	desc.value = function (...args: any[]) {
		if(!GlobalVariables.DatabaseClient.$isConnected) throw new Error('Connection to the database was not established')
        
		return original.apply(this, args)
	}

	return desc
}