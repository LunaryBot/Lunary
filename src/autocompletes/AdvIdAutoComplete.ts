import Eris from 'eris';
import AutoComplete from '../structures/AutoComplete';
import LunarClient from '../structures/LunarClient';
import CommandInteractionOptions from '../utils/CommandInteractionOptions';

class AdvIdAutoComplete extends AutoComplete {
    constructor(client: LunarClient) {
        super(client, {
            cacheClearInterval: 0,
        });
    }

    public async run(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {
        interaction.result([
            {
                name: 'test',
                value: 'test',
            }
        ])
    }
}

export default AdvIdAutoComplete;