import Eris from 'eris';
import BannedUsersAutoComplete from '../../../../autocompletes/BannedUsersAutoComplete';
import Command, { SubCommand, IContextInteractionCommand, LunarClient } from '../../../../structures/Command';
import InteractionCollector from '../../../../utils/collector/Interaction';
import CommandInteractionOptions from '../../../../utils/CommandInteractionOptions';

class BanInfoSubCommand extends SubCommand {
    public minimalResemblance: number = 0.7;

    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'info',
            dirname: __dirname,
            requirements: {
                permissions: {
                    discord: ['banMembers'],
                    bot: ['lunarBanMembers'],
                    me: ['banMembers'],
                },
                guildOnly: true,
            },
        }, parent);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const query = (context.options.get('user') as string).replace(/<@!?(\d{17,19})>/, '$1');

        const bans = await context.guild.getBans();

        let ban = bans?.find(({ user }) => [`${user.username}#${user.discriminator}`.toLowerCase(), user.id].includes(query.toLowerCase()));

        let replyMessageFn: (content: Eris.InteractionEditContent, ...args: any[]) => Promise<any> = context.interaction.createFollowup.bind(context.interaction);

        if(!ban) {
            ban = await (new Promise(async resolve => {
                const similars = bans?.filter(({ user }) => {
                    const similarity = `${user.username}#${user.discriminator}`.toLowerCase().checkSimilarityStrings(query.toLowerCase());
                    return similarity >= this.minimalResemblance;
                });

    
                if(similars?.length) {
                    const components = [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: `${context.interaction.id}-banSelect`,
                                    max_values: 1,
                                    min_values: 1,
                                    options: similars
                                        .sort((a, b) => `${a.user.username}#${a.user.discriminator}`.localeCompare(`${b.user.username}#${b.user.discriminator}`))
                                        .slice(0, 25)
                                        .map(({ user }) => ({
                                            label: `${user.username}#${user.discriminator}`,
                                            value: user.id,
                                        })),
                                }
                            ]
                        }
                    ] as Eris.ActionRow[];
                    
                    await replyMessageFn({
                        content: context.t('ban_info:selectUserMessage'),
                        components,
                    });

                    const collector = new InteractionCollector(this.client, {
                        max: 1,
                        time: 30000,
                        user: context.user,
                        filter: (interaction: Eris.ComponentInteraction) => interaction.data?.custom_id === `${context.interaction.id}-banSelect`,
                    });

                    collector
                        .on('collect', async (interaction: Eris.ComponentInteraction) => {
                            const value = (interaction.data as Eris.ComponentInteractionSelectMenuData).values[0];

                            replyMessageFn = interaction.editParent.bind(interaction);
                            
                            resolve(bans?.find(({ user }) => user.id === value));

                            collector.stop();
                        })
                        .on('end', (reason?: string) => {
                            if(reason == 'timeout') {
                                components.map(row => row.components.map(c => {
                                    c.disabled = true;
        
                                    if (c.type == 3) {
                                        c.placeholder = context.t('general:timeForSelectionEsgotated').shorten(100);
                                    }
        
                                    return c;
                                }));
                                
                                context.interaction.editOriginalMessage({
                                    components,
                                });

                                resolve(undefined);
                            }
                        });
                } else {
                    await replyMessageFn({
                        content: context.t('ban_info:userNotBanned'),
                    });

                    resolve(undefined);
                }
            }));
        }

        if(!ban) return;

        const { reason, user } = ban;

        const embed = {
            color: 16065893,
            title: context.t('ban_info:embed.title'),
            description: `**- ${context.t('ban_info:embed.userBanned')}**\nㅤ${user.mention} (\`${user.username}#${user.discriminator} - ${user.id}\`)`,
            fields: [
                {
                    name: context.t('ban_info:embed.reason'),
                    value: `\`\`\`${reason || context.t('general:reasonNotInformed.defaultReason')}\`\`\``
                }
            ],
            thumbnail: {
                url: user.dynamicAvatarURL('png', 2048)
            },
            timestamp: new Date(),
        } as Eris.Embed;

        await replyMessageFn({
            embeds: [embed],
            components: [],
            content: '',
        });
    }

    public autoComplete(interaction: Eris.AutocompleteInteraction<Eris.TextableChannel>, options: CommandInteractionOptions) {
        return this.client.getAutoComplete(BannedUsersAutoComplete).run(interaction, options);
    }
}

export default BanInfoSubCommand;