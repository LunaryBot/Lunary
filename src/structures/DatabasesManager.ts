import firebase from 'firebase';
import { User, Guild } from 'eris';
import LunarClient from './LunarClient';
import UserDB from './UserDB';
import GuildDB from './GuildDB';

const keys = ['apiKey', 'appId', 'authDomain', 'databaseURL', 'measurementId', 'messagingSenderId', 'projectId', 'storageBucket'];

class DatabasesManager {
    public declare client: LunarClient;
    public guilds: firebase.database.Database;
    public user: firebase.database.Database;
    public logs: firebase.database.Database;

    constructor(client: LunarClient) {
        this.guilds = this.initializeDatabase('GuildsDB');
        this.logs = this.initializeDatabase('LogsDB');
        this.user = this.initializeDatabase('UsersDB');

        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    }

    initializeDatabase(name: string): firebase.database.Database {
        let app = firebase.apps.find((app: firebase.app.App) => app.name == name);

        if(!app) {
            app = firebase.initializeApp(DatabasesManager.getData(name), name);
        };
        return app.database();
    }

    async getUser(user: string|User): Promise<UserDB> {
        if(typeof user == 'string') {
            user = this.client.users.get(user) || { id: user } as User;
        }

        user: User;

        const data = (await this.user.ref(`Users/${user.id}`).once('value')).val() || {};

        return new UserDB(user, data as any, this);
    }

    async getGuild(guild: string|Guild): Promise<GuildDB> {
        if(typeof guild == 'string') {
            guild = this.client.guilds.get(guild) || { id: guild } as Guild;
        }

        guild: Guild;

        const data = (await this.guilds.ref(`Servers/${guild.id}`).once('value')).val() || {};

        return new GuildDB(guild, data as any, this);
    }

    static getData(key: string) {
        return Object.fromEntries(
            Object.entries(process.env)
                .filter(([k]) => keys.includes(`${k}`.replace(`${key}_`, '')))
                .map(([k, v]) => [k.replace(`${key}_`, ''), v])
        );
    }
}

export default DatabasesManager;