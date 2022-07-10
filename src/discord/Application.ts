import { RESTGetAPIOAuth2CurrentApplicationResult } from 'discord-api-types/v10';

import Team from './Team';
import User from './User';

import { TScope } from '../@types/discord.d';

class Application {
    public id: string;
    public name: string;
    public icon: string | null;
    public description: string;
    public rpc_origin?: Array<string>;
    public bot_public: boolean;
    public bot_require_code_grant: boolean;
    public terms_of_service_url?: string;
    public privacy_policy_url?: string;
    public owner?: User;
    public verify_key: string;
    public team?: Team;
    public guild_id?: string;
    public slug?: string;
    public cover_image?: string;
    public flags?: number;
    public tags?: Array<string>;
    public install_params?: {
        scopes: Array<TScope>;
        permissions: string;
    };

	constructor(data: RESTGetAPIOAuth2CurrentApplicationResult) {
        this.id = data.id;

        this.name = data.name;

        this.icon = data.icon;

        this.description = data.description;

        this.rpc_origin = data.rpc_origins;

        this.bot_public = data.bot_public;

        this.bot_require_code_grant = data.bot_require_code_grant;

        this.terms_of_service_url = data.terms_of_service_url;

        this.privacy_policy_url = data.privacy_policy_url;

        this.owner = data.owner ? new User(data.owner) : undefined;
    }
}

export default Application;