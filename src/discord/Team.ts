import { APITeam, APITeamMember } from 'discord-api-types/v10';

import Structure from './Base';
import { User } from './User';

class Team extends Structure {
	public icon: string | null;
	public id: string;
	public members: Array<TeamMember>;
	public name: string;
	public ownerUserId: string;

	constructor(client: LunaryClient, data: APITeam) {
		super(client);

		this.icon = data.icon;

		this.id = data.id;

		this.members = data.members.map(member => new TeamMember(this.client, member));

		this.name = data.name;

		this.ownerUserId = data.id;
	}
}

class TeamMember extends Structure {
	public membershipState: 1 | 2;
	public permissions: Array<string>;
	public teamId: string;
	public user: User;

	constructor(client: LunaryClient, data: APITeamMember) {
		super(client);
		
		this.membershipState = data.membership_state;

		this.permissions = data.permissions;

		this.teamId = data.team_id;

		this.user = new User(this.client, data.user);
	}
}

export { Team, TeamMember };