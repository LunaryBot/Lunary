import { PunishmentType as PunishmentTypeEnum } from '@prisma/client'

import { SelectMenuComponentContext, SlashCommandContext } from '@/apps/lunary/structures/Context'

import { Either } from '@/utils/Either'

import { StringSelectMenuBuilder, ActionRowBuilder } from '../builders'

interface BasePunishmentProps<PunishmentType extends PunishmentTypeEnum> {
	type: PunishmentType
	reason?: string
}

interface BanPunishmentProps extends BasePunishmentProps<'BAN'> {
	days?: 1 | 3 | 7
}

type PunishmentProps<PunishmentType extends PunishmentTypeEnum> = PunishmentType extends 'BAN' ? BanPunishmentProps : BasePunishmentProps<PunishmentType>

type GetPunishmentPropsResult<PunishmentType extends PunishmentTypeEnum> = Either<undefined, PunishmentProps<PunishmentType>>

export const getPunishmentProps = async <PunishmentType extends PunishmentTypeEnum>(context: SlashCommandContext<true>, punishmentType: PunishmentType): Promise<GetPunishmentPropsResult<PunishmentType>> => {
	const props = {
		type: punishmentType,
	} as PunishmentProps<PunishmentType>
	
	const inputedReason = context.options.getString('reason')

	if(punishmentType === PunishmentTypeEnum.BAN) {
		(props as BanPunishmentProps).days = 1
	}

	const reasons = await context.getGuildReasonsDatabase()

	if(inputedReason) {
		const reason = reasons.find(reason => reason.keys.includes(inputedReason.toLowerCase()))
		if(reason) {
			props.reason = reason.text
		} else {
			props.reason = inputedReason
		}
	} else {
		const reasonsSelectMenu = new StringSelectMenuBuilder({
			...context.useMessage(
				'AddReasonSelectMenu', 
				{},
				reasons.map(reason => ({
					label: reason.text,
					value: reason.id,
				}))
			),
		})
			.setValues(1)
			.createCustomId()
		

		const actionRow = new ActionRowBuilder()
			.addComponents(reasonsSelectMenu)

		context.reply({
			...context.useMessage('AddReason'),
			components: [
				actionRow.toJSON(),
			],
		})

		const interactionContext = await reasonsSelectMenu.await(context.lunary) as SelectMenuComponentContext

		if(!interactionContext) {
			return Either.left(undefined)
		}

		const reason = reasons.find(reason => reason.id === interactionContext.values()[0])

		if(reason) {
			props.reason = reason.text
		}
	}

	return Either.right(props)
}