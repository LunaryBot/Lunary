import Command, { LunarClient, IContextInteractionCommand, ContextCommand, IContextMessageCommand } from '../../../structures/Command';

class QuickPunishmentCommand extends Command {
    constructor(client: LunarClient) {
        super(client, {
            name: 'quickpunishment',
            dirname: __dirname,
        });
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const userDB = context.dbs.user;

        const has = userDB.configs.has('quickPunishment');

        userDB.configs[has ? 'remove' : 'add']('quickPunishment');
        userDB.save();

        context.interaction.createFollowup({
            content: context.t(`quickpunishment:${!has ? 'enable' : 'disable'}`, {
                author: context.user.mention,
            }),
        });
    }
}

export default QuickPunishmentCommand;