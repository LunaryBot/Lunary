const SubCommand = require('../../../structures/SubCommand.js');
const ContextCommand = require('../../../structures/ContextCommand.js');
const Discord = require('../../../lib');
const advRegex = /^.{8}-.{4}-.{4}-.{4}-.{10}$/i;

module.exports = class AdvEditSubCommand extends SubCommand {
	constructor(client, mainCommand) {
		super(
			{
				name: 'edit',
				dirname: __dirname,
				permissions: {
					Discord: ['MANAGE_MESSAGES'],
					Bot: ['LUNAR_MANAGE_HISTORY'],
				},
				dm: false,
				premium_type: 1
			},
			mainCommand,
			client,
		);
	}

	/**
	 * @param {ContextCommand} ctx
	 */

	async run(ctx) {
		ctx.interaction.deferReply().catch(() => {});
		const id = ctx.interaction.options.getString('id');
		const newReason = ctx.interaction.options.getString('newreason');

		if (!advRegex.test(id))
			return ctx.interaction
				.followUp({
					content: ctx.t('adv_edit:texts.warningNotFound', {
						id: id.replace(/`/g, ''),
					}),
				})
				.catch(() => {});

		let adv = await this.client.LogsDB.ref(id).once('value');
		adv = adv.val();

		if (adv) adv = JSON.parse(Buffer.from(adv, 'base64').toString('ascii'));

		if (!adv || adv.server != ctx.guild.id || adv.type != 4)
			return ctx.interaction
				.followUp({
					content: ctx.t('adv_edit:texts.warningNotFound', {
						id: id.replace(/`/g, ''),
					}),
				})
				.catch(() => {});

		if (newReason > 400)
			return ctx.interaction
				.followUp({
					embeds: [this.sendError(ctx.t('adv_edit:texts.veryBigReason'), ctx.author)],
				})
				.catch(() => {});

		// const user = (await this.client.users.fetch(adv.user).catch(() => {})) || {
		// 	tag: ctx.t('adv_edit:texts.unkownUser') + '#0000',
		// 	toString: () => `<@${adv.user}>`,
		// };

		adv.reason = encodeURI(newReason);

		adv = Buffer.from(JSON.stringify(adv)).toString('base64');

		await this.client.LogsDB.ref(id).set(adv);
		
		ctx.interaction
			.followUp({
				content: ctx.t('adv_edit:texts.success', {
					author: ctx.author.toString(),
				})
			})
			.catch(() => {});
	}
};