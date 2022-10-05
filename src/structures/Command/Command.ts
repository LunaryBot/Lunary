import type { CommandBase } from '@types';

import Base from './Base';
import type { CommandGroup } from './CommandGroup';
import type { SubCommand } from './SubCommand';

class Command extends Base {
	public aliases: Array<string>;
	public subcommands: Array<SubCommand|CommandGroup>;

	constructor(
		client: LunaryClient,
		data: CommandBase & { aliases?: Array<string>, subcommands?: Array<any> }
	) {
		super(client, {
			name: data.name,
			dirname: data.dirname || undefined,
			requirements: data.requirements || null,
			cooldown: data.cooldown || 0,
		});

		this.aliases = data.aliases || [];

		this.subcommands = data.subcommands || [];
	};
}

export { Command };