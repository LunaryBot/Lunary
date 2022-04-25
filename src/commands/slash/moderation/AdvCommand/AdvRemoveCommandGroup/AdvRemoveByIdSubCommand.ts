import Command, { SubCommand, LunarClient, IContextInteractionCommand } from "../../../../../structures/Command";

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
}

export default AdvRemoveByIdSubCommand;