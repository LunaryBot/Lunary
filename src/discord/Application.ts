import { RESTGetAPIOAuth2CurrentApplicationResult } from 'discord-api-types/v10';

import Structure from './Base';
import { Team } from './Team';
import { User } from './User';

import { OAuth2Scopes } from '@discord/types';

class Application extends Structure {
	public id: string;
	public name: string;
	public icon: string | null;
	public description: string;
	public rpcOrigin?: Array<string>;
	public botPublic: boolean;
	public botRequireCodeGrant: boolean;
	public termsOfServiceUrl?: string;
	public privacyPolicyUrl?: string;
	public owner: User;
	public readonly verifyKey: string;
	public team: Team;
	public guildId?: string;
	public slug?: string;
	public coverImage?: string;
	public flags?: number;
	public tags?: [string, (string | undefined)?, (string | undefined)?, (string | undefined)?, (string | undefined)?] | undefined;
	public installParams?: {
        scopes: Array<OAuth2Scopes>;
        permissions: string;
    };

	constructor(client: LunaryClient, data: RESTGetAPIOAuth2CurrentApplicationResult) {
		super(client);

		this.id = data.id;

		this.name = data.name;

		this.icon = data.icon;

		this.description = data.description;

		this.rpcOrigin = data.rpc_origins;

		this.botPublic = data.bot_public;

		this.botRequireCodeGrant = data.bot_require_code_grant;

		this.termsOfServiceUrl = data.terms_of_service_url;

		this.privacyPolicyUrl = data.privacy_policy_url;

		// this.owner = data.owner ? new User(data.owner) : undefined as any;

		Object.defineProperty(this, 'verifyKey', {
			enumerable: false,
			writable: false,
			value: data.verify_key,
		});

		this.team = data.team ? new Team(this.client, data.team) : undefined as any;

		this.guildId = data.guild_id;

		this.slug = data.slug;

		this.coverImage = data.cover_image;

		// @ts-ignore
		this.flags = data.flags;

		this.tags = data.tags;

		this.installParams = data.install_params as any;
	}
}

export { Application };