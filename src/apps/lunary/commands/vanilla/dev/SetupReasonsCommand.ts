import { VanillaCommand, isOnlyGuild } from '@/apps/lunary/structures/Command'
import { VanillaCommandContext } from '@/apps/lunary/structures/Context'

import { ReasonsRepository } from '@/database'


export default class SetupReasonsVanillaCommand extends VanillaCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { 
			name: 'setupreasons',
			requirements: {
				ownerOnly: true,
			},
		 })
	}

	async run(context: VanillaCommandContext<isOnlyGuild>) {
		await context.reply('Configurando...')
		await ReasonsRepository.createMany({
			data: [
				{
					guild_id: context.guild.id,
					text: 'Enviar conteúdo não solicitado via dm',
					keys: ['divdm', 'spamdm'],
				},
				{
					guild_id: context.guild.id,
					text: 'Não é permitido divulgar conteúdos dentro do servidor sem autorização da administração',
					keys: ['div'],
					days: 1,
				},
				{
					guild_id: context.guild.id,
					text: 'É proibido quaisquer conteúdo pornografico',
					keys: ['nsfw', 'porno', 'pornografia'],
					days: 3,
				},
				{
					guild_id: context.guild.id,
					text: 'É proibido spam, flood, raid, travas, copypasta ou quaisquer coisas do gênero',
					keys: ['spam', 'flood', 'raid'],
					days: 1,
					duration: 180 * 60,
				},
				{
					guild_id: context.guild.id,
					text: 'Utilize os canais de texto e de voz da maneira correta',
					keys: ['offtopic'],
				},
			],
		})

		context.editOriginalMessage({
			content: 'Pronto!',
		})
	}
}