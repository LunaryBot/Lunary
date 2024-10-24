import { CommandVariables, MessageTemplate } from './typing'

export * from './commands'
export * from './mod-utils'
export * from './permissions'

export const InvalidUser: MessageTemplate<CommandVariables & { Reference: string }> = {
	type: 'message',
	val: ({ Reference }) => ({
		content: `<:Per:833078041084166164> | **Oops**, infelizmente eu não consegui achar um usuário referente à ${Reference}... Pedimos desculpas pelo inconveniente. *(talvez ele possa até estar no mundo da lua... ¯\_(ツ)_/¯)*`,
	}),
}