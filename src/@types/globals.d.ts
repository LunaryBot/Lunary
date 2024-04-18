import type { FastifyReply } from 'fastify'
import type { Logger } from 'winston'

import type { LunaryClient as _LunaryClient } from '@/structures/LunaryClient'

export {}

declare global {
    const logger: Logger

    type LunaryClient = _LunaryClient
}