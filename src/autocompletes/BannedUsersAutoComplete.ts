import Eris from 'eris';
import AutoComplete from '../structures/AutoComplete';
import LunarClient from '../structures/LunarClient';
import CommandInteractionOptions from '../utils/CommandInteractionOptions';

class BannedUsersAutoComplete extends AutoComplete {
    public declare cache: Map<string, { username: string; id: string; }[]>;
    constructor(client: LunarClient) {
        super(client, {
            cacheClearInterval: 3 * 1000 * 60,
        });
    }

    public async run(interaction: Eris.AutocompleteInteraction, options: CommandInteractionOptions): Promise<any> {
        const { value: input } = options.focused as Eris.InteractionDataOptionsString;
        const bans = await this.getData(interaction.guildID as string);

        const output = input
            ? bans?.filter(ban => {
                const query = input?.toLowerCase().replace(/<@!?(\d{17,19})>/, '$1');

                return ban.username.toLowerCase().includes(input) || ban.id.toLowerCase().includes(input);
            })
            : bans;

        interaction.result(output?.slice(0, 25)?.map(ban => ({ name: ban.username, value: ban.id })) || []);

    }

    public async getData(guildID: string) {
        if(this.cache.has(guildID)) return this.cache.get(guildID);

        const bans = (await this.client.getGuildBans(guildID)).map(ban => ({ username: `${ban.user.username}#${ban.user.discriminator}`, id: ban.user.id }));

        this.cache.set(guildID, bans);

		return bans;
    } 
}

export default BannedUsersAutoComplete;