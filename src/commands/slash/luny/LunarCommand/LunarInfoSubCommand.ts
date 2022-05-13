import Eris from 'eris';
import Command, { SubCommand, IContextInteractionCommand, LunarClient, CommandGroup } from '../../../../structures/Command';
import quick from 'quick.db';
import { Colors, Links } from '../../../../utils/Constants';

const ownerID = '452618703792766987';

class LunarInfoSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'info',
            dirname: __dirname,
        }, parent);
    }

    public async run(context: IContextInteractionCommand): Promise<any> {
        const guildsCount = (await this.client.cluster.eval('this.client.guilds.size')).results.reduce((a, b) => a + b, 0);
        
        const commandsCount = this.client.commands.slash.map(c => { const subcommands = c.subcommands?.map(sc => (sc as CommandGroup).subcommands?.length ? (sc as CommandGroup).subcommands : sc)?.flat(Infinity); return subcommands.length ? subcommands : c }).flat(Infinity).length;

        const executedCommandsCount = quick.get('executedCommands');

        const owner = this.client.users.get(ownerID) || await this.client.getRESTUser(ownerID);

        const invite = this.client.generateOAuth2({
			permissions: 8,
			redirect_uri: `${Links.website.callback}`,
			scopes: ['bot', 'applications.commands', 'guilds', 'identify'],
            response_type: 'code',
		});

        await context.interaction.createMessage({
            embeds: [
                {
                    author: {
                        name: context.t('lunar_info:title'),
                        url: Links.website.home,
                    },
                    description: context.t('lunar_info:message', {
                        author: context.user.mention,
                        guildsCount,
                        commandsCount,
                        executedCommandsCount,
                        invite,
                        support: Links.support,
                        vote: Links.vote,
                        website: Links.website.home,
                    }),
                    color: Colors.MAIN,
                    thumbnail: {
                        url: 'https://imgur.com/iacDuXp.png',
                    },
                    footer: {
                        text: context.t('lunar_info:createdBy', {
                            owner_tag: `${owner.username}#${owner.discriminator}`,
                        }),
                        icon_url: owner.dynamicAvatarURL(),
                    },
                    image: {
                        url: 'https://imgur.com/uIIhFYA.png',
                        height: 250,
                        width: 970,
                    } as Eris.EmbedImage,
                },
            ],
        });
    }
}

export default LunarInfoSubCommand;