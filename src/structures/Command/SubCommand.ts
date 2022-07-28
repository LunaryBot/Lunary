import Base from './Base';

import type { Command } from './Command';
import type { CommandGroup } from './CommandGroup';

import type { ICommandBase } from '../../@types';

class SubCommand extends Base {
	public parent: Command|CommandGroup;

	constructor(
		client: LunaryClient, 
		data: ICommandBase,
		parent: Command|CommandGroup
	) {
		super(client, {
			name: data.name,
			dirname: data.dirname || undefined,
			requirements: data.requirements || null,
			cooldown: data.cooldown || 0,
		});

		this.parent = parent;
	}

	public get commandName() {
		return `${this.parent.commandName} ${this.name}`;
	}
}

export { SubCommand };