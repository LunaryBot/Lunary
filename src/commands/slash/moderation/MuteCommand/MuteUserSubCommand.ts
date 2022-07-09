import Command, { SubCommand, LunarClient, IContextInteractionCommand } from '../../../../structures/Command';
import Eris, { ActionRow } from 'eris';
import InteractionCollector from '../../../../utils/collector/Interaction';
import { IPunishmentLog } from '../../../../@types/index.d';
import ModUtils from '../../../../utils/ModUtils';
import CommandInteractionOptions from '../../../../utils/CommandInteractionOptions';
import moment from 'moment';
import 'moment-timezone';

class MuteUserSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'user',
            dirname: __dirname,
            requirements: {
                permissions: {
                    me: ['moderateMembers'],
                    bot: ['lunarMuteMembers'],
                    discord: ['moderateMembers'],
                },
                guildOnly: true,
            },
            cooldown: 3,
        }, parent);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        
        const member: Eris.Member = context.options.get('user', { member: true });
        const user = member?.user || context.options.get('user');
        
        if(!member) {
            return context.interaction.createFollowup({
                content: context.t('general:invalidUser', {
                    reference: user.id,
                }),
            }).catch(() => {});
        }

        if(!this.Utils.highestPosition(context.member, member)) {
            return context.interaction.createFollowup({
                content: context.t('general:userMissingPermissionsToPunish')
            }).catch(() => {});
        }

        if(!this.Utils.highestPosition(context.guild.members.get(this.client.user.id) as Eris.Member, member)) {
            return context.interaction.createFollowup({
                content: context.t('general:lunyMissingPermissionsToPunish', {
                    author: context.user.mention,
                })
            }).catch(() => {});
        }

        if(member.permissions.has('administrator')) {
            return context.interaction.createFollowup({
                content: context.t('mute:userIsAdmin')
            }).catch(() => {});
        }

        let { reason, replyMessageFn = context.interaction.createFollowup.bind(context.interaction) } = await ModUtils.punishmentReason.bind(this)(context, 3);

        if (reason === false) {
            return;
        }

        let duration = context.options.get('duration');
        let defaultMotifDuration: number|null = null;
        
        if(typeof reason == 'object') {
            if(!duration) defaultMotifDuration = reason.duration as number;
            reason = reason.text;
        }

        if(!duration) {
            duration = await new Promise(async resolve => {
                const components: ActionRow[] = [
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: `${context.interaction.id}-selectDuration`,
                                min_values: 1,
                                max_values: 1,
                                placeholder: context.t('mute:selectDurationPlaceholder'),
                                options: [
                                    { label: 'Usar tempo padrão do motivo', value: 'default', emoji: { id: '810628105768796200' } },
                                    { label: context.t('mute:60seconds'), value: (1 * 1000 * 60).toString() },
                                    { label: context.t('mute:5minutes'), value: (5 * 1000 * 60).toString() },
                                    { label: context.t('mute:10minutes'), value: (10 * 1000 * 60).toString() },
                                    { label: context.t('mute:30minutes'), value: (30 * 1000 * 60).toString() },
                                    { label: context.t('mute:1hour'), value: (1 * 1000 * 60 * 60).toString() },
                                    { label: context.t('mute:3hours'), value: (3 * 1000 * 60 * 60).toString() },
                                    { label: context.t('mute:5hours'), value: (5 * 1000 * 60 * 60).toString() },
                                    { label: context.t('mute:12hours'), value: (12 * 1000 * 60 * 60).toString() },
                                    { label: context.t('mute:24hours'), value: (24 * 1000 * 60 * 60).toString() },
                                    { label: context.t('mute:3days'), value: (3 * 24 * 1000 * 60 * 60).toString() },
                                    { label: context.t('mute:7days'), value: (7 * 24 * 1000 * 60 * 60).toString() },
                                    { label: context.t('mute:custom'), value: 'custom', emoji: { name: '🖌️' } },
                                ]
                            }
                        ]
                    }
                ];

                if(defaultMotifDuration) {
                    components.push({
                        type: 1,
                        components: [
                            {
                                label: context.t('mute:defaultDuration', {
                                    duration: this.Utils.durationString(defaultMotifDuration, this.client.locales.find(l => l.name == 'pt-BR')?.t as Function),
                                }),
                                custom_id: `${context.interaction.id}-defaultDuration`,
                                type: 2,
                                style: Eris.Constants.ButtonStyles.PRIMARY,
                            },
                        ],
                    });
                }

                await replyMessageFn({
                    content: context.t('mute:selectDurationMessage'),
                    components,
                });

                const collector = new InteractionCollector(context.client, {
                    time: 1 * 1000 * 60,
                    user: context.user,
                    filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
                });

                collector.on('collect', async (interaction: Eris.ComponentInteraction|Eris.ModalSubmitInteraction) => {
                    const id = interaction.data.custom_id.split('-')[1];

                    replyMessageFn = interaction.editParent.bind(interaction);

                    switch(id) {
                        case 'selectDuration': {
                            const duration = (interaction.data as Eris.ComponentInteractionSelectMenuData).values[0];

                            if(duration == 'default') {
                                resolve(defaultMotifDuration);
                            }

                            if(duration == 'custom') {
                                (interaction as Eris.ComponentInteraction).createModal({
                                    title: context.t('mute:customDurationModal.title'),
                                    custom_id: `${context.interaction.id}-customDuration`,
                                    components: [
                                        {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 4,
                                                    custom_id: `customDurationInput`,
                                                    style: Eris.Constants.TextInputStyles.SHORT,
                                                    required: true,
                                                    placeholder: context.t('mute:customDurationModal.placeholder'),
                                                    label: context.t('mute:customDurationModal.label'),
                                                }
                                            ]
                                        }
                                    ]
                                })

                                return collector.resetTimer();
                            }

                            resolve(parseInt(duration));

                            collector.stop();
                            break;
                        }

                        case 'defaultDuration': {
                            resolve(defaultMotifDuration);

                            collector.stop();

                            break;
                        }

                        case 'customDuration': {
                            const duration = (interaction as Eris.ModalSubmitInteraction).data.components[0].components.find(c => c.custom_id === 'customDurationInput')?.value as string;

                            console.log(duration);
                            
                            resolve(duration);
                            
                            collector.stop();

                            break;
                        }
                    }
                })
                .on('end', (reason?: string) => {
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
            })

            if(duration === false) {
                return;
            }
        }

        const ms = typeof duration == 'number' ? duration : (String(duration).startsWith('Date ') ? new Date(String(duration).split(' ')[1]) : this.Utils.getStringTime(duration));
        
        if(!ms) {
            await replyMessageFn({
                content: context.t('mute:invalidDuration'),
                components: [],
            });

            return;
        }

        if(ms instanceof Date && ms.getTime() < Date.now()) {
            await replyMessageFn({
                content: context.t('mute:dateOfEndInThePast'),
                components: [],
            });

            return;
        }

        if((ms instanceof Date ? ms.getTime() - Date.now() : ms) > 28 * 24 * 60 * 60 * 1000) {
            await replyMessageFn({
                content: context.t('mute:durationTooLong'),
                components: [],
            });
        }

        const ready = async(replyMessageFn: (content: Eris.InteractionEditContent, ...args: any[]) => Promise<any>) => {
            let notifyDM = true;
            const durationString = this.Utils.durationString(ms instanceof Date ? ms.getTime() - Date.now() : ms, context.t);

            try {
                if(context.options.get('notify-dm') != false) await (await user.getDMChannel()).createMessage({
                    content: context.t('mute:default_dm_message', {
                        emoji: ':mute:',
                        guild_name: context.guild.name,
                        reason,
                        time: durationString,
                    }),
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    // @ts-ignore
                                    label: `${context.t('general:sentFrom')} ${context.guild.name}`.shorten(80),
                                    custom_id: 'sentFrom',
                                    style: Eris.Constants.ButtonStyles.SECONDARY,
                                    disabled: true,
                                }
                            ]
                        }
                    ]
                })
            } catch(_) {
                notifyDM = false
            };

            await member.edit(
                {
                    communicationDisabledUntil: ms instanceof Date ? ms : new Date(Date.now() + ms),
                }, 
                context.t('general:punishedBy', {
                    author_tag: `${context.user.username}#${context.user.discriminator}`,
                    reason
                })
                // @ts-ignore
                .shorten(512),
            );

            const punishmentLog = {
                guild: context.guild.id,
                author: context.user.id,
                type: 4,
                timestamp: Date.now(),
                user: user.id,
            } as IPunishmentLog;

            if (typeof reason == 'string') punishmentLog.reason = reason;

            let logs = await this.client.dbs.getLogs();

            const id = await ModUtils.generatePunishmentID.bind(this)(logs);

            this.client.dbs.setLogs({
                [id]: punishmentLog,
                cases: this.client.cases + 1,
            });

            await replyMessageFn({
                content: context.t('general:successfullyPunished', {
                    author_mention: context.user.mention,
                    user_mention: user.mention,
                    user_tag: `${user.username}#${user.discriminator}`,
                    user_id: user.id,
                    id: '#' + id,
                    notifyDM: !notifyDM ? context.t('general:notNotifyDm') : '.'
                }),
                embeds: [],
				components: [],
            });

            const { punishmentChannel } = context.dbs.guild;

            if(punishmentChannel) {
                const { content, files } = await ModUtils.punishmentMessage.bind(this)({
                    author: context.user,
                    user,
                    reason: reason as string || context.t('general:reasonNotInformed.defaultReason'),
                    duration: durationString,
                    type: context.t('mute:punishmentType'),
                }, context.t, context.dbs.guild, context.channel);

                punishmentChannel.createMessage(content, files).catch(() => {});
            }

            let xp = context.dbs.user.xp;
            let leveluped = false;

            if(!member) {
				const { xp: _xp, leveluped: _leveluped } = ModUtils.generatePunishmentXP.bind(this)(context, user, reason as string, 3, logs, 31);

                context.dbs.user.xp = _xp;

                leveluped = _leveluped;
                xp = _xp;
			}

            context.dbs.user.lastPunishmentAppliedId = id;

            context.dbs.user.save();

            if(leveluped) {
                context.interaction.createFollowup({
                    content: context.t('general:levelUP', {
                        level: this.Utils.calculateLevels(xp).current.level,
                        user: context.user.mention,
                    }),
                    flags: Eris.Constants.MessageFlags.EPHEMERAL,
                });
            }

            return;
        };

        return ModUtils.confirmPunishment.bind(this)(context, user, ready.bind(this), replyMessageFn);
    }

    public async autoComplete(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions) {
        if(options.focused?.name === 'duration')  {
            // @ts-ignore
            const value = options.focused?.value;

            if(value) {
                const time = this.Utils.getStringTime(value);

                const formatedDuration = time instanceof Date ? time.toLocaleString() : this.Utils.durationString(Number(time), this.client.locales.find(l => l.name == 'pt-BR')?.t as Function);
                
                if(formatedDuration) {
                    const choices = [
                        {
                            name: formatedDuration,
                            value: `${time instanceof Date ? `Date ${time.getTime()}` : time}`,
                        }
                    ];

                    return interaction.result(choices);
                }
            }
        }
    }
}

export default MuteUserSubCommand;