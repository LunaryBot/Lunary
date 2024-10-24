import { DiscordPermissions, StringUtils } from '@/utils'

import { CommandVariables, MessageTemplate, SelectMenuTemplate } from './typing'

export const ConfirmPunishmentProps: MessageTemplate<CommandVariables & { isMandatoryReason: string }> = {
	type: 'message',
	val({ Author, isMandatoryReason }) {
		return {
			content: 'isMandatoryReason',
		}
	},
}

export const AddReason: MessageTemplate<CommandVariables & {}> = {
	type: 'message',
	val: ({}) => ({
		content: '<:L_thinking:959094491116101642> Adicione um motivo para a punição.',
	}),
}

export const AddReasonSelectMenu: SelectMenuTemplate<CommandVariables & {}, { label: string }> = {
	type: 'select-menu',
	val: ({ }, options) => ({
		placeholder: 'Selecione um motivo',
		options: options.map(option => ({
			label: StringUtils.shorten(option.label, 100),
			value: option.value,
		})),
	}),
}

export const LunaryMissingPermissions: MessageTemplate<CommandVariables & { Permissions: Array<keyof (typeof DiscordPermissions['Flags'])> }> = {
	type: 'message',
	description: 'Missing Discord permissions for Lunary to execute command',
	variables: {
		Permissions: {
			description: 'Missing permissions',
		},
	},
	val: ({ Permissions }) => ({
		content: `<:cry:902169710949445643> **|** Eu não tenho permissão para executar esse comando, eu preciso ${Permissions.length > 1 ? 'da permissão' : 'das permissões'} ${Permissions.map(permission => `\`${permission}\``).join(', ')}.`,
	}),
}

export const LunaryMissingPermissionsToPunish: MessageTemplate<CommandVariables & {}> = {
	type: 'message',
	description: 'Missing Discord permissions for Lunary to execute command',
	val: ({ Author }) => ({
		content: `<:nonn:798271889671192697> ${Author} **|** Ixi... Eu não consigo punir este usuário, ele é mais importante que eu aqui! <:cry:902169710949445643>`,
	}),
}

export const UserMissingPermissions: MessageTemplate<CommandVariables & { Permissions: Array<keyof (typeof DiscordPermissions['Flags'])> }> = {
	type: 'message',
	description: 'Missing Discord Permissions for User to execute command',
	variables: {
		Permissions: {
			description: 'Missing permissions',
		},
	},
	val: ({ Permissions }) => ({
		content: `<:sigh:885721398788632586> **|** Para utilizar esse comando você precisa ${Permissions.length > 1 ? 'da permissão' : 'das permissões'} ${Permissions.map(permission => `\`${permission}\``).join(', ')}, e infelizmente (ou felizmente), você não possui essa permissão...`,
	}),
}

export const UserMissingPermissionsToPunish: MessageTemplate<CommandVariables & {}> = {
	type: 'message',
	description: 'Missing Discord permissions for Lunary to execute command',
	val: ({ Author }) => ({
		content: `<:nonn:798271889671192697> ${Author} **|** Ixi... Eu não consigo punir este usuário, ele é mais importante que eu aqui! <:cry:902169710949445643>`,
	}),
}