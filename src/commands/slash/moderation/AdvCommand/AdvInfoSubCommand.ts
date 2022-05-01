import Eris from 'eris';
import { IReason } from '../../../../@types';
import AdvIdAutoComplete from '../../../../autocompletes/AdvIdAutoComplete';
import Command, { LunarClient, SubCommand, IContextInteractionCommand } from '../../../../structures/Command';
import InteractionCollector from '../../../../utils/collector/Interaction';
import CommandInteractionOptions from '../../../../utils/CommandInteractionOptions';

class AdvInfoSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'info',
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

        const memberLunarPermissions = context.dbs.guild.getMemberLunarPermissions(context.member);

        const components = [
            {
                type: 1,
                components: [
                    {
                        custom_id: `${context.interaction.id}-advRemove`,
                        disabled: !(context.member.permissions.has('manageMessages') || memberLunarPermissions.has('lunarManageHistory')),
                        emoji: { id: '905969547801165834', },
                        label: context.t('adv_info:buttons.remove'),
                        style: Eris.Constants.ButtonStyles.DANGER,
                        type: 2,
                    },
                    {
                        custom_id: `${context.interaction.id}-advEdit`,
                        disabled: !(context.dbs.guild.hasPremium() ? context.member.permissions.has('kickMembers') || memberLunarPermissions.has('lunarManageHistory') : false),
                        emoji: { id: '905968459362492456', },
                        label: context.t('adv_info:buttons.edit'),
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        type: 2,
                    }
                ],
            }
        ] as Eris.ActionRow[];

        const user = await (this.client.users.get(adv.user) || this.client.getRESTUser(adv.user));

        const author = await (this.client.users.get(adv.author) || this.client.getRESTUser(adv.author));

        const embed = {
            color: this.Utils.Constants.Colors.YELLOW,
            author: {
                name: context.t('adv_info:embed.title'),
                icon_url: 'https://cdn.discordapp.com/emojis/833078041084166164.png?size=128'
            },
            fields: [
                {
                    name: context.t('adv_info:embed.user'),
                    value: `${user.mention} (\`${user.username}#${user.discriminator} - ${user.id}\`)`,
                },
                {
                    name: context.t('adv_info:embed.reason'),
                    value: `\`\`\`${decodeURI(adv.reason)}\`\`\`\n- **${context.t('adv_info:punishedBy')}:** ${author.username}**#${author.discriminator}**(\`${adv.author}\`)\n—  <t:${Math.floor((adv.date + 3600000) / 1000.0)}>`
                },
                {
                    name: context.t('adv_info:embed.caseID'),
                    value: `\`#${caseID.toLocaleUpperCase()}\``,
                }
            ],
            thumbnail: {
                url: user.dynamicAvatarURL(undefined, 1024),
            }
        } as Eris.Embed;

        await context.interaction.createFollowup({
            embeds: [embed],
            components,
        });

        if(!components[0].components.find(c => c.disabled == false)) return;

        const collector = new InteractionCollector(this.client, {
            user: context.user,
            time: 1 * 60 * 1000,
            filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
        });

        collector.on('collect', async (interaction: Eris.ComponentInteraction|Eris.ModalSubmitInteraction) => {
            const id = interaction.data.custom_id?.split('-')[1];

            switch(id) {
                case 'advRemove': {
                    await interaction.acknowledge();

                    await this.client.dbs.removeLog(id);

                    await interaction.editParent({
                        embeds: [embed],
                        components: components.map(c => {
                            c.components = c.components.map(c => {
                                c.disabled = true;
                                return c;
                            });
                            return c;
                        }),
                    });
                    
                    await interaction
                        .createFollowup({
                            content: context.t('adv_info:warningRemoved', {
                                id,
                                author_mention: context.user.mention,
                                user_tag: `${user.username}#${user.discriminator}`,
                                user_id: user.id,
                            }),
                        })

                    collector.stop();

                    break;
                }

                case 'advEdit': {
                    (interaction as Eris.ComponentInteraction).createModal({
                        title: context.t('general:reasonNotInformed.modalReason.title'),
                        custom_id: `${context.interaction.id}-addReasonModal`,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 4,
                                        custom_id: 'reason',
                                        placeholder: context.t('general:reasonNotInformed.modalReason.placeholder'),
                                        max_length: 400,
                                        label: context.t('general:reasonNotInformed.modalReason.label'),
                                        style: Eris.Constants.TextInputStyles.PARAGRAPH,
                                        required: true,
                                    } as Eris.TextInput
                                ]
                            },
                        ],
                    });

                    collector.resetTimer();

                    break;
                }

                case 'addReasonModal': {
                    await interaction.acknowledge();
                    
                    const reason = (interaction as Eris.ModalSubmitInteraction).data.components[0].components.find(c => c.custom_id === 'reason')?.value as string;

                    adv.reason = encodeURI(findReasonKey(reason)?.text || reason);

		            const newAdv = Buffer.from(JSON.stringify(adv)).toString('base64');

                    await this.client.dbs.setLogs({
                        [caseID]: newAdv,
                    });

                    await interaction
                        .createFollowup({
                            content: context.t('adv_info:warningEdited', {
                                id: caseID,
                                author: context.user.mention,
                            }),
                        })

                    break;
                }
            }

            function findReasonKey(key: string): IReason|undefined {
                return context.dbs.guild.reasons.filter(reason => (reason.type & (1 << 4)) == 1 << 4).find(r => r.keys?.includes(key));
            }
        })
    }

    public autoComplete(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {
        return this.client.getAutoComplete(AdvIdAutoComplete).run(interaction, options);
    }
}

export default AdvInfoSubCommand;