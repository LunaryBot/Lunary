import type { LunaryBot as _LunaryBot } from '@/apps/lunary/structures/LunaryBot'

import type { DatabaseClient } from '@/database/DatabaseClient'

export {}

declare global {
    type LunaryBot = _LunaryBot

    type If<Value extends boolean, TrueResult, FalseResult = null> = Value extends true
        ? TrueResult
        : FalseResult

    const _G: {
    	DatabaseClient: DatabaseClient,
    }
}