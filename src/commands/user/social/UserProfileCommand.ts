import { Command } from '@Command';
import type { CommandContext } from '@Contexts';
import { UserFlags, UserInventoryUsing } from '@Database';

import Template from '@structures/Template';

import { User } from '@discord';

import { ProfileInfos, ProfileTemplateBuilded } from '../../../@types';

class UserProfileSubCommand extends Command {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'User Profile',
			dirname: __dirname,
		});
	}

	public async run(context: CommandContext) {
		const user: User = context.options.get('user');

		const database = user.id == context.user.id
			? context.databases.user.toJson()
			: await this.client.prisma.user.findUnique({
				where: {
					id: user.id,
				},
			});

		const userFlags = user.id == context.user.id ? context.databases.user.flags : new UserFlags(database?.flags || 0n);

		const usingInventory = user.id == context.user.id ? context.databases.user.usingInventory : new UserInventoryUsing(database?.inventary_using || 0n);
        
		const profileTemplate = this.client.templates.find(template => template.name == usingInventory.profileLayout) as Template;

		const infos: ProfileInfos = {
			avatar: user.displayAvatarURL({ format: 'jpg', size: 1024 }),
			background: usingInventory.background,
			bio: database?.bio || '#Luna',
			flags: [
				...user.flags.toArray(),
				...userFlags.toArray(),
			],
			luas: database?.luas || 0,
			username: user.username,
			xp: database?.xp || 0,
		};

		const { buffer } = await profileTemplate.build(infos) as ProfileTemplateBuilded;

		context.createMessage({
			content: context.user.toString(),
		}, [
			{
				name: `profile-${user.id}.png`,
				data: buffer(),
			},
		]);
	}
}

export default UserProfileSubCommand;