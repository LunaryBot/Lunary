import Command, { SubCommand, LunarClient, IContextInteractionCommand } from "../../../../structures/Command";
import Eris from "eris";
import { EventEmitter } from "events";
import InteractionCollector from "../../../../utils/collector/Interaction";
import { ILog } from "../../../../utils/Constants";
import { dump, load } from "js-yaml";

const az = [ ...'abcdefghijklmnopqrstuvwxyz' ];

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

        const ready = async() => {
            let notifyDM = true;

            try {
                if(member && context.options.get("notify-dm") != false) await (await user.getDMChannel()).createMessage({
                    content: context.t('ban:default_dm_message', {
                        emoji: ':hammer:',
                        guild_name: context.guild.name,
                        reason
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

            await context.guild.banMember(user.id, Number(context.options.get('days')) || 0, context.t('general:punishedBy', {
                author_tag: `${context.user.username}#${context.user.discriminator}`,
                reason
                })
                // @ts-ignore
                .shorten(512)
            )

            const logData = {
                reason,
                server: context.guild.id,
                author: context.user.id,
                type: 1,
                date: Date.now(),
                user: user.id,
            } as ILog

            const log = Buffer.from(
				JSON.stringify(logData),
				'ascii',
			).toString('base64');

            let logs = await this.client.dbs.getLogs();

            let id: string = '';
             
            while(!id || logs[id]) {
                const a = (this.client.cases + 1) % 1000000;
                id = az[Math.floor((this.client.cases + 1) / 1000000)].toUpperCase() + '0'.repeat(6 - a.toString().length) + a;
            }

            this.client.dbs.setLogs({
                [id]: log,
                cases: this.client.cases + 1,
            });

            if(context.dbs.guild.punishmentChannel) {
                const punishmentChannel = context.dbs.guild.punishmentChannel;
                
                let punishmentMessage = context.dbs.guild.punishmentMessage || context.t('general:punishment_message');

                punishmentMessage = this.Utils.replacePlaceholders(
                    dump(punishmentMessage),
                    user,
                    context.user,
                    {
                        reason: reason as string,
                        duration: context.t('general:permanent'),
                        type: context.t('ban:punishmentType'),
                    }
                )

                punishmentMessage = load(punishmentMessage as string) as Object;

                punishmentChannel.createMessage(punishmentMessage).catch(() => {});
            }

            // !!! Put to send in the modlogs channel when making the transcript structure !!!

            let xp = context.dbs.user.xp;
            let leveluped = false;

            if(!member) {
				let lastPunishmentApplied: string|ILog = logs[context.dbs.user.lastPunishmentAppliedId || ''];
				try {
                    if(lastPunishmentApplied) lastPunishmentApplied = JSON.parse(Buffer.from(lastPunishmentApplied, 'base64').toString('ascii')) as ILog;
                } catch(_) {
                    // @ts-ignore
                    lastPunishmentApplied = undefined;
                }

                const generateXP = () => {
                    reason = reason.toString()
                    let maxXP = 39
                    if(context.guild.rulesChannelID && reason.includes(`<#${context.guild.rulesChannelID}>`)) maxXP += 21
                    else {
                        if(reason.replace(/<#\d{17,19}>/ig, "").trim().length > 12) maxXP += 6
                        if(/(.*?)<#\d{17,19}>(.*?)/ig.test(reason)) maxXP += 13
                    }
                    
                    if(/https:\/\/(media|cdn)\.discordapp\.net\/attachments\/\d{17,19}\/\d{17,19}\/(.*)\.(jpge?|png|gif|apg|mp4)/ig.test(reason)) maxXP += 18
    
                    const _xp = Math.floor(Math.random() * (maxXP - 21)) + 21

                    console.log(context.dbs.user.level.current, this.Utils.calculateLevels(xp + _xp).current)
                    if(context.dbs.user.level.current.level < this.Utils.calculateLevels(xp + _xp).current.level) leveluped = true;
                    console.log(leveluped)
                    return _xp
                }

				if(typeof lastPunishmentApplied == 'object') {
					if(!user.bot) {
						if(user.id != context.user.id) {
							if(
								user.id != lastPunishmentApplied.user 
								|| (user.id == lastPunishmentApplied.user && lastPunishmentApplied.type != 1)
								|| ((!isNaN(lastPunishmentApplied.date) 
								&& user.id == lastPunishmentApplied.user 
								&& (Date.now() - lastPunishmentApplied.date) > 13 * 1000 * 60))
							) {
								if(reason != lastPunishmentApplied.reason && reason != context.t('general:reasonNotInformed.defaultReason')) {
									xp += generateXP()
								}
							}
						}
					}
				} else xp += generateXP()

                context.dbs.user.xp = xp;
			}

            context.dbs.user.lastPunishmentAppliedId = id;
            context.dbs.user.bans++;

            context.dbs.user.save();

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
            })

            if(leveluped) {
                context.interaction.createFollowup({
                    content: context.t('general:levelUP', {
                        level: this.Utils.calculateLevels(xp).current.level,
                        user: context.user.mention,
                    }),
                    flags: Eris.Constants.MessageFlags.EPHEMERAL,
                })
            }
        };

        if(context.dbs.user.configs.has('quickPunishment')) { return ready(); }

        const components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        custom_id: `${context.interaction.id}-quickpunishment`,
                        label: context.t('general:confirm.buttons.quickpunishment'),
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        emoji: {
                            name: '⚡',
                        }
                    },
                    {
                        type: 2,
                        custom_id: `${context.interaction.id}-confirm`,
                        style: Eris.Constants.ButtonStyles.SUCCESS,
                        emoji: {
                            id: '872635474798346241'
                        }
                    },
                    {
                        type: 2,
                        custom_id: `${context.interaction.id}-cancel`,
                        style: Eris.Constants.ButtonStyles.DANGER,
                        emoji: {
                            id: '872635598660313148'
                        }
                    }
                ]
            }
        ] as Eris.ActionRow[];

        await replyMessageFn({
            content: context.t('general:confirm.message', {
                author: context.user.mention,
                user: user.mention,
                link: this.client.config.links.website.dashboard.me
            }),
            components,
        });

        const collector = new InteractionCollector(this.client, {
            time: 1 * 1000 * 60,
            user: context.user,
            filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
        })

        collector
            .on('collect', async (interaction: Eris.ComponentInteraction) => {
                const id = interaction.data.custom_id.replace(`${context.interaction.id}-`, '')

                switch (id) {
                    case 'cancel': {
                        collector.stop('canceled');
                        context.interaction.deleteOriginalMessage();

                        break;
                    }

                    case 'confirm': {
                        collector.stop('confirmed');

                        replyMessageFn = interaction.editParent.bind(interaction);

                        ready();

                        break;
                    }

                    case 'quickpunishment': {
                        collector.stop('confirmed');

                        replyMessageFn = interaction.editParent.bind(interaction);

                        context.dbs.user.configs.add('quickPunishment')

                        await ready();

                        context.interaction.createFollowup({
                            content: context.t('quickpunishment:enable', {
                                user: context.user.mention,
                            }),
                            flags: Eris.Constants.MessageFlags.EPHEMERAL,
                        });

                        break;
                    }
                }
            })
            .on('end', async(reason?: string) => {
                if(reason == 'timeout') {
                    components.map(row => row.components.map(c => {
                        c.disabled = true;

                        return c;
                    }));
                    
                    context.interaction.editOriginalMessage({
                        components,
                    });
                }
            });
    }
}

export default BanUserSubCommand;