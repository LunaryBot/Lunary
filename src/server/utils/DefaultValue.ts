import { MiddlewareFn } from 'type-graphql'

function DefaultValue<T>(defaultValue: T): MiddlewareFn {
    return async (_, next) => {
        const original = await next()
        if (original === undefined || original === null) {
            return defaultValue
        }
        return original
    }
}

export default DefaultValue;