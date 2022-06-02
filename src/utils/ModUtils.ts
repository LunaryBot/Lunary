import Eris from 'eris';
import { JsonPlaceholderReplacer } from 'json-placeholder-replacer';
import { IContextInteractionCommand } from '../structures/Command';
import GuildDB from '../structures/GuildDB';
import LunarClient from '../structures/LunarClient';
import Transcript from '../structures/Transcript';
import InteractionCollector from './collector/Interaction';
import { ILog, IReason } from '../@types/index.d';
import Utils from './Utils';
import * as Constants from './Constants';

const az = [ ...'abcdefghijklmnopqrstuvwxyz' ];

interface IPunishmentOptions { type?: string; reason?: string; duration?: string, user: Eris.User, author: Eris.User };
type TreplyMessageFn = (content: Eris.InteractionEditContent, ...args: any[]) => Promise<any>;

class ModUtils {
    static client: LunarClient;

    public static async generatePunishmentID(logs: { [key: string]: string }): Promise<string> {
        let id: string = '';
             
        while(!id || logs[id]) {
            const a = (this.client.cases + 1) % 1000000;
            id = az[Math.floor((this.client.cases + 1) / 1000000)].toUpperCase() + '0'.repeat(6 - a.toString().length) + a;
        }
        
        return id;
    }

    public static async punishmentMessage(
        punishment: IPunishmentOptions,
        t: (ref: string, variables?: Object) => string, 
        db: GuildDB,
        channel?: Eris.GuildTextableChannel,
    ) {
        let punishmentMessage = db.punishmentMessage || t('general:punishment_message');

        punishmentMessage = ModUtils.replacePlaceholders(
            punishmentMessage,
            punishment,
        );
                
        let files: Eris.FileContent[] = [];

        if(channel && db.configs.has('sendTranscript')) {
            files.push({
                name: `${channel.name || ''}-transcript.html`,
                file: new Transcript(this.client, channel, [
                    ...channel.messages.values(),
                    ...[
                        ...(channel.messages.size >= (this.client.options.messageLimit as number)
                            ? new Map()
                            : await channel.getMessages(this.client.options.messageLimit as number - channel.messages.size)
                        ).values(),
                    ]
                ]).generate()
            });
        };

        return {
            content: punishmentMessage,
            files,
        }
    }

    public static replacePlaceholders(json: Object, punishment: IPunishmentOptions) {
        const { author, user } = punishment;

        const placeholders = [
            // User
            { aliases: ['@user', 'user.mention'], value: user.mention, },
            { aliases: ['user.tag'], value: `${user.username}#${user.discriminator}`, },
            { aliases: ['user.username', 'user.name'], value: user.username, },
            { aliases: ['user.discriminator'], value: user.discriminator, },
            { aliases: ['user.id'], value: user.id, },
            { aliases: ['user.avatar', 'user.icon'], value: user.dynamicAvatarURL(undefined, 1024), },
            // Author
            { aliases: ['@author', 'author.mention', '@staff', 'staff.mention'], value: author.mention, },
            { aliases: ['author.tag', 'staff.tag'], value: `${author.username}#${author.discriminator}`, },
            { aliases: ['author.username', 'user.name'], value: author.username, },
            { aliases: ['author.discriminator'], value: author.discriminator, },
            { aliases: ['author.id', 'staff.id'], value: author.id, },
            { aliases: ['author.avatar', 'author.icon', 'staff.avatar', 'staff.icon'], value: author.dynamicAvatarURL(undefined, 1024), },
            // Punishment
            { aliases: ['punishment', 'punishment.type'], value: punishment.type || 'ᕙ(⇀‸↼‶)ᕗ', },
            { aliases: ['punishment.reason'], value: punishment.reason || '\u200b', },
            { aliases: ['punishment.duration'], value: punishment.duration || 'Infinity', },
        ];
    
        const jsonReplace = new JsonPlaceholderReplacer({
            begin: '{',
            end: '}',
        });

        jsonReplace.addVariableMap(placeholders.map(placeholder => {
            const { aliases, value } = placeholder;
            const obj = Object.fromEntries(aliases.map(alias => [ alias, value ]));

            return obj;
        }).reduce((acc, obj) => ({...acc, ...obj}), {}));

        return jsonReplace.replace(json);
    }

