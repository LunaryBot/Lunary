import { LunyLoggerConfig, LunyLogger } from './LunyLogger'

type LunyLoggerLogFunction = (message: string, more?: { details?: string | object, tags?: string | string[] }) => void

type LoggerMethods<T extends string> = Record<T, LunyLoggerLogFunction>

const Resource: new <T extends string>(attr: LunyLoggerConfig<T>) => LunyLogger & LoggerMethods<T> = LunyLogger as any

export const lunyCreateLogger = <T extends string>(config: LunyLoggerConfig<T>) => {
	return new Resource<T>(config)
}