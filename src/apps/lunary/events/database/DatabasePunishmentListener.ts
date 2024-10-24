import { Punishment } from '@prisma/client'

import { DatabaseEventListen, EventListener } from '@/apps/lunary/helpers'

class DatabasePunishmentListener extends EventListener {
    @DatabaseEventListen('punishmentExpires')
	onPunishmentExpires(punishment: Punishment) {}
}