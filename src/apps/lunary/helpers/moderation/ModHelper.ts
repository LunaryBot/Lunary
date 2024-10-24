import { Member } from 'oceanic.js'


import { getPunishmentProps } from './GetPunishmentPropsModHelper'

export class ModHelpers {
	static async confirmAction() {
		
	}

	static getPunishmentProps = getPunishmentProps

	static highestPosition(member1: Member, member2: Member) {
		const guild = member1.guild ?? member2.guild
		if(guild.ownerID == member1.id) { 
			return true 
		}

		if(member1.id == member2.id || guild.ownerID == member2.id) { 
			return false
		}

		const roles = [ ...guild.roles.values() ].sort((a, b) => b.position - a.position)

		member1.roles.sort((a, b) => roles.findIndex(role => role.id == b) - roles.findIndex(role => role.id == a))
		member2.roles.sort((a, b) => roles.findIndex(role => role.id == b) - roles.findIndex(role => role.id == a))

		const member1HighsetRoleIndex = roles.findIndex(role => role.id == member1.roles[0])
		const member2HighsetRoleIndex = roles.findIndex(role => role.id == member2.roles[0])

		return member1HighsetRoleIndex < member2HighsetRoleIndex
	}
}