    public static async punishmentReason(context: IContextInteractionCommand, punishmentType: 1 | 2 | 3 | 4) {
        let replyMessageFn: TreplyMessageFn = context.interaction.createFollowup.bind(context.interaction);

        let reason = await (new Promise((resolve, reject) => {
            let r: string = context.options.get('reason');
            const reasons = context.dbs.guild.reasons.filter(r => (r.type & (1 << punishmentType)) === (1 << punishmentType));

            const hasPermission = context.dbs.guild.configs.has('mandatoryReason') ? !!context.dbs.guild.getMemberLunarPermissions(context.member).has('lunarPunishmentOutReason') : true;
            hasPermission
            if (r || (!r && context.dbs.user.configs.has('quickPunishment') && hasPermission)) { 
                resolve(findReasonKey(r) || r || context.t('general:reasonNotInformed.defaultReason')); 
                return;
            };

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
                                const op = {
                                    label: r.text.shorten(100),
                                    value: r._id,
                                } as Eris.SelectMenuOptions;

                                if(punishmentType === 1 && r.days) {
                                    op.description = `${context.t(`ban:delete_messages.${r.days}${r.days > 1 ? 'days' : 'day'}`)}`.shorten(100);
                                }

                                if(punishmentType === 3 && r.duration) {
                                    op.description = `${context.t('mute:duration')}: ${Utils.durationString(r.duration, context.t)}`.shorten(100);
                                }

                                return op;
                            })]
                        } as Eris.SelectMenu
                    ]
                });
            }

            let k = 'suggestToAddAReason';
            if(context.dbs.guild.configs.has('mandatoryReason')) {
                k = 'confirmNormal';

                if(!hasPermission && reasons.length) {
                    k = 'confirmWithReasonsSeteds'
                }
    
                if(hasPermission && !reasons.length) {
                    k = 'confirmWithPermission'
                }
    
                if(hasPermission && reasons.length) {
                    k = 'confirmWithPermissionAndReasonsSeteds'
                }
            }

            replyMessageFn({
                content: context.t(`general:reasonNotInformed.${k}`, {
                    author: context.user.mention,
                }),
                components,
            });
            
            const collector = new InteractionCollector(this.client, {
                time: 1 * 1000 * 60,
                user: context.user,
                filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
            });

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
                            
                            resolve(reason || false);
                            
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

            function findReasonKey(key: string): IReason|undefined {
                return reasons.find(r => r.keys?.includes(key));
            }
        })) as string | boolean | IReason;

        return { reason, replyMessageFn };
    }

    public static async confirmPunishment(context: IContextInteractionCommand, user: Eris.User, readyFn: Function, replyMessageFn: TreplyMessageFn) {
        if(context.dbs.user.configs.has('quickPunishment')) { return readyFn(replyMessageFn); }

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
                link: Constants.Links.website.dashboard.me,
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

                        readyFn(replyMessageFn);

                        break;
                    }

                    case 'quickpunishment': {
                        collector.stop('confirmed');

                        replyMessageFn = interaction.editParent.bind(interaction);

                        context.dbs.user.configs.add('quickPunishment')

                        await readyFn(replyMessageFn);

                        context.interaction.createFollowup({
                            content: context.t('quickpunishment:enable', {
                                author: context.user.mention,
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

    public static generatePunishmentXP(context: IContextInteractionCommand, user: Eris.User, reason: string, punishmentType: 1 | 2 | 3 | 4, logs: { [key: string]: string }, maxXP: number) {
        let xp = context.dbs.user.xp;
        let leveluped = false;

        let lastPunishmentApplied: string|ILog = logs[context.dbs.user.lastPunishmentAppliedId || ''];
		try {
            if(lastPunishmentApplied) lastPunishmentApplied = JSON.parse(Buffer.from(lastPunishmentApplied, 'base64').toString('ascii')) as ILog;
        } catch(_) {
            // @ts-ignore
            lastPunishmentApplied = undefined;
        }

        const generateXP = () => {
            reason = reason.toString();
            
            if(context.guild.rulesChannelID && reason.includes(`<#${context.guild.rulesChannelID}>`)) maxXP += 21
            else {
                if(reason.replace(/<#\d{17,19}>/ig, '').trim().length > 12) maxXP += 6
                if(/(.*?)<#\d{17,19}>(.*?)/ig.test(reason)) maxXP += 13
            }
                    
            if(/https:\/\/(media|cdn)\.discordapp\.net\/attachments\/\d{17,19}\/\d{17,19}\/(.*)\.(jpge?|png|gif|apg|mp4)/ig.test(reason)) maxXP += 18
    
            const _xp = Math.floor(Math.random() * (maxXP - 21)) + 21

            console.log(context.dbs.user.level.current, Utils.calculateLevels(xp + _xp).current)
            if(context.dbs.user.level.current.level < Utils.calculateLevels(xp + _xp).current.level) leveluped = true;
            console.log(leveluped)
            return _xp
        }

		if(typeof lastPunishmentApplied == 'object') {
			if(!user.bot) {
				if(user.id != context.user.id) {
					if(
						user.id != lastPunishmentApplied.user 
						|| (user.id == lastPunishmentApplied.user && lastPunishmentApplied.type != punishmentType)
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

        return { xp, leveluped }
    }
}

export default ModUtils;