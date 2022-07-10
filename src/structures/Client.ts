import { Axios } from 'axios';
import EventEmitter from 'events';
import { REST } from '@discordjs/rest';
import { Application } from '../discord';
import { RESTGetAPIOAuth2CurrentApplicationResult } from 'discord-api-types/v10';

class Client extends EventEmitter {
    public rest: REST;
    public application: Application;
    private readonly _token: string;

    constructor(token: string) {
        super();

        Object.defineProperty(this, '_token', {
            enumerable: false,
            value: token,
        });

        this.application = null as any;

        this.rest = new REST({ version: '10' }).setToken(this._token);

        (this.rest.get('/oauth2/applications/@me') as Promise<RESTGetAPIOAuth2CurrentApplicationResult>).then(data => {
            this.application = new Application(data);
            console.log(this.application);
        });
        
    }
}

export default Client;