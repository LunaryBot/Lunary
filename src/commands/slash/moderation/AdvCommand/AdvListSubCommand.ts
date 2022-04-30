import Eris from 'eris';
import { ILog } from '../../../../@types';
import Command, { SubCommand, LunarClient, IContextInteractionCommand } from '../../../../structures/Command';
import chunk from '../../../../utils/Chunk';
import InteractionCollector from '../../../../utils/collector/Interaction';

interface IAdv extends ILog {
    type: 4;
    index: number;
}

class AdvListSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'list',
            dirname: __dirname,
            requirements: {
                permissions: {
                    discord: ['viewAuditLog'],
                    bot: ['lunarViewHistory'],
                },
                guildOnly: true,
            },
        }, parent);
    }

    public verifyPermissions(context: IContextInteractionCommand) {
        const data = {
            me: true,
            member: true,
        };

        const user = context.options.get('user') as Eris.User;

        if(user && user.id !== context.user.id) {
            return super.verifyPermissions(context, data);
        }

        return data;
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const user: Eris.User = context.options.get('user') || context.user;

        const logs: ILog[] = Object.entries(await this.client.dbs.getLogs() || {})
			.map(function ([k, v], i) {
				const data = JSON.parse(Buffer.from(v, 'base64').toString('ascii'));
				data.id = k;
				return data;
			})
			.filter(x => x.server == context.guild.id);

        const advs = logs
			.filter(x => x.user == user.id && x.type == 4)
			?.sort((a, b) => b.date - a.date)
			.map((data, i) => {
				return {...data, index: i};
			});
        
        if(!advs?.length) {
            return context.interaction.createFollowup({
                content: context.t('adv_list:noWarnings'),
            }).catch(() => {});
        }

        const chunks = chunk(advs, 3);
        let index = 0;

        let _components = [] as Eris.ActionRow[];

        const chunkPage = async(_index = 0): Promise<Eris.MessageContent> => {
			const embed = {
                author: {
                    name: context.t('adv_list:title', { user: `${user.username}#${user.discriminator}` }),
                    icon_url: 'https://media.discordapp.net/attachments/880176654801059860/905286547421659166/emoji.png',
                },
                color: 16705372,
                thumbnail: {
                    url: user.dynamicAvatarURL('jpg', 2048),
                },
                fields: [],
                type: 'rich',
            } as Eris.Embed;

            for(const adv of chunks[_index] as IAdv[]) {
                const author = await (this.client.users.get(adv.author) || this.client.getRESTUser(adv.author));

                embed.fields?.push({
                    name: `\`[ ${adv.index + 1} ]\`: ${adv.id}`,
                    value: `**- ${context.t('adv_list:reason')}:** \`\`\`${decodeURI(adv.reason)}\`\`\`\n- **${context.t('adv_list:punishedBy')}:** ${author.username}**#${author.discriminator}**(\`${adv.author}\`)\n- <t:${Math.floor((adv.date + 3600000) / 1000.0)}>`,
                })
            }

            const components = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            custom_id: `${context.interaction.id}-back`,
                            style: Eris.Constants.ButtonStyles.SECONDARY,
                            emoji: { id: '905602424495026206' },
                            disabled: !_index,
                        },
                        {
                            type: 2,
                            custom_id: `${context.interaction.id}-next`,
                            style: Eris.Constants.ButtonStyles.SECONDARY,
                            emoji: { id: '905602508037181451' },
                            disabled: !chunks[_index + 1]?.length,
                        }
                    ]
                }
            ] as Eris.ActionRow[];

            _components = components;

			return {
				embed,
                components,
			};
		}

        await context.interaction.createFollowup(await chunkPage(index));

        const collector = new InteractionCollector(this.client, {
            time: 1 * 60 * 1000,
            user: context.user,
            filter: (interaction: Eris.ComponentInteraction) => interaction.data.custom_id?.startsWith(`${context.interaction.id}-`),
        });

        collector
            .on('collect', async(interaction: Eris.ComponentInteraction) => {
                const id = interaction.data.custom_id?.split('-')[1];

                switch(id) {
                    case 'back': {
                        if (index <= 0) index = chunk.length;
						else index--;
						break;
                    }

                    case 'next': {
                        if (index >= chunk.length) index = 0;
						else index++;
						break;
                    }
                }

                await interaction.editParent(await chunkPage(index) as Eris.InteractionEditContent);
            })
            .on('end', () => {
                _components.map(row => row.components?.map(y => { y.disabled = true; return y; }));

                context.interaction.editOriginalMessage({
                    components: _components,
                });
            });
        
        return;
    }
}

export default AdvListSubCommand;