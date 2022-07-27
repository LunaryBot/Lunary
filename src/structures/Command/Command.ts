import Base from './Base';

import type { ICommandBase } from '../../@types';
import type { SubCommand } from './SubCommand';
import type { CommandGroup } from './CommandGroup';

class Command extends Base {
	public aliases: Array<string>;
	public subcommands: Array<SubCommand|CommandGroup>;

	constructor(
		client: LunaryClient,
		data: ICommandBase & { aliases?: Array<string>, subcommands?: Array<any> }
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