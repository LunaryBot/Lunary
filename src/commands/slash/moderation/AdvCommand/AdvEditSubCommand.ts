import Eris from 'eris';
import { IReason } from '../../../../@types';
import AdvIdAutoComplete from '../../../../autocompletes/AdvIdAutoComplete';
import Command, { LunarClient, SubCommand, IContextInteractionCommand } from '../../../../structures/Command';
import CommandInteractionOptions from '../../../../utils/CommandInteractionOptions';

class AdvEditSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'edit',
            dirname: __dirname,
            requirements: {
                permissions: {
                    discord: ['viewAuditLog'],
                    bot: ['lunarViewHistory']
                },
                guildOnly: true,
            },
        }, parent);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const caseID = context.options.get('id') as string;

        const adv = await this.client.dbs.getLog(caseID);

        if(!adv || adv.server !== context.guild.id || adv.type !== 4) {
            return context.interaction.createFollowup({
                content: context.t('adv_info:warningNotFound', {
                    id: caseID.replace(/`/g, ''),
                }),
            });
        }

        const reason = context.options.get('newreason') as string;

        adv.reason = encodeURI(findReasonKey(reason)?.text || reason);

		const newAdv = Buffer.from(JSON.stringify(adv)).toString('base64');

        await this.client.dbs.setLogs({
            [caseID]: newAdv,
        });

        return context.interaction.createFollowup({
            content: context.t('adv_info:warningEdited', {
                author: context.user.mention,
                id: caseID.replace(/`/g, ''),
            }),
        })

        function findReasonKey(key: string): IReason|undefined {
            return context.dbs.guild.reasons.filter(reason => (reason.type & (1 << 4)) == 1 << 4).find(r => r.keys?.includes(key));
        }
    }

    public autoComplete(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {
        return this.client.getAutoComplete(AdvIdAutoComplete).run(interaction, options);
    }
}

export default AdvEditSubCommand;