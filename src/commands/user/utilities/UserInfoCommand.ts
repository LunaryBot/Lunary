import Eris from 'eris';
import Command, { LunarClient, IContextInteractionCommand } from '../../../structures/Command';
import InteractionCollector from '../../../utils/collector/Interaction';
import { BadgesEmojis, Colors } from '../../../utils/Constants';

const { Constants: { UserFlags }} = Eris;

class UserInfoCommand extends Command {
    constructor(client: LunarClient) {
        super(client, {
            name: 'User Info',
            dirname: __dirname,
        });
    }

    public async run(context: IContextInteractionCommand): Promise<any> {
        const user: Eris.User = context.options.get('user');

        const member: Eris.Member = context.options.get('user', { member: true });
        
        const badges = Object.entries(BadgesEmojis).map(([key, value]) => {
            const flag = UserFlags[key as keyof typeof UserFlags];

            if (flag && ((user.publicFlags || 0) & flag) === flag) {
                return value;
            }

            return null;
        }).filter(Boolean).reverse();

        if(context.guild?.ownerID === user.id) {
            badges.push(':crown:');
        }

        const embeds = [
            {
                color: Colors.MAIN,
                author: {
                    name: context.t('user_info:userInformation'),
                },
                title: user.username,
                url: `https://discordapp.com/users/${user.id}`,
                thumbnail: {
                    url: user.dynamicAvatarURL(undefined, 2048),
                },
                description: badges?.length ? `> ${badges.reverse().join(' ')}` : undefined,
                fields: [
                    {
                        name: `:bookmark: ${context.t('user_info:userTagDiscord')}:`,
                        value: `${user.username}#${user.discriminator}`,
                        inline: true,
                    },
                    {
                        name: `:computer: ${context.t('user_info:userIdDiscord')}:`,
                        value: `${user.id}`,
                        inline: true,
                    },
                    {
                        name: `:calendar_spiral: ${context.t('user_info:userCreatedTimestamp')}`,
                        value: `<t:${Math.floor((user.createdAt + 3600000) / 1000.0)}> (<t:${Math.floor((user.createdAt + 3600000) / 1000.0)}:R>)`
                    }
                ]
            }
        ] as Eris.Embed[];

        const components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: context.t('user_info:userAvatar'),
                        url: user.dynamicAvatarURL(undefined, 1024),
                        style: Eris.Constants.ButtonStyles.LINK,
                    }
                ],
            }
        ] as Eris.ActionRow[];

        if(member) {
            const guildAvatar = member.avatar ? member.avatarURL?.replace(/^(.*)\.(png|gif)\?.*$/, `$1${member.avatar?.startsWith('a_') ? '.gif' : '.png'}`) + '?size=2048' : undefined;

            const embed = {
                color: this.Utils.displayColor(member),
                author: {
                    name: context.t('user_info:memberInformation'),
                },
                title: member.nick || user.username,
                thumbnail: {
                    url: guildAvatar || user.dynamicAvatarURL(undefined, 2048),
                },
                fields: [
                    {
                        name: `:star2: ${context.t('user_info:memberJoinedTimestamp')}`,
                        value: `<t:${Math.floor((member.joinedAt as number + 3600000) / 1000.0)}> (<t:${Math.floor((member.joinedAt as number + 3600000) / 1000.0)}:R>)`,
                    }
                ]
            } as Eris.Embed;

            if(member.premiumSince) {
                embed.fields?.push({
                    name: `<:booster:892131133800742973> ${context.t('user_info:memberPremiumSinceTimestamp')}`,
                    value: `<t:${Math.floor((member.premiumSince as number + 3600000) / 1000.0)}> (<t:${Math.floor((member.premiumSince as number + 3600000) / 1000.0)}:R>)`,
                });
            }

            embed.fields?.push({
                name: `<:L_pulica:959094660167512105> ${context.t('user_info:memberTimeoutedTimestamp')}`,
                value: member.communicationDisabledUntil ? `<t:${Math.floor((member.communicationDisabledUntil as number) / 1000.0)}> (<t:${Math.floor((member.communicationDisabledUntil as number) / 1000.0)}:R>)` : context.t('user_info:memberNotTimeouted'),
            });

            embeds.push(embed);

            if(guildAvatar) components[0].components.push({
                type: 2,
                label: context.t('user_info:memberAvatar'),
                url: guildAvatar,
                style: Eris.Constants.ButtonStyles.LINK,
            });

            components.push({
                type: 1,
                components: [
                    {
                        type: 2,
                        label: context.t('user_info:memberPermissionsButton'),
                        custom_id: `${context.interaction.id}-permissions`,
                        style: Eris.Constants.ButtonStyles.SECONDARY,
                        emoji: { name: '🔑' },
                    }
                ]
            });
        }

        context.interaction.createMessage({ embeds, components, flags: Eris.Constants.MessageFlags.EPHEMERAL });

        if(!member) return;

        const collector = new InteractionCollector(this.client, {
            time: 1 * 60 * 1000,
            user: context.user,
            filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
        });

        collector.on('collect', (interaction: Eris.ComponentInteraction) => {
            const id = interaction.data.custom_id?.split('-')[1];

            switch(id) {
                case 'permissions': {
                    const permissions = Object.entries(Eris.Constants.Permissions).map(([key, flag], i, array) => {
                        if(key.startsWith('all') || array[i - 1]?.[1] == flag) return null;

                        if (flag && (member.permissions.allow & flag) === flag) {
                            return key;
                        }

                        return null;
                    }).filter(Boolean).map(key => {
                        const t = context.t(`permissions:${key}`);

                        if(t == ':bug:') return key;

                        return `\`${t}\``;
                    });

                    const rankPermissions = (() => {
                        if (context.guild.ownerID == user.id) return `(${context.t('user_info:rankOwner')})`;
						else if (member.permissions.has('administrator')) return `(${context.t('user_info:rankAdminstrator')})`;
						else return '';
                    })();

                    const roles = member.roles.sort((a, b) => {
                        const roles = context.guild.roles;

                        return (roles.get(b)?.position as number) - (roles.get(a)?.position as number);
                    });

                    const embed = {
                        color: this.Utils.displayColor(member),
                        fields: [
                            {
                                name: `<:Tools:853645102575910963> ${context.t('user_info:memberRoles', { size: roles.length })}`,
                                value: `> ${(roles.slice(0, 40).map(roleID => `<@&${roleID}>`).join(', ') || context.t('user_info:memberNoRoles')) + (roles.length > 40 ? ` ${context.t('user_info:andMoreRoles', { size: roles.length - 40 })}` : '')}`,
                            },
                            {
                                name: `:closed_lock_with_key: ${context.t('user_info:memberPermissions', { rankPermissions })}`,
                                value: `> ${permissions.length ? permissions.join(', ') : context.t('user_info:memberNoPermissions')}`,
                            }
                        ]
                    } as Eris.Embed;

                    interaction.createMessage({ embeds: [embed], flags: Eris.Constants.MessageFlags.EPHEMERAL });
                    break;
                }
            }
        });
    }
}

export default UserInfoCommand;