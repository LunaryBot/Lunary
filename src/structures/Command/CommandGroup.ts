import type { Command } from './Command';
import type { SubCommand } from './SubCommand';

class CommandGroup {
	declare public client: LunaryClient;

	public name: string;
	public subcommands: SubCommand[];
	public parent: Command;

	constructor(
		client: LunaryClient, 
		data: CommandGroup, 
		parent: Command
	) {
		this.name = data.name;
		this.subcommands = data.subcommands || [];
		this.parent = parent;

		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});
	}

	public get commandName() {
		return `${this.parent.commandName} ${this.name}`;
	}
}

export { CommandGroup };