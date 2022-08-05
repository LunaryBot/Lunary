import { RESTGetAPIOAuth2CurrentApplicationResult } from 'discord-api-types/v10';

import { OAuth2Scopes } from '@discord/types';

import Structure from './Base';
import { Team } from './Team';
import { User } from './User';


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

		Object.defineProperty(this, 'verifyKey', {
			enumerable: false,
			writable: false,
			value: data.verify_key,
		});

		this._patch(data);
	}

	public _patch(data: RESTGetAPIOAuth2CurrentApplicationResult) {
		this.name = data.name;

		if(data.icon) {
			this.icon = data.icon;
		}

		if(data.description) {
			this.description = data.description;
		}

		if(data.rpc_origins) {
			this.rpcOrigin = data.rpc_origins;
		}

		if(data.bot_public !== undefined) {
			this.botPublic = data.bot_public;
		}

		if(data.bot_require_code_grant !== undefined) {
			this.botRequireCodeGrant = data.bot_require_code_grant;
		}

		if(data.terms_of_service_url) {
			this.termsOfServiceUrl = data.terms_of_service_url;
		}

		if(data.privacy_policy_url) {
			this.privacyPolicyUrl = data.privacy_policy_url;
		}

		if(data.owner) {
			this.owner = new User(this.client, data.owner);
		}

		if(data.team) {
			this.team = new Team(this.client, data.team);
		}

		if(data.guild_id) {
			this.guildId = data.guild_id;
		}

		if(data.slug) {
			this.slug = data.slug;
		}

		if(data.cover_image) {
			this.coverImage = data.cover_image;
		}

		// @ts-ignore
		if(data.flags) {
			// @ts-ignore
			this.flags = data.flags;
		}

		if(data.tags) {
			this.tags = data.tags;
		}

		if(data.install_params) {
			this.installParams = data.install_params as any;
		}
	}
}

export { Application };