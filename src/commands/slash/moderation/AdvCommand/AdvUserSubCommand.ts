import Command, { SubCommand, LunarClient, IContextInteractionCommand } from "../../../../structures/Command";

class AdvUserSubCommand extends SubCommand {
    constructor(client: LunarClient, mainCommand: Command) {
        super(client, {
            name: 'user',
            dirname: __dirname,
            permissions: {
                me: ["banMembers"],
                bot: ["lunaBanMembers"],
                discord: ["banMembers"],
            },
            guildOnly: true,
            cooldown: 3,
        }, mainCommand);
    }

    public async run(context: IContextInteractionCommand) {
        context.interaction.createModal({
            title: "Teste",
            custom_id: 'mymodal',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            custom_id: 'textinput',
                            label: 'label',
                            style: 2,
                            type: 4,
                        }
                    ]
                }
            ]
        });
    }
}

export default AdvUserSubCommand;