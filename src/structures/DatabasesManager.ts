import firebase from 'firebase';
import LunarClient from './LunarClient';

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

    static getData(key: string) {
        return Object.fromEntries(
            Object.entries(process.env)
                .filter(([k]) => keys.includes(`${k}`.replace(`${key}_`, '')))
                .map(([k, v]) => [k.replace(`${key}_`, ''), v])
        );
    }
}

export default DatabasesManager;