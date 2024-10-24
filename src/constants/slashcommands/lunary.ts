import { SlashCommandBuilder } from '@discordjs/builders'

export const LunarySlashCommandData = new SlashCommandBuilder()
	.setName('lunary')
	.setDescription('🌙 • Luny〕')
	.addSubcommand(subcommand => 
		subcommand
			.setName('ping')
			.setDescription('〔🌙 • Luny〕See my latency.')
			.addStringOption(option =>
				option
					.setName('options')
					.setDescription('〔📍 • Options〕Choose one of these options to view.')
					.setChoices([
						{
							name: 'Clusters',
							value: 'clusters',
						},
					])
					.setDescriptionLocalization('pt-BR', '〔📍 • Options〕Veja os stats de uma área específica minha.')
			)
	)
	.addSubcommand(subcommand => 
		subcommand
			.setName('info')
			.setDescription('〔🌙 • Luny〕Shows more information about me.')
			.setDescriptionLocalization('pt-BR', '〔🌙 • Luny〕Veja mais informações sobre mim.')
	)