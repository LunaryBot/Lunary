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
        context.interaction.createMessage({
            content: 'b'
        })
    }

    public autoComplete(interaction: AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {
        return this.client.getAutoComplete(AdvIdAutoComplete).run(interaction, options);
    }
}

export default AdvRemoveByIdSubCommand;