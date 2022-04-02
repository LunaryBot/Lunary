import Command, { SubCommand, LunarClient, IContextInteractionCommand } from "../../../../structures/Command";
import Eris from "eris";
import { EventEmitter } from "events";
import InteractionCollector from "../../../../utils/collector/Interaction";

class BanUserSubCommand extends SubCommand {
    constructor(client: LunarClient, mainCommand: Command) {
        super(client, {
            name: 'user',
            dirname: __dirname,
            permissions: {
                me: ["banMembers"],
                bot: ["lunaBanMembers"],
                discord: ["banMembers"],
            },
            guildOnly: true,
            cooldown: 3,
        }, mainCommand);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const user: Eris.User = context.options.get('user');

        const member = context.options.get('user', { member: true });

        if (member) {
            if(!this.Utils.highestPosition(context.member, member)) {
                return context.interaction.createFollowup({
                    content: context.t('general:userMissingPermissionsToPunish')
                }).catch(() => {});
            }

            if(!this.Utils.highestPosition(context.guild.members.get(this.client.user.id) as Eris.Member, member)) {
                return context.interaction.createFollowup({
                    content: context.t('general:lunyMissingPermissionsToPunish')
                }).catch(() => {});
            }
        }

        let replyMessageFn: (content: Eris.InteractionEditContent, ...args: any[]) => Promise<any> = context.interaction.createFollowup.bind(context.interaction);

        let reason = await (new Promise((resolve, reject) => {
            let r = context.options.get('reason');
            const reasons = context.dbs.guild.reasons.filter(r => r.type === 1);

            if (r || !context.dbs.guild.configs.has('mandatoryReason')) { 
                resolve(findReasonKey(r) || r || context.t('general:reasonNotInformed.defaultReason')); 
                return;
            };

            const hasPermission = !!context.dbs.guild.getMemberLunarPermissions(context.member).has('lunarPunishmentOutReason')

            const components = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            custom_id: `${context.interaction.id}-cancel`,
                            label: context.t('general:reasonNotInformed.components.cancel'),
                            style: Eris.Constants.ButtonStyles.DANGER,
                        },
                        {
                            type: 2,
                            custom_id: `${context.interaction.id}-skip`,
                            label: context.t('general:reasonNotInformed.components.skip'),
                            style: Eris.Constants.ButtonStyles.SECONDARY,
                            disabled: !hasPermission,
                        },
                        {
                            type: 2,
                            custom_id: `${context.interaction.id}-addReason`,
                            label: context.t('general:reasonNotInformed.components.addReason'),
                            style: Eris.Constants.ButtonStyles.SUCCESS,
                        },
                    ]
                }
            ] as Eris.ActionRow[];

            if(reasons?.length > 0) {
                components.push({
                    type: 1,
                    components: [
                        {
                            custom_id: `${context.interaction.id}-selectReason`,
                            type: 3,
                            placeholder: context.t('general:reasonNotInformed.components.selectReason'),
                            max_values: 1,
                            min_values: 1,
                            options: [...reasons.map(r => {
                                return {
                                    // @ts-ignore
                                    label: r.text.shorten(100),
                                    value: r._id,
                                } as Eris.SelectMenuOptions;
                            })]
                        } as Eris.SelectMenu
                    ]
                });
            }

            let k = 'confirmNormal'
			if(!hasPermission && reasons.length) {
				k = 'confirmWithReasonsSeteds'
			}

			if(hasPermission && !reasons.length) {
				k = 'confirmWithPermission'
			}

			if(hasPermission && reasons.length) {
				k = 'confirmWithPermissionAndReasonsSeteds'
			}

            context.interaction.createFollowup({
                content: context.t(`general:reasonNotInformed.${k}`, {
                    author: context.user.mention,
                }),
                components,
            })
            
            const collector = new InteractionCollector(this.client, {
                time: 1 * 1000 * 60,
                user: context.user,
                filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
            })

            collector
                .on('collect', async (interaction: Eris.ComponentInteraction | Eris.ModalSubmitInteraction) => {
                    const id = interaction.data.custom_id.replace(`${context.interaction.id}-`, '')

                    switch (id) {
                        case 'cancel': {
                            collector.stop('canceled');
                            context.interaction.deleteOriginalMessage();

                            resolve(false);

                            break;
                        }

                        case 'skip': {
                            collector.stop('skipped');

                            replyMessageFn = interaction.editParent.bind(interaction);
                            

                            resolve(context.t('general:reasonNotInformed.defaultReason'));
                            break;
                        }

                        case 'addReason': {
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
                                ]
                            })

                            collector.resetTimer();
                            break;
                        }

                        case 'selectReason': {
                            collector.stop('reasonAdded');
                            
                            replyMessageFn = interaction.editParent.bind(interaction);
                            
                            const reason = reasons.find(r => r._id === (interaction.data as Eris.ComponentInteractionSelectMenuData).values[0]);
                            
                            resolve(reason?.text || false);
                            
                            break;
                        }
                        
                        case 'addReasonModal': {
                            collector.stop('reasonAdded');

                            replyMessageFn = interaction.editParent.bind(interaction);

                            const reason = (interaction as Eris.ModalSubmitInteraction).data.components[0].components.find(c => c.custom_id === 'reason')?.value as string;

                            resolve(findReasonKey(reason) || reason);

                            break;
                        }
                    }
                })
                .on('end', async(reason?: string) => {
                    if(reason == 'timeout') {
                        components.map(row => row.components.map(c => {
                            c.disabled = true;

                            if (c.type == 3) {
                                // @ts-ignore
                                c.placeholder = context.t('general:timeForSelectionEsgotated').shorten(100);
                            }

                            return c;
                        }));
                        
                        context.interaction.editOriginalMessage({
                            components,
                        });

                        resolve(false);
                    }
                });

            function findReasonKey(key: string): string|undefined {
                return reasons.find(r => r.keys?.includes(key))?.text;
            }
        })) as string | boolean;

        if (reason === false) {
            return;
        }

        const event = new EventEmitter();

        event.on('ready', async() => {
            replyMessageFn({
                content: `${reason}`,
            });
        });

        event.emit('ready');
    }
}

export default BanUserSubCommand;