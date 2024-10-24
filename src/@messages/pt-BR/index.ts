import * as Messages from '../_base'

export const BrazilianPortugueseKit: Messages.MessageKitMap = Object.fromEntries(
	Object.entries(Messages).map(([key, object]) => ([key as keyof Messages.MessageKitMap, object.val]))
) as Messages.MessageKitMap