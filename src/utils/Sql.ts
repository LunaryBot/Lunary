import { database } from '@/database'

export const sql = <T = unknown>(query: TemplateStringsArray | string) => database.$queryRawUnsafe(Array.isArray(query) ? query[0] : query)
