import { ApplicationCommandOptionType } from '@discord/types';

import type { APIApplicationCommandInteractionDataStringOption, APIApplicationCommandInteractionDataNumberOption } from '@discord/types';
import type { GuildTextChannel, Member, Role, User, Message } from '@discord';

import Collection from './Collection';

interface CommandInteractionOptionsResolved {
    users?: Collection<User>;
    members?: Collection<Omit<Member, 'user' | 'mute' | 'deaf'>>;
    roles?: Collection<Role>;
    channels?: Collection<GuildTextChannel>;
    messages?: Collection<Message>;
}

class CommandInteractionOptions extends Array {
	public _group: string | null;
	public _subcommand: string | null;
	public resolved: CommandInteractionOptionsResolved;
	public focused: APIApplicationCommandInteractionDataNumberOption | APIApplicationCommandInteractionDataStringOption | null;

	constructor(resolved: CommandInteractionOptionsResolved | undefined, args: any[]) {
		super(...args);

		this.resolved = resolved || {};
		this._group = null;
		this._subcommand = null;
		this.focused = null;

		if(this[0]?.type == ApplicationCommandOptionType.SubcommandGroup) {
			this._group = this[0].name;
			this.setOptions(...(this[0].options || []));
		};

		if(this[0]?.type == ApplicationCommandOptionType.Subcommand) {
			this._subcommand = this[0].name;
			this.setOptions(...(this[0].options || []));
		};

		this.focused = this.find(x => x.focused === true) ?? null;
	}

	public setOptions(...options: any[]) {
		this.length = 0;
		this.push(...options);
	}

	public get(key: string, { member = false }: { member?: boolean } = {}): any {
		const option = this.find(option => option.name == key);

		if(!option) return undefined;

		if(option.type == ApplicationCommandOptionType.User) {
			if(member == true) {
				return this.resolved.members?.get(option.value);
			} else {
				return this.resolved.users?.get(option.value);
			};
		}

		if(option.type == ApplicationCommandOptionType.Role) {
			return this.resolved.roles?.get(option.value);
		}

		if(option.type == ApplicationCommandOptionType.Channel) {
			return this.resolved.channels?.get(option.value);
		}

		if(option.type == 'MESSAGE') {
			return this.resolved.messages?.get(option.value);
		}

		return option.value;
	}
}

export default CommandInteractionOptions;