import Eris from 'eris';
import AutoComplete from '../structures/AutoComplete';
import LunarClient from '../structures/LunarClient';
import CommandInteractionOptions from '../utils/CommandInteractionOptions';

class AdvIdAutoComplete extends AutoComplete {
    public declare cache: Map<string, string[]>;
    constructor(client: LunarClient) {
        super(client, {
            cacheClearInterval: 3 * 1000 * 60,
        });
    }

    public async run(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {
        const { value: input } = options.focused as Eris.InteractionDataOptionsString;
        const advs = await this.getData(interaction.guildID as string);
        
        const output = input
            ? advs?.filter(adv => adv.toLowerCase().includes(input.toLowerCase()))
            : advs;
        
        interaction.result(output?.map(adv => ({ name: adv, value: adv })) || []);
    }

    public async getData(guildID: string) {
        if(this.cache.has(guildID)) return this.cache.get(guildID);

        const logs = await this.client.dbs.getLogs();
		const advs: string[] = Object.entries(logs || {})
		    .map(function ([id, log], i) {
				return {...log, id};
			})
			.filter(x => x.guild == guildID && x.type == 4)
			?.sort((a, b) => b.timestamp - a.timestamp)
			.map(x => x.id)
			.filter(x => x);

        this.cache.set(guildID, advs);

		return advs;
    } 
}

export default AdvIdAutoComplete;