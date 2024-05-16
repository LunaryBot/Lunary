import { SlashCommandBuilder } from '@discordjs/builders'

const BanSlashCommand = new SlashCommandBuilder()
	.setName('ban')
	.setDescription('〔🔨 • Moderation〕Bans a user from the server.')
	.addSubcommand(subcommand =>
		subcommand
			.setName('user')
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('〔👤 • User〕User(@user/id) to be banned.')
					.setRequired(true)
					.setDescriptionLocalization('pt-BR', '〔👤 • User〕Usuário(@user/id) a ser banido.')
			)
			.addStringOption(option =>
				option
					.setName('reason')
					.setDescription('〔📑 • Reason〕Reason for ban.')
					.setDescriptionLocalization('pt-BR', '〔📑 • Reason〕Motivo para o banimento.')
			)
			.addBooleanOption(option => 
				option
					.setName('notify-dm')
					.setDescription('〔📬 • Notify DM〕Notify punishment via direct message (Private). (Default: True)')
			)
			.addStringOption(option => 
				option
					.setName('days')
					.setDescription('〔📆 • Days〕Amount of message history that must be deleted.')
					.setChoices([
						{
							name: 'Do not delete messages',
							value: '0',
							name_localizations: {
								'pt-BR': 'Não excluir mensagens',
							},
						},
						{
							name: 'Last 24 hours',
							value: '1',
							name_localizations: {
								'pt-BR': 'Últimas 24 horas',
							},
						},
						{
							name: 'Last 7 days',
							value: '7',
							name_localizations: {
								'pt-BR': 'Últimos 7 dias',
							},
						},
					])
			)
	)
	.addSubcommand(subcommand => 
		subcommand
			.setName('info')
			.setDescription('')
	)