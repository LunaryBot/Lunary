import Command, { SubCommand, LunarClient } from "../../../../../structures/Command";

class BanRemoveByIdSubCommand extends SubCommand {
    constructor(client: LunarClient, mainCommand: Command) {
        super(client, {
            name: 'id',
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
}

export default BanRemoveByIdSubCommand;