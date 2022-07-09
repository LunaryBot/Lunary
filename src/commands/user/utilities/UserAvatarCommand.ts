import Eris from 'eris';
import Command, { LunarClient, IContextInteractionCommand } from '../../../structures/Command';
import InteractionCollector from '../../../utils/collector/Interaction';
import { Colors } from '../../../utils/Constants';

const imageSizes = [128, 256, 512, 1024, 2048];

class UserAvatarCommand extends Command {
    constructor(client: LunarClient) {
        super(client, {
            name: 'User Avatar',
            dirname: __dirname,
        });
    }

    public async run(context: IContextInteractionCommand): Promise<any> {
        const user: Eris.User = context.options.get('user');

        const avatar = user.dynamicAvatarURL().replace(/^(.*)\?.*$/, '$1');

        const member: Eris.Member = context.options.get('user', { member: true });
        
        const globalComponents = [
            {
                url: avatar + '?size=2048',
                style: Eris.Constants.ButtonStyles.LINK,
                label: context.t('user_avatar:downloadImage'),
                type: 2,
            }
        ] as Eris.ActionRowComponents[];

        const globalMessage: Eris.InteractionContent = {
            embeds: [
                {
                    color: Colors.MAIN,
                    title: context.t('user_avatar:title', {
                        username: user.username,
                    }),
                    description: imageSizes.map(asl).join(' | '),
                    image: {
                        url: avatar + '?size=2048',
                    },
                }
            ],
            components: [
                {
                    type: 1,
                    components: globalComponents,
                }
            ],
        };

        if(!member || !member.avatar) return context.interaction.createMessage({ ...globalMessage, flags: Eris.Constants.MessageFlags.EPHEMERAL, });

        const guildAvatar = member.avatarURL.replace(/^(.*)\.(png|gif)\?.*$/, `$1${member.avatar.startsWith('a_') ? '.gif' : '.png'}`);

        globalComponents.push({
            custom_id: `${context.interaction.id}-guildAvatar`,
            style: Eris.Constants.ButtonStyles.SECONDARY,
            label: context.t('user_avatar:guildAvatar'),
            emoji: { id: '899822412043010088' },
            type: 2,
        });

        await context.interaction.createMessage({ ...globalMessage, flags: Eris.Constants.MessageFlags.EPHEMERAL, });

        const guildComponents = [
            {
                url: guildAvatar + '?size=2048',
                style: Eris.Constants.ButtonStyles.LINK,
                label: context.t('user_avatar:downloadImage'),
                type: 2,
            },
            {
                custom_id: `${context.interaction.id}-globalAvatar`,
                style: Eris.Constants.ButtonStyles.SECONDARY,
                label: context.t('user_avatar:globalAvatar'),
                emoji: { id: '899822412043010088' },
                type: 2,
            },
        ] as Eris.ActionRowComponents[];
        
        const guildMessage: Eris.InteractionContent = {
            embeds: [
                {
                    color: Colors.MAIN,
                    title: context.t('user_avatar:title', {
                        username: user.username,
                    }),
                    description: imageSizes.map(aslGuild).join(' | '),
                    image: {
                        url: guildAvatar + '?size=2048',
                    },
                }
            ],
            components: [
                {
                    type: 1,
                    components: guildComponents,
                }
            ],
        }

        const collector = new InteractionCollector(this.client, {
            time: 1 * 60 * 1000,
            user: context.user,
            filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
        });

        collector
            .on('collect', async(interaction: Eris.ComponentInteraction) => {
                const id = interaction.data.custom_id?.split('-')[1];

                switch(id) {
                    case 'guildAvatar': {
                        interaction.editParent(guildMessage);

                        break;
                    }

                    case 'globalAvatar': {
                        interaction.editParent(globalMessage);

                        break;
                    }
                }
            });

        function asl(size: number) {
			return `[x${size}](${avatar}?size=${size})`;
		}

		function aslGuild(size: number) {
			return `[x${size}](${guildAvatar}?size=${size})`;
		}
    }
}

export default UserAvatarCommand;