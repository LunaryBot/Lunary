import Collection from '@utils/Collection';

import { APITeam, APITeamMember } from 'discord-api-types/v10';


import Structure from './Base';
import { User } from './User';

class Team extends Structure<APITeam> {
	public icon: string | null;
	public id: string;
	public members: Collection<TeamMember>;
	public name: string;
	public ownerUserId: string;

	constructor(client: LunaryClient, raw: APITeam) {
		super(client, raw);

		this.id = raw.id;

		this._patch(raw);
	}

	public _patch(raw: APITeam) {
		this.name = raw.name;

		this.ownerUserId = raw.owner_user_id;

		if(raw.icon !== undefined && raw.icon !== null) {
			this.icon = raw.icon;
		}
		
		this.members = new Collection<TeamMember>(raw.members.map(member => [member.user.id, new TeamMember(this.client, member)]));
	}
}

class TeamMember extends Structure<APITeamMember> {
	public membershipState: 1 | 2;
	public permissions: Array<string>;
	public teamId: string;
	public user: User;

	constructor(client: LunaryClient, raw: APITeamMember) {
		super(client, raw);
		
		this.teamId = raw.team_id;

		this.user = new User(this.client, raw.user);

		this._patch(raw);
	}

	public _patch(raw: APITeamMember) {
		this.membershipState = raw.membership_state;

		this.permissions = raw.permissions;
	}

	public get id() {
		return this.user.id;
	}
}

export { Team, TeamMember };