import { AutocompleteInteraction } from "eris";
import AdvIdAutoComplete from "../../../../../autocompletes/AdvIdAutoComplete";
import Command, { SubCommand, LunarClient, IContextInteractionCommand } from "../../../../../structures/Command";
import CommandInteractionOptions from "../../../../../utils/CommandInteractionOptions";

class AdvRemoveByIdSubCommand extends SubCommand {
    constructor(client: LunarClient, mainCommand: Command) {
        super(client, {
            name: 'id',
            dirname: __dirname,
            requirements: {
                permissions: {
                    me: ["banMembers"],
                    bot: ["lunarBanMembers"],
                    discord: ["banMembers"],
                },
                guildOnly: true,
            },
            cooldown: 3,
        }, mainCommand);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const id = context.options.get('id') as string;
        
        const adv = await this.client.dbs.getLog(id);

        if(!adv) return context.interaction.createFollowup({
            content: context.t('adv_remove_id:warningNotFound', {
                id: id.replace(/`/g, '')
            })
        })

        const user = await (this.client.users.get(adv.user) || this.client.getRESTUser(adv.user));

        await this.client.dbs.removeLog(id);

        await context.interaction
			.createFollowup({
				content: context.t('adv_remove_id:warningRemoved', {
					id,
					author_mention: context.user.mention,
					user_tag: `${user.username}#${user.discriminator}`,
					user_id: user.id,
				}),
			})

        return;
    }

    public autoComplete(interaction: AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {
        return this.client.getAutoComplete(AdvIdAutoComplete).run(interaction, options);
    }
}

export default AdvRemoveByIdSubCommand;