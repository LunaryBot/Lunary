import { Axios } from 'axios';
import EventEmitter from 'events';
import { REST } from '@discordjs/rest';

class Client extends EventEmitter {
    public rest: REST;
    private readonly token: string;

    constructor(token: string) {
        super();

        Object.defineProperty(this, 'token', {
            enumerable: false,
            value: token,
        });

        this.rest = new REST({ version: '10' }).setToken(this.token);

        this.rest.get('/oauth2/applications/@me').then(console.log);
    }
}

export default Client;