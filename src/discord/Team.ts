import { APITeam, APITeamMember } from 'discord-api-types/v10';

import User from './User';

class Team {
    public icon: string | null;
    public id: string;
    public members: Array<TeamMember>;
    public name: string;
    public ownerUserId: string;

    constructor(data: APITeam) {
        this.icon = data.icon;

        this.id = data.id;

        this.members = data.members.map(member => new TeamMember(member));

        this.name = data.name;

        this.ownerUserId = data.id;
    }
}

class TeamMember {
    public membershipState: 1 | 2;
    public permissions: Array<string>;
    public teamId: string;
    public user: User;

    constructor(data: APITeamMember) {
        this.membershipState = data.membership_state;

        this.permissions = data.permissions;

        this.teamId = data.team_id;

        this.user = new User(data.user);
    }
}

export default Team;

export { TeamMember };