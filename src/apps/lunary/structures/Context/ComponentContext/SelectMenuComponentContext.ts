import { ComponentInteraction, ComponentTypes, InteractionResolvedChannel, Role, SelectMenuTypes, User } from 'oceanic.js'

import { BaseComponentContext, ComponentContextOptions } from './BaseComponentContext'

export interface SelectMenuComponentContextOptions<isOnlyGuild extends boolean = any> extends ComponentContextOptions<isOnlyGuild> {
    interaction: ComponentInteraction<SelectMenuTypes>
}

export interface SelectMenuComponentContext<isOnlyGuild extends boolean = any> extends BaseComponentContext<isOnlyGuild> {
    interaction: ComponentInteraction<SelectMenuTypes>
}

export class SelectMenuComponentContext<isOnlyGuild extends boolean = any> extends BaseComponentContext<isOnlyGuild> {
	interaction: ComponentInteraction<SelectMenuTypes>

	constructor(lunary: LunaryBot, options: SelectMenuComponentContextOptions<isOnlyGuild>) {
		super(lunary, options)
	}
    
	values() {
		switch (this.interaction.data.componentType) {
			case ComponentTypes.CHANNEL_SELECT: {
				return this.interaction.data.values.getChannels()
			}

			case ComponentTypes.MENTIONABLE_SELECT: {
				return this.interaction.data.values.getMentionables()
			}

			case ComponentTypes.ROLE_SELECT: {
				return this.interaction.data.values.getRoles()
			}

			case ComponentTypes.STRING_SELECT: {
				return this.interaction.data.values.getStrings()
			}

			case ComponentTypes.USER_SELECT: {
				return this.interaction.data.values.getUsers()
			}
		}
	}
}

export interface StringSelectComponentContext<isOnlyGuild extends boolean = any> extends SelectMenuComponentContext<isOnlyGuild> {
    values(): string[]
}

export interface UserSelectComponentContext<isOnlyGuild extends boolean = any> extends SelectMenuComponentContext<isOnlyGuild> {
    values(): User[]
}

export interface RoleSelectComponentContext<isOnlyGuild extends boolean = any> extends SelectMenuComponentContext<isOnlyGuild> {
    values(): Role[]
}

export interface MentionableSelectComponentContext<isOnlyGuild extends boolean = any> extends SelectMenuComponentContext<isOnlyGuild> {
    values(): Array<User | Role>
}

export interface ChannelSelectComponentContext<isOnlyGuild extends boolean = any> extends SelectMenuComponentContext<isOnlyGuild> {
    values(): InteractionResolvedChannel[]
}