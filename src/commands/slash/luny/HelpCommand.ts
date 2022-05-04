import Eris from 'eris';
import Command, { LunarClient, IContextInteractionCommand } from '../../../structures/Command';
import { Colors, Links } from '../../../utils/Constants';

const buttonBase = {
    type: 2,
    style: Eris.Constants.ButtonStyles.LINK,
} as Eris.Button;

class HelpCommand extends Command {
    constructor(client: LunarClient) {
        super(client, {
            name: 'help',
            dirname: __dirname,
        });
    }

    public async run(context: IContextInteractionCommand): Promise<any> {
        const invite = this.client.generateOAuth2({
			permissions: 8,
			redirect_uri: `${Links.website.callback}`,
			scopes: ['bot', 'applications.commands', 'guilds', 'identify'],
            response_type: 'code',
		});

        const embed = {
            author: {
                name: context.t('help:title', {
                    username: this.client.user.username,
                }),
                icon_url: this.client.user.avatarURL,
                url: Links.website.home,
            },
            description: context.t('help:description', {
                author: context.user.mention,
            }),
            fields: [
                {
                    name: context.t('help:links.commands'),
                    value: `> ${Links.website.commands}`,
                },
                {
                    name: context.t('help:links.invite'),
                    value: `> [${Links.website.invite}](${invite})`,
                },
                {
                    name: context.t('help:links.support'),
                    value: `> [${Links.website.support}](${Links.support})`,
                },
                {
                    name: context.t('help:links.vote'),
                    value: `> [${Links.website.vote}](${Links.vote})`,
                },
                {
                    name: context.t('help:links.dashboard'),
                    value: `> ${Links.website.dashboard.me}`,
                }
            ],
            thumbnail: {
                url: 'https://imgur.com/iacDuXp.png',
            },
            color: Colors.MAIN,
        } as Eris.Embed;

        const components = [
            {
                type: 1,
                components: [
                    {
                        ...buttonBase,
                        url: invite,
                        label: context.t('help:buttons.inviteMe'),
                    },
                    {
                        ...buttonBase,
                        url: Links.support,
                        label: context.t('help:buttons.support'),
                    },
                    {
                        ...buttonBase,
                        url: Links.website.home,
                        label: context.t('help:buttons.website'),
                    },
                ]
            }
        ] as Eris.ActionRow[];

        return context.interaction.createMessage({
            embeds: [embed],
            components,
        })
    }
}

export default HelpCommand;