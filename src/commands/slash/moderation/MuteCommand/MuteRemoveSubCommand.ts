import { Member } from 'eris';
import { ILog } from '../../../../@types';
import Command, { SubCommand, LunarClient, IContextInteractionCommand } from '../../../../structures/Command';

class MuteRemoveCommand extends SubCommand {
    constructor(client: LunarClient, parent: Command) {
        super(client, {
            name: 'remove',
            dirname: __dirname,
            requirements: {},
            cooldown: 3,
        }, parent);
    }

    public async run(context: IContextInteractionCommand) {
        await context.interaction.acknowledge();

        const user = context.options.get('user', { member: true }) as Member;

        if(!user.communicationDisabledUntil || user.communicationDisabledUntil < Date.now()) {
            return context.interaction
                .createFollowup({
                    content: context.t('mute_remove:userNotMuted', {
                        user_tag: `${user.username}#${user.discriminator}`,
                    }),
                })
        }

        const reason = (context.options.get('reason') || context.t('general:reasonNotInformed.defaultReason')) as string;

        user.edit({
            communicationDisabledUntil: null
        }, context.t('mute_remove:requestedBy', {
            author_tag: `${context.user.username}#${context.user.discriminator}`,
            reason,
        }).shorten(500));

        return context.interaction.createFollowup({
            content: context.t('mute_remove:removeMute', {
                author_mention: context.user.mention,
                user_tag: `${user.username}#${user.discriminator}`,
                user_id: user.id,
            }),
        })
    }
}

export default MuteRemoveCommand;