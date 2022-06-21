import { User } from "eris";
import { IPunishmentLog } from "../../../../../@types";
import Command, { SubCommand, LunarClient, IContextInteractionCommand } from "../../../../../structures/Command";

class AdvRemoveByUserSubCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
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
        }, parent);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const user = context.options.get('user') as User;

        
        const amount = context.options.get('amount') as string;
        
        let logs: IPunishmentLog[] = Object.entries(await this.client.dbs.getLogs() || {})
            .map(function ([id, log], i) {
                log.id = id;
                return log;
            })
            .filter(x => x.guild == context.guild.id);
        
        const advs = logs.filter(x => x.user == user.id && x.type == 4)?.sort((a, b) => b.timestamp - a.timestamp);

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