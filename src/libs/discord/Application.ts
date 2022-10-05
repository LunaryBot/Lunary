import { OAuth2Scopes } from '@discord/types';

import { RESTGetAPIOAuth2CurrentApplicationResult as RESTGetMeApplication } from 'discord-api-types/v10';


import Structure from './Base';
import { Team } from './Team';
import { User } from './User';


class Application extends Structure<RESTGetMeApplication> {
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

	constructor(client: LunaryClient, raw: RESTGetMeApplication) {
		super(client, raw);

		this.id = raw.id;

		Object.defineProperty(this, 'verifyKey', {
			enumerable: false,
			writable: false,
			value: raw.verify_key,
		});

		this._patch(raw);
	}

	public _patch(raw: RESTGetMeApplication) {
		this.name = raw.name;

		if(raw.icon) {
			this.icon = raw.icon;
		}

		if(raw.description) {
			this.description = raw.description;
		}

		if(raw.rpc_origins) {
			this.rpcOrigin = raw.rpc_origins;
		}

		if(raw.bot_public !== undefined) {
			this.botPublic = raw.bot_public;
		}

		if(raw.bot_require_code_grant !== undefined) {
			this.botRequireCodeGrant = raw.bot_require_code_grant;
		}

		if(raw.terms_of_service_url) {
			this.termsOfServiceUrl = raw.terms_of_service_url;
		}

		if(raw.privacy_policy_url) {
			this.privacyPolicyUrl = raw.privacy_policy_url;
		}

		if(raw.owner) {
			this.owner = new User(this.client, raw.owner);
		}

		if(raw.team) {
			this.team = new Team(this.client, raw.team);
		}

		if(raw.guild_id) {
			this.guildId = raw.guild_id;
		}

		if(raw.slug) {
			this.slug = raw.slug;
		}

		if(raw.cover_image) {
			this.coverImage = raw.cover_image;
		}

		// @ts-ignore
		if(raw.flags) {
			// @ts-ignore
			this.flags = raw.flags;
		}

		if(raw.tags) {
			this.tags = raw.tags;
		}

		if(raw.install_params) {
			this.installParams = raw.install_params as any;
		}
	}
}

export { Application };