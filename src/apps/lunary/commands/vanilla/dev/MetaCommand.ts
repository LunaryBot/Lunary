import { Embed } from 'oceanic.js'
import { Sydb } from 'sydb'

import { VanillaCommand } from '@/apps/lunary/structures/Command'
import { VanillaCommandContext } from '@/apps/lunary/structures/Context'

import { chunksMount, delay } from '@/utils'

import { logger } from '@/logger'

interface Meta {
    name: string
    description: string
    url: string
	image: string
}

const metaDatabase = new Sydb({ path: 'meta.json', autoSave: true, split: '§' })

export default class MetaVanillaCommand extends VanillaCommand {
	constructor(lunary: LunaryBot) {
		super(lunary, { 
			name: 'meta',
			requirements: {
				ownerOnly: true,
			},
		})
	}

	async run(context: VanillaCommandContext) {
		const original = await context.reply('Aguarde...')

		const arg = context.args.join(' ')

		const urls = arg.split('\n').filter((x) => Boolean(x.trim()))

		const modsChannel = context.lunary.guilds.get('810460656297443378')?.channels.get('1258241612715261952') as typeof context.channel

		const chunks = chunksMount(urls, 5)

		const urlsMap = new Set(urls)

		const results = { 
			success: [] as Meta[], 
			fails: [] as string[], 
		}

		for(let index = 0; index < chunks.length; index++) {
			const chunk = chunks[index]

			await modsChannel.createMessage({
				content: chunk.join('\n'),
			})

			logger.debug(`Requesting chunk ${index + 1} / ${chunks.length}\n${chunk.join('\n')}`, { tags: 'Message Sender' })

			await delay(3000)
		}

		const messages = await modsChannel.getMessages({
			limit: chunks.length,
		})

		const embeds = [] as Embed[]

		for(const message of messages) {
			const { embeds: messageEmbeds } = message

			embeds.push(...messageEmbeds)
		}

		for(const embed of embeds) {
			if(urlsMap.has(embed.url as string)) {
				results.success.push({
					name: embed.title as string,
					description: embed.description as string,
					url: embed.url as string,
					image: embed.thumbnail?.proxyURL as string,
				})

				urlsMap.delete(embed.url as string)
			}
		}

		results.success.forEach(meta => metaDatabase.ref(meta.name).set(meta))

		await context.editOriginalMessage({ 
			embeds: [
				{
					title: `<:Permitido:1024131704937517206> ${results.success.length} x ${results.fails.length} <:Negada:1024131646959648862>`,
					description: `${results.success.map(({ name, url }) => `<:Permitido:1024131704937517206> [${name}](${url})`).join('\n')}\n${results.fails.map(url => `<:Negada:1024131646959648862> ${url}`)}`,
				},
			],
		})
	}
}