import { User } from "eris";
import { ILog } from "../../../../../@types";
import Command, { SubCommand, LunarClient, IContextInteractionCommand } from "../../../../../structures/Command";

class AdvRemoveByUserSubCommand extends SubCommand {
    constructor(client: LunarClient, mainCommand: Command) {
        super(client, {
            name: 'user',
            dirname: __dirname,
            requirements: {
                permissions: {
                    bot: ["lunarManageHistory"],
                    discord: ["manageMessages"],
                },
                guildOnly: true,
            },
            cooldown: 3,
        }, mainCommand);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const user = context.options.get('user') as User;

        
        const amount = context.options.get('amount') as string;
        
        let logs: ILog[] = Object.entries(await this.client.dbs.getLogs() || {})
            .map(function ([k, v], i) {
                const data = JSON.parse(Buffer.from(v, 'base64').toString('ascii'));
                data.id = k;
                return data;
            })
            .filter(x => x.server == context.guild.id);
        
        const advs = logs.filter(x => x.user == user.id && x.type == 4)?.sort((a, b) => b.date - a.date);

        if (!advs.length)
            return context.interaction
                .createFollowup({
                    content: context.t('adv_remove_user:noWarning'),
                })
        
        const deladvs = amount != 'all' ? advs.slice(0, Number(amount) || 1) : advs;
        
        await deladvs.forEach(adv => this.client.dbs.removeLog(adv.id));

        return context.interaction
            .createFollowup({
                content: context.t(`adv_remove_user:deletedWarning${deladvs.length > 1 ? 's' : ''}`, {
                    amount: deladvs.length,
                    author_mention: context.user.mention,
                    user_tag: `${user.username}#${user.discriminator}`,
                    user_id: user.id,
                }),
            });
    }
}

export default AdvRemoveByUserSubCommand;