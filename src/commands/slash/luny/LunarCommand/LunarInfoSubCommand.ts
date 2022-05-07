import Eris from 'eris';
import Command, { SubCommand, IContextInteractionCommand, LunarClient } from '../../../../structures/Command';
import quick from 'quick.db';

class LunarInfoSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'info',
            dirname: __dirname,
        }, parent);
    }

    public async run(context: IContextInteractionCommand): Promise<any> {
        
    }
}

export default LunarInfoSubCommand;