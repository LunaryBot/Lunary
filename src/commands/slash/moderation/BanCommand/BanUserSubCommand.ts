import Command, { SubCommand, LunarClient, IContextInteractionCommand } from '../../../../structures/Command';
import Eris from 'eris';
import InteractionCollector from '../../../../utils/collector/Interaction';
import { ILog } from '../../../../@types/index.d';
import ModUtils from '../../../../utils/ModUtils';

class BanUserSubCommand extends SubCommand {
    constructor(client: LunarClient, mainCommand: Command) {
        super(client, {
            name: 'user',
            dirname: __dirname,
            permissions: {
                me: ['banMembers'],
                bot: ['lunarBanMembers'],
                discord: ['banMembers'],
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

        let { reason, replyMessageFn = context.interaction.createFollowup.bind(context.interaction) } = await ModUtils.punishmentReason.bind(this)(context, 1);

        
        if (reason === false) {
            return;
        }

        let days = Number(context.options.get('days')) || 0;

        if(typeof reason == 'object') {
            if(!days) {
                days = reason.days || 0;
            };
            
            reason = reason.text;
        }

        const ready = async(replyMessageFn: (content: Eris.InteractionEditContent, ...args: any[]) => Promise<any>) => {
            let notifyDM = true;

            try {
                if(member && context.options.get('notify-dm') != false) await (await user.getDMChannel()).createMessage({
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

            await context.guild.banMember(user.id, days, context.t('general:punishedBy', {
                author_tag: `${context.user.username}#${context.user.discriminator}`,
                reason
                })
                // @ts-ignore
                .shorten(512)
            )

            const logData = {
                reason: encodeURIComponent(reason as string),
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

            const id = await ModUtils.generatePunishmentID.bind(this)(logs);

            this.client.dbs.setLogs({
                [id]: log,
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
                    reason: reason as string,
                    duration: context.t('general:permanent'),
                    type: context.t('ban:punishmentType'),
                }, context.t, context.dbs.guild, context.channel);

                punishmentChannel.createMessage(content, files).catch(() => {});
            }

            let xp = context.dbs.user.xp;
            let leveluped = false;

            if(!member) {
				const { xp: _xp, leveluped: _leveluped } = ModUtils.generatePunishmentXP.bind(this)(context, user, reason as string, 1, logs, 39);

                context.dbs.user.xp = _xp;

                leveluped = _leveluped;
                xp = _xp;
			}

            context.dbs.user.lastPunishmentAppliedId = id;
            context.dbs.user.bans++;

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
}

export default BanUserSubCommand;