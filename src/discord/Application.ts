import { RESTGetAPIOAuth2CurrentApplicationResult } from 'discord-api-types/v10';

import Team from './Team';

import { TScope } from '../@types/discord.d';

class Application {
    public id: string;
    public name: string;
    public icon?: string;
    public description: string;
    public rpc_origin?: Array<string>;
    public bot_public: boolean;
    public bot_require_code_grant: boolean;
    public terms_of_service_url?: boolean;
    public privacy_policy_url?: string;
    public owner?: any;
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
        this.id
    }
}