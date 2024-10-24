import { ComponentTypes } from 'oceanic.js'

import { RawSelectMenuComponentBase, SelectMenuBuilder } from './SelectMenuBuilder'

type MentionableTypes = ComponentTypes.MENTIONABLE_SELECT | ComponentTypes.ROLE_SELECT | ComponentTypes.USER_SELECT

type OptionTypes = 'user' | 'role'
interface RawMentionableSelectMenuComponentNoType<OptionType extends OptionTypes = OptionTypes> extends Omit<RawSelectMenuComponentBase, 'type'> {
    default_values: Array<{
		id: string
		type: OptionType
	}> | null
}

interface RawMentionableSelectMenuComponent<Type extends MentionableTypes = MentionableTypes, OptionType extends OptionTypes = OptionTypes> extends RawMentionableSelectMenuComponentNoType<OptionType> {
	type: Type
}

class BaseMentionableSelectMenuBuilder<Type extends MentionableTypes> extends SelectMenuBuilder<RawMentionableSelectMenuComponent<Type>> {}

export class MentionableSelectMenuBuilder extends BaseMentionableSelectMenuBuilder<ComponentTypes.MENTIONABLE_SELECT> {
	constructor(data: Partial<RawMentionableSelectMenuComponentNoType> = {}) {
		super({ type: ComponentTypes.MENTIONABLE_SELECT, ...data })
	}

	setDefaultValues(options: Array<{ id: string, type: 'user' | 'role'}>) {
		this.data.default_values = options

		return this
	}
}

export class UserSelectMenuBuilder extends BaseMentionableSelectMenuBuilder<ComponentTypes.USER_SELECT> {
	constructor(data: Partial<RawMentionableSelectMenuComponentNoType<'user'>> = {}) {
		super({ type: ComponentTypes.USER_SELECT, ...data })
	}

	setDefaultValues(ids: string[]) {
		this.data.default_values = ids.map(id => ({
			id,
			type: 'user',
		}))

		return this
	}
}

export class RoleSelectMenuBuilder extends BaseMentionableSelectMenuBuilder<ComponentTypes.ROLE_SELECT> {
	constructor(data: Partial<RawMentionableSelectMenuComponentNoType<'role'>> = {}) {
		super({ type: ComponentTypes.ROLE_SELECT, ...data })
	}

	setDefaultValues(ids: string[]) {
		this.data.default_values = ids.map(id => ({
			id,
			type: 'role',
		}))

		return this
	}
